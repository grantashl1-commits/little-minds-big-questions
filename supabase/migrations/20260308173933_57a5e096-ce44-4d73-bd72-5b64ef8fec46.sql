
-- Child profiles table
CREATE TABLE public.child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  age integer,
  avatar_emoji text DEFAULT '🦋',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own child_profiles" ON public.child_profiles FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Link questions to child profiles
ALTER TABLE public.questions ADD COLUMN child_profile_id uuid REFERENCES public.child_profiles(id);

-- Weekly questions table
CREATE TABLE public.weekly_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  story text NOT NULL,
  story_title text,
  image_url text,
  week_start date NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.weekly_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read weekly_questions" ON public.weekly_questions FOR SELECT USING (true);
CREATE POLICY "Admins can manage weekly_questions" ON public.weekly_questions FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
