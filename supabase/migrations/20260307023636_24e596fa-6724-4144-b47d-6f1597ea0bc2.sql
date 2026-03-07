-- Allow anyone to update questions (for setting image_url after generation)
CREATE POLICY "Anyone can update questions"
ON public.questions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow inserting into metaphor_images (for edge function to store generated images)
CREATE POLICY "Anyone can insert metaphor_images"
ON public.metaphor_images
FOR INSERT
WITH CHECK (true);