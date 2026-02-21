
-- Item 4: Rewrite accept_organization_invite with full validation
CREATE OR REPLACE FUNCTION public.accept_organization_invite(_token uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_record RECORD;
  current_user_id UUID;
  current_user_email TEXT;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get current user email
  SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
  
  -- Fetch invite by token
  SELECT * INTO invite_record
  FROM public.organization_invites
  WHERE token = _token;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado';
  END IF;

  -- Check if already accepted
  IF invite_record.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Este convite já foi aceito';
  END IF;

  -- Check if expired
  IF invite_record.expires_at < now() THEN
    RAISE EXCEPTION 'Este convite expirou';
  END IF;
  
  -- Verify email matches
  IF current_user_email != invite_record.email THEN
    RAISE EXCEPTION 'Este convite foi enviado para outro e-mail';
  END IF;
  
  -- Create role for user in the organization
  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (current_user_id, invite_record.organization_id, invite_record.role)
  ON CONFLICT (user_id, organization_id) DO NOTHING;
  
  -- Mark invite as accepted
  UPDATE public.organization_invites
  SET accepted_at = now()
  WHERE id = invite_record.id;
  
  RETURN true;
END;
$function$;

-- Item 5: Create generated_reports table for report history
CREATE TABLE IF NOT EXISTS public.generated_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  framework_id UUID REFERENCES public.frameworks(id) ON DELETE SET NULL,
  period TEXT,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org reports"
ON public.generated_reports
FOR SELECT
USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can insert org reports"
ON public.generated_reports
FOR INSERT
WITH CHECK (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Admins can delete org reports"
ON public.generated_reports
FOR DELETE
USING (user_belongs_to_org(auth.uid(), organization_id) AND has_role(auth.uid(), 'admin'::app_role));
