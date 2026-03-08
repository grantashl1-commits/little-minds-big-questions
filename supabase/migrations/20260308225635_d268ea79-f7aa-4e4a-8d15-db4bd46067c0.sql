
-- 1. Create public_questions table
CREATE TABLE public.public_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_question text NOT NULL,
  normalized_question text NOT NULL UNIQUE,
  theme text,
  age_band text,
  featured_story_id uuid REFERENCES public.questions(id) ON DELETE SET NULL,
  public_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.public_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public_questions" ON public.public_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert public_questions" ON public.public_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update public_questions" ON public.public_questions FOR UPDATE USING (true) WITH CHECK (true);

-- 2. Add normalized_question to questions table
ALTER TABLE public.questions ADD COLUMN normalized_question text;

-- 3. Create normalization function
CREATE OR REPLACE FUNCTION public.normalize_question(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(regexp_replace(
    regexp_replace(
      lower(trim(input)),
      '[?.!,;:"''\-]+', '', 'g'
    ),
    '\s+', ' ', 'g'
  ))
$$;

-- 4. Create trigger to auto-normalize on insert/update
CREATE OR REPLACE FUNCTION public.auto_normalize_question()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.normalized_question := public.normalize_question(NEW.question_text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_normalize_question
  BEFORE INSERT OR UPDATE OF question_text ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_normalize_question();

-- 5. Create trigger to upsert public_questions on question insert
CREATE OR REPLACE FUNCTION public.handle_public_question()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  norm text;
  existing_id uuid;
BEGIN
  IF NOT NEW.is_public THEN
    RETURN NEW;
  END IF;

  norm := public.normalize_question(NEW.question_text);

  SELECT id INTO existing_id FROM public.public_questions WHERE normalized_question = norm;

  IF existing_id IS NOT NULL THEN
    UPDATE public.public_questions SET public_count = public_count + 1 WHERE id = existing_id;
  ELSE
    INSERT INTO public.public_questions (canonical_question, normalized_question, theme, age_band, featured_story_id)
    VALUES (NEW.question_text, norm, NULL, NEW.age_group, NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_handle_public_question
  AFTER INSERT ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_public_question();

-- 6. Backfill existing data
UPDATE public.questions SET normalized_question = public.normalize_question(question_text);

INSERT INTO public.public_questions (canonical_question, normalized_question, theme, age_band, featured_story_id, public_count)
SELECT DISTINCT ON (sub.normalized_question)
  sub.question_text,
  sub.normalized_question,
  NULL,
  sub.age_group,
  sub.id,
  sub.cnt
FROM (
  SELECT q.*, COUNT(*) OVER (PARTITION BY q.normalized_question) as cnt
  FROM public.questions q
  WHERE q.is_public = true AND q.normalized_question IS NOT NULL
) sub
ORDER BY sub.normalized_question, sub.created_at ASC
ON CONFLICT (normalized_question) DO NOTHING;
