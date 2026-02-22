
-- Drop the view first since it depends on the columns
DROP VIEW IF EXISTS public.organizations_safe;

-- Remove Stripe-related columns from organizations
ALTER TABLE public.organizations DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE public.organizations DROP COLUMN IF EXISTS stripe_subscription_id;
ALTER TABLE public.organizations DROP COLUMN IF EXISTS subscription_status;
ALTER TABLE public.organizations DROP COLUMN IF EXISTS trial_ends_at;
ALTER TABLE public.organizations DROP COLUMN IF EXISTS subscription_ends_at;

-- Recreate organizations_safe view without Stripe fields
CREATE VIEW public.organizations_safe
WITH (security_invoker = on) AS
  SELECT id, name, description, logo_url, created_at, updated_at
  FROM public.organizations;

-- Simplify check_organization_access to always return true
CREATE OR REPLACE FUNCTION public.check_organization_access(_org_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.organizations WHERE id = _org_id);
END; $$;
