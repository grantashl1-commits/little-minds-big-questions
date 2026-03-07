-- Add voice/audio fields to questions table
ALTER TABLE public.questions ADD COLUMN audio_url TEXT;
ALTER TABLE public.questions ADD COLUMN transcription TEXT;
ALTER TABLE public.questions ADD COLUMN audio_uploaded BOOLEAN NOT NULL DEFAULT false;

-- Create content_assets table
CREATE TABLE public.content_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('question_tile', 'story_tile', 'carousel_slide_1', 'carousel_slide_2', 'carousel_slide_3', 'carousel_slide_4')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read content_assets" ON public.content_assets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert content_assets" ON public.content_assets FOR INSERT WITH CHECK (true);

CREATE INDEX idx_content_assets_question ON public.content_assets(question_id);

-- Create audio storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-recordings', 'audio-recordings', true);

CREATE POLICY "Anyone can upload audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio-recordings');
CREATE POLICY "Anyone can read audio" ON storage.objects FOR SELECT USING (bucket_id = 'audio-recordings');

-- Also allow reading private questions by their ID (for result page)
CREATE POLICY "Anyone can read own question by id" ON public.questions FOR SELECT USING (true);