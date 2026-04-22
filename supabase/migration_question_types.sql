-- ============================================================
-- MIGRATION: Add true_false + fill_blank question type support
-- Run once in Supabase SQL Editor
-- ============================================================

-- 1. Add fill_answer column (stores text answer for fill_blank questions)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS fill_answer TEXT;

-- 2. Expand type constraint to include true_false
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check
  CHECK (type IN ('multiple_choice','fill_blank','reading','listening','true_false'));

-- 3. Make correct_answer nullable (fill_blank questions use fill_answer instead)
ALTER TABLE questions ALTER COLUMN correct_answer DROP NOT NULL;
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_correct_answer_check;
ALTER TABLE questions ADD CONSTRAINT questions_correct_answer_check
  CHECK (correct_answer IN ('A','B','C','D') OR correct_answer IS NULL);

-- 4. Rebuild public_questions view — no changes to columns needed
--    (fill_answer is intentionally NOT exposed; type already included)

-- 5. Update submit_test to score fill_blank questions by text match
CREATE OR REPLACE FUNCTION submit_test(
  p_name        TEXT,
  p_phone       TEXT,
  p_email       TEXT,
  p_test_type   TEXT,
  p_started_at  TIMESTAMPTZ,
  p_duration_sec INT,
  p_answers     JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id    UUID;
  v_session_id    UUID;
  v_q             RECORD;
  v_sections      JSONB := '{}';
  v_sec           JSONB;
  v_total_correct INT := 0;
  v_total_q       INT := 0;
  v_answer        TEXT;
  v_is_correct    BOOLEAN;
  v_band          TEXT;
BEGIN
  INSERT INTO students (full_name, phone, email)
  VALUES (p_name, p_phone, NULLIF(p_email,''))
  ON CONFLICT (phone) DO UPDATE
    SET full_name  = EXCLUDED.full_name,
        email      = COALESCE(NULLIF(EXCLUDED.email,''), students.email),
        updated_at = NOW()
  RETURNING id INTO v_student_id;

  FOR v_q IN
    SELECT q.id, q.section, q.type, q.correct_answer, q.fill_answer
    FROM questions q
    WHERE q.active = true
      AND q.id::text = ANY(ARRAY(SELECT jsonb_object_keys(p_answers)))
  LOOP
    v_answer := p_answers ->> v_q.id::text;

    IF v_q.type = 'fill_blank' THEN
      v_is_correct := v_q.fill_answer IS NOT NULL
        AND lower(trim(v_answer)) = lower(trim(v_q.fill_answer));
    ELSE
      v_is_correct := v_q.correct_answer IS NOT NULL
        AND upper(v_answer) = v_q.correct_answer;
    END IF;

    IF v_is_correct THEN v_total_correct := v_total_correct + 1; END IF;
    v_total_q := v_total_q + 1;

    v_sec := COALESCE(v_sections -> v_q.section,
              jsonb_build_object('correct', 0, 'total', 0));
    v_sec := jsonb_set(v_sec, '{total}',   to_jsonb((v_sec->>'total')::int + 1));
    IF v_is_correct THEN
      v_sec := jsonb_set(v_sec, '{correct}', to_jsonb((v_sec->>'correct')::int + 1));
    END IF;
    v_sections := v_sections || jsonb_build_object(v_q.section, v_sec);
  END LOOP;

  v_band := calculate_band(v_total_correct, v_total_q);

  INSERT INTO test_sessions (
    student_id, test_type, started_at, duration_sec,
    band_score, total_correct, total_questions, section_scores, answers
  ) VALUES (
    v_student_id, p_test_type, p_started_at, p_duration_sec,
    v_band, v_total_correct, v_total_q, v_sections, p_answers
  ) RETURNING id INTO v_session_id;

  UPDATE students
  SET test_count   = test_count + 1,
      latest_band  = v_band,
      last_test_at = NOW(),
      updated_at   = NOW()
  WHERE id = v_student_id;

  RETURN jsonb_build_object(
    'session_id',       v_session_id,
    'band',             v_band,
    'total_correct',    v_total_correct,
    'total_questions',  v_total_q,
    'sections',         v_sections
  );
END;
$$;
