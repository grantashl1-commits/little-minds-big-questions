-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL CHECK (child_age >= 2 AND child_age <= 10),
  age_group TEXT NOT NULL,
  question_text TEXT NOT NULL,
  context TEXT,
  parent_note TEXT,
  metaphor_title TEXT NOT NULL,
  metaphor_answer TEXT NOT NULL,
  parent_explanation TEXT NOT NULL,
  image_prompt TEXT,
  image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create themes table
CREATE TABLE public.themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- Create question_themes junction table
CREATE TABLE public.question_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  UNIQUE(question_id, theme_id)
);

-- Create analytics table
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE UNIQUE,
  views INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  search_hits INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Questions: anyone can read public, anyone can insert
CREATE POLICY "Anyone can read public questions" ON public.questions FOR SELECT USING (is_public = true);
CREATE POLICY "Anyone can insert questions" ON public.questions FOR INSERT WITH CHECK (true);

-- Themes: anyone can read
CREATE POLICY "Anyone can read themes" ON public.themes FOR SELECT USING (true);

-- Question themes: anyone can read, anyone can insert
CREATE POLICY "Anyone can read question_themes" ON public.question_themes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert question_themes" ON public.question_themes FOR INSERT WITH CHECK (true);

-- Analytics: anyone can read, anyone can insert/update
CREATE POLICY "Anyone can read analytics" ON public.analytics FOR SELECT USING (true);
CREATE POLICY "Anyone can insert analytics" ON public.analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update analytics" ON public.analytics FOR UPDATE USING (true);

-- Seed default themes
INSERT INTO public.themes (theme_name, slug) VALUES
  ('Death & Dying', 'death-dying'),
  ('Grief & Loss', 'grief-loss'),
  ('Feelings', 'feelings'),
  ('Friendship', 'friendship'),
  ('Identity', 'identity'),
  ('Family Changes', 'family-change'),
  ('School & Confidence', 'school-confidence'),
  ('Kindness', 'kindness'),
  ('Bodies & Differences', 'bodies'),
  ('Spirituality', 'spirituality'),
  ('Worry & Anxiety', 'worry-anxiety'),
  ('Babies & Birth', 'babies-birth');

-- Create indexes for search
CREATE INDEX idx_questions_public ON public.questions(is_public, created_at DESC);
CREATE INDEX idx_questions_age_group ON public.questions(age_group);
CREATE INDEX idx_question_themes_question ON public.question_themes(question_id);
CREATE INDEX idx_question_themes_theme ON public.question_themes(theme_id);