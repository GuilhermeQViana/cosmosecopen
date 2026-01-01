-- 1. Atualizar RLS da tabela organizations para usar user_roles
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;

CREATE POLICY "Users can view organizations where they have a role"
ON public.organizations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.organization_id = organizations.id
    AND user_roles.user_id = auth.uid()
  )
);

-- 2. Criar função RPC para obter todas as organizações do usuário com seus roles
CREATE OR REPLACE FUNCTION public.get_user_organizations()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  logo_url text,
  created_at timestamptz,
  updated_at timestamptz,
  role app_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id,
    o.name,
    o.description,
    o.logo_url,
    o.created_at,
    o.updated_at,
    ur.role
  FROM public.organizations o
  INNER JOIN public.user_roles ur ON ur.organization_id = o.id
  WHERE ur.user_id = auth.uid()
  ORDER BY o.name;
$$;

-- 3. Criar função RPC para definir organização ativa
CREATE OR REPLACE FUNCTION public.set_active_organization(_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_access boolean;
BEGIN
  -- Verificar se o usuário tem role nessa organização
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND organization_id = _org_id
  ) INTO has_access;
  
  IF NOT has_access THEN
    RAISE EXCEPTION 'User does not have access to this organization';
  END IF;
  
  -- Atualizar o perfil do usuário
  UPDATE public.profiles
  SET organization_id = _org_id
  WHERE id = auth.uid();
  
  RETURN true;
END;
$$;

-- 4. Atualizar create_organization_with_admin para não atualizar profiles automaticamente
-- (o usuário escolherá a organização ativa separadamente)
CREATE OR REPLACE FUNCTION public.create_organization_with_admin(org_name text, org_description text DEFAULT NULL::text)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org public.organizations;
  current_user_id UUID;
  user_has_org boolean;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Insert organization
  INSERT INTO public.organizations (name, description)
  VALUES (org_name, org_description)
  RETURNING * INTO new_org;
  
  -- Create admin role for user
  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (current_user_id, new_org.id, 'admin');
  
  -- Verificar se o usuário já tem uma organização ativa
  SELECT organization_id IS NOT NULL INTO user_has_org
  FROM public.profiles
  WHERE id = current_user_id;
  
  -- Se for a primeira organização, definir como ativa automaticamente
  IF NOT user_has_org THEN
    UPDATE public.profiles
    SET organization_id = new_org.id
    WHERE id = current_user_id;
  END IF;
  
  RETURN new_org;
END;
$$;