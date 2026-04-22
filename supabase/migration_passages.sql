-- ============================================================
-- MIGRATION: Add passages table for reading & listening groups
-- Run once in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. PASSAGES TABLE
CREATE TABLE IF NOT EXISTS passages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT,
  type       TEXT NOT NULL CHECK (type IN ('reading','listening')),
  level      TEXT DEFAULT 'B1' CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  content    TEXT,      -- full article text for reading passages
  audio_url  TEXT,      -- hosted audio URL for listening passages
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FK COLUMN ON QUESTIONS
ALTER TABLE questions ADD COLUMN IF NOT EXISTS passage_id UUID REFERENCES passages(id);
CREATE INDEX IF NOT EXISTS idx_questions_passage ON questions(passage_id);

-- 3. RLS FOR PASSAGES
ALTER TABLE passages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='passages' AND policyname='passages_anon_read'
  ) THEN
    CREATE POLICY "passages_anon_read" ON passages FOR SELECT USING (active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='passages' AND policyname='passages_admin_all'
  ) THEN
    CREATE POLICY "passages_admin_all" ON passages FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

GRANT SELECT ON passages TO anon, authenticated;

-- 4. MIGRATE EXISTING INLINE PASSAGE DATA → passages table
DO $$
DECLARE v_pid UUID;
BEGIN
  -- Only migrate if passage_id column is empty for these rows
  IF EXISTS (SELECT 1 FROM questions WHERE passage LIKE '%Scientists have developed a new material%' AND passage_id IS NULL) THEN
    INSERT INTO passages (title, type, level, content)
    VALUES (
      'Temperature-Responsive Materials',
      'reading', 'B1',
      'Scientists have developed a new material that can change color based on temperature. This innovation could revolutionize clothing design, allowing jackets to adapt to weather conditions automatically. The material uses special pigments that react to heat, becoming lighter in warm conditions and darker when cold.'
    ) RETURNING id INTO v_pid;

    UPDATE questions SET passage_id = v_pid, passage = NULL
    WHERE passage LIKE '%Scientists have developed a new material%';
  END IF;
END $$;

DO $$
DECLARE v_pid UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM questions WHERE passage LIKE '%Dr. Sarah Mitchell%' AND passage_id IS NULL) THEN
    INSERT INTO passages (title, type, level, content)
    VALUES (
      'The Science of Sleep',
      'reading', 'B2',
      E'Dr. Sarah Mitchell has been studying sleep patterns for over fifteen years. Her latest research shows that many adults are not getting enough quality sleep, and this is affecting their health in serious ways. "People think they can function normally on five or six hours of sleep, but our bodies need seven to nine hours for proper recovery," she explains.\n\nPoor sleep doesn\'t just make us tired — it weakens our immune system, makes it harder to concentrate, and can even lead to weight gain. Dr. Mitchell recommends creating a bedtime routine, avoiding screens for an hour before sleep, and keeping bedrooms cool and dark.'
    ) RETURNING id INTO v_pid;

    UPDATE questions SET passage_id = v_pid, passage = NULL
    WHERE passage LIKE '%Dr. Sarah Mitchell%';
  END IF;
END $$;

-- 5. REBUILD public_questions VIEW (includes passage data via JOIN)
DROP VIEW IF EXISTS public_questions;

CREATE VIEW public_questions AS
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

GRANT SELECT ON public_questions TO anon, authenticated;
