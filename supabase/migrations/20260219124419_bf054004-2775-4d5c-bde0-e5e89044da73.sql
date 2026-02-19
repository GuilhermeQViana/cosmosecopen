
-- Fix storage policies for 'evidences' bucket: replace auth-only check with org membership check

-- DROP existing overly permissive policies for evidences
DROP POLICY IF EXISTS "Users can view evidences in their org" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload evidences" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their evidences" ON storage.objects;

-- DROP existing overly permissive policies for vendor-evidences
DROP POLICY IF EXISTS "Users can view vendor evidences" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload vendor evidences" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete vendor evidences" ON storage.objects;

-- Create org-scoped policies for evidences bucket
CREATE POLICY "Users can view evidences in their org"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'evidences'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can upload evidences"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'evidences'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can delete their evidences"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'evidences'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND organization_id::text = (storage.foldername(name))[1]
    )
  );

-- Create org-scoped policies for vendor-evidences bucket
CREATE POLICY "Users can view vendor evidences"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vendor-evidences'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can upload vendor evidences"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-evidences'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can delete vendor evidences"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vendor-evidences'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND organization_id::text = (storage.foldername(name))[1]
    )
  );
