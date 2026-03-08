-- Allow admins to upload to the documents bucket
CREATE POLICY "Admins can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND public.is_admin(auth.uid())
);

-- Allow admins to read from the documents bucket
CREATE POLICY "Admins can read documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND public.is_admin(auth.uid())
);

-- Allow admins to delete from the documents bucket
CREATE POLICY "Admins can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND public.is_admin(auth.uid())
);