
-- Add safety_flags column to questions table
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS safety_flags jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Create parent_scripts table
CREATE TABLE IF NOT EXISTS public.parent_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  age_segment text NOT NULL DEFAULT 'all',
  what_to_say text NOT NULL,
  what_to_avoid text NOT NULL,
  resource_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(theme, age_segment)
);
ALTER TABLE public.parent_scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read parent_scripts" ON public.parent_scripts FOR SELECT USING (true);

-- Create shares table for anonymized public links
CREATE TABLE IF NOT EXISTS public.shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  public_slug text NOT NULL UNIQUE,
  redacted boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shares by slug" ON public.shares FOR SELECT USING (true);
CREATE POLICY "Users can insert own shares" ON public.shares FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own shares" ON public.shares FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Create events table for analytics
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  question_id uuid,
  theme text,
  age_segment text,
  safety_flags jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read events" ON public.events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
