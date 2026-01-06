-- Create super_admins table for global superadmin identification
CREATE TABLE public.super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on super_admins
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Only superadmins can view the super_admins table
CREATE POLICY "Superadmins can view super_admins" ON public.super_admins
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins
    WHERE user_id = check_user_id
  )
$$;

-- Insert initial superadmin
INSERT INTO public.super_admins (user_id)
SELECT id FROM auth.users WHERE email = 'guiqueirozviana@gmail.com'
ON CONFLICT DO NOTHING;

-- Create feedbacks table
CREATE TABLE public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  module TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  liked TEXT,
  suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on feedbacks
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON public.feedbacks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON public.feedbacks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Superadmins can view all feedbacks
CREATE POLICY "Superadmins can view all feedbacks" ON public.feedbacks
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));