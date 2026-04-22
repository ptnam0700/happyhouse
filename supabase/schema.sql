-- ============================================================
-- HAPPYHOUSE IELTS PLATFORM — SUPABASE SCHEMA
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS passages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT,
  type       TEXT NOT NULL CHECK (type IN ('reading','listening')),
  level      TEXT DEFAULT 'B1' CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  content    TEXT,      -- full article text for reading
  audio_url  TEXT,      -- hosted audio URL for listening
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section        TEXT NOT NULL CHECK (section IN ('grammar','vocabulary','reading','listening')),
  type           TEXT NOT NULL DEFAULT 'multiple_choice'
                   CHECK (type IN ('multiple_choice','fill_blank','reading','listening')),
  level          TEXT DEFAULT 'B1'
                   CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  question_text  TEXT NOT NULL,
  passage_id     UUID REFERENCES passages(id),   -- links to shared passage/audio
  audio_url      TEXT,                            -- per-question audio (standalone listening)
  option_a       TEXT,
  option_b       TEXT,
  option_c       TEXT,
  option_d       TEXT,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  explanation    TEXT,
  topic_tags     TEXT[],
  active         BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name    TEXT NOT NULL,
  phone        TEXT NOT NULL,
  email        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  test_count   INT DEFAULT 0,
  latest_band  TEXT,
  last_test_at TIMESTAMPTZ,
  UNIQUE (phone)
);

CREATE TABLE IF NOT EXISTS test_sessions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
  test_type       TEXT NOT NULL CHECK (test_type IN ('mini','full')),
  started_at      TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  duration_sec    INT,
  band_score      TEXT,
  total_correct   INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  section_scores  JSONB DEFAULT '{}',
  answers         JSONB DEFAULT '{}'
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_questions_section_active ON questions(section, active);
CREATE INDEX IF NOT EXISTS idx_questions_passage        ON questions(passage_id);
CREATE INDEX IF NOT EXISTS idx_students_phone           ON students(phone);
CREATE INDEX IF NOT EXISTS idx_sessions_student         ON test_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_submitted       ON test_sessions(submitted_at DESC);

-- ============================================================
-- PUBLIC VIEW (no correct_answer exposed to anon)
-- Joins questions with passages so client gets passage content
-- ============================================================

CREATE OR REPLACE VIEW public_questions AS
  SELECT
    q.id,
    q.section,
    q.type,
    q.level,
    q.question_text,
    q.passage_id,
    p.title        AS passage_title,
    p.content      AS passage_content,
    p.audio_url    AS passage_audio_url,
    q.audio_url    AS question_audio_url,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d
  FROM questions q
  LEFT JOIN passages p ON p.id = q.passage_id
  WHERE q.active = true;

-- ============================================================
-- SCORING HELPER
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_band(correct INT, total INT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE scaled INT;
BEGIN
  IF total = 0 THEN RETURN 'Below 3.5'; END IF;
  scaled := ROUND(correct::NUMERIC / total * 30);
  IF    scaled >= 27 THEN RETURN '6.5 – 7.0';
  ELSIF scaled >= 23 THEN RETURN '5.5 – 6.0';
  ELSIF scaled >= 18 THEN RETURN '4.5 – 5.0';
  ELSIF scaled >= 13 THEN RETURN '3.5 – 4.0';
  ELSE                     RETURN 'Below 3.5';
  END IF;
END;
$$;

-- ============================================================
-- SUBMIT TEST — scores server-side, saves student + session
-- ============================================================

CREATE OR REPLACE FUNCTION submit_test(
  p_name        TEXT,
  p_phone       TEXT,
  p_email       TEXT,
  p_test_type   TEXT,
  p_started_at  TIMESTAMPTZ,
  p_duration_sec INT,
  p_answers     JSONB  -- {"<question_uuid>": "A"|"B"|"C"|"D", ...}
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
  -- Upsert student
  INSERT INTO students (full_name, phone, email)
  VALUES (p_name, p_phone, NULLIF(p_email,''))
  ON CONFLICT (phone) DO UPDATE
    SET full_name  = EXCLUDED.full_name,
        email      = COALESCE(NULLIF(EXCLUDED.email,''), students.email),
        updated_at = NOW()
  RETURNING id INTO v_student_id;

  -- Score each answer
  FOR v_q IN
    SELECT q.id, q.section, q.correct_answer
    FROM questions q
    WHERE q.active = true
      AND q.id::text = ANY(ARRAY(SELECT jsonb_object_keys(p_answers)))
  LOOP
    v_answer     := p_answers ->> v_q.id::text;
    v_is_correct := (upper(v_answer) = v_q.correct_answer);

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

GRANT EXECUTE ON FUNCTION submit_test TO anon;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE passages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "passages_anon_read"   ON passages  FOR SELECT USING (active = true);
CREATE POLICY "passages_admin_all"   ON passages  FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "questions_anon_read"  ON questions FOR SELECT USING (active = true);
CREATE POLICY "questions_admin_all"  ON questions FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "students_anon_insert" ON students FOR INSERT  WITH CHECK (true);
CREATE POLICY "students_admin_all"   ON students FOR ALL     USING (auth.role() = 'authenticated');

CREATE POLICY "sessions_anon_insert" ON test_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "sessions_admin_all"   ON test_sessions FOR ALL    USING (auth.role() = 'authenticated');

GRANT SELECT ON passages        TO anon, authenticated;
GRANT SELECT ON public_questions TO anon, authenticated;
