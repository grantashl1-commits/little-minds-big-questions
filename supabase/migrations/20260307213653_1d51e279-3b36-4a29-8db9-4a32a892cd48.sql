
ALTER TABLE public.questions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE POLICY "Users can delete own questions"
ON public.questions FOR DELETE TO authenticated
USING (user_id = auth.uid());
