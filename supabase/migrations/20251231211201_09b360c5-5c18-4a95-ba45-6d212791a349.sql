-- Create function to atomically create organization with admin role
CREATE OR REPLACE FUNCTION public.create_organization_with_admin(
  org_name TEXT,
  org_description TEXT DEFAULT NULL
)
RETURNS public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org public.organizations;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Insert organization
  INSERT INTO public.organizations (name, description)
  VALUES (org_name, org_description)
  RETURNING * INTO new_org;
  
  -- Update user profile with organization
  UPDATE public.profiles
  SET organization_id = new_org.id
  WHERE id = current_user_id;
  
  -- Create admin role for user
  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (current_user_id, new_org.id, 'admin');
  
  RETURN new_org;
END;
$$;