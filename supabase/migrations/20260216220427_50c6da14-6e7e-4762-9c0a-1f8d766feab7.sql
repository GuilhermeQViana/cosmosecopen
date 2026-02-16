
-- 1. Create safe view excluding Stripe fields
CREATE VIEW public.organizations_safe
WITH (security_invoker = on) AS
  SELECT id, name, description, logo_url, created_at, updated_at,
         trial_ends_at, subscription_status, subscription_ends_at
  FROM public.organizations;

-- 2. Restrict direct SELECT on organizations to admins only
-- (non-admin reads go through SECURITY DEFINER RPCs like get_user_organizations)
DROP POLICY "Users can view organizations where they have a role" ON public.organizations;
CREATE POLICY "Admins can view organizations directly"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles
            WHERE organization_id = organizations.id
            AND user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

-- 3. Fix INSERT policy - replace WITH CHECK (true)
DROP POLICY "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Restrict vendor_portal_tokens to admins only
DROP POLICY "Users can manage org portal tokens" ON public.vendor_portal_tokens;
CREATE POLICY "Admins can manage org portal tokens"
  ON public.vendor_portal_tokens FOR ALL
  USING (
    user_belongs_to_org(auth.uid(), organization_id)
    AND has_role(auth.uid(), 'admin')
  );
