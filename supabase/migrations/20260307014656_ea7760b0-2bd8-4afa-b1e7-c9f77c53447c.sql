INSERT INTO storage.buckets (id, name, public) VALUES ('metaphor-images', 'metaphor-images', true);

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'metaphor-images');

-- Allow authenticated users to upload images (for initial seeding)
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'metaphor-images' AND auth.role() = 'authenticated');

CREATE TABLE public.metaphor_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  public_url TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.metaphor_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read" ON public.metaphor_images FOR SELECT USING (true);
