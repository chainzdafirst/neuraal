
-- Allow admins to view all documents
CREATE POLICY "Admins can view all documents"
ON public.documents
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to view all quizzes
CREATE POLICY "Admins can view all quizzes"
ON public.quizzes
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to view all flashcards
CREATE POLICY "Admins can view all flashcards"
ON public.flashcards
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to view all study progress
CREATE POLICY "Admins can view all study progress"
ON public.study_progress
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to view all chat messages
CREATE POLICY "Admins can view all chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));
