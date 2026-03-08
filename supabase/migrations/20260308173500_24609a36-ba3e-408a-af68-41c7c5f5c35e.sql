
CREATE TABLE public.audio_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  voice_mode text NOT NULL,
  audio_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(question_id, voice_mode)
);

ALTER TABLE public.audio_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read audio_cache" ON public.audio_cache FOR SELECT USING (true);
CREATE POLICY "Anyone can insert audio_cache" ON public.audio_cache FOR INSERT WITH CHECK (true);
