-- Create storage bucket for avatars and logos
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for logos bucket (organization admins only)
CREATE POLICY "Logo images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Admins can upload organization logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.organization_id::text = (storage.foldername(name))[1]
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can update organization logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.organization_id::text = (storage.foldername(name))[1]
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can delete organization logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.organization_id::text = (storage.foldername(name))[1]
    AND ur.role = 'admin'
  )
);