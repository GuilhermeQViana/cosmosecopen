
-- Create private bucket for vendor contracts
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-contracts', 'vendor-contracts', false);

-- Allow authenticated users to upload files to their org folder
CREATE POLICY "Users can upload vendor contracts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vendor-contracts'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

-- Allow authenticated users to read files from their org folder
CREATE POLICY "Users can read vendor contracts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vendor-contracts'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

-- Allow authenticated users to delete files from their org folder
CREATE POLICY "Users can delete vendor contracts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vendor-contracts'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()
  )
);
