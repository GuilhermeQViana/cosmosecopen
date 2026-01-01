-- Criar tabela de convites para organizações
CREATE TABLE public.organization_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'analyst',
  invited_by uuid REFERENCES auth.users(id),
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Habilitar RLS
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Policies para convites
CREATE POLICY "Admins can manage invites for their org"
ON public.organization_invites
FOR ALL
USING (
  has_role(auth.uid(), 'admin') AND 
  user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Anyone can view invite by token"
ON public.organization_invites
FOR SELECT
USING (true);

-- Função para aceitar convite
CREATE OR REPLACE FUNCTION public.accept_organization_invite(_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.organization_invites
  WHERE token = _token
    AND accepted_at IS NULL
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;
  
  -- Verificar se o email do usuário corresponde ao convite
  IF (SELECT email FROM auth.users WHERE id = current_user_id) != invite_record.email THEN
    RAISE EXCEPTION 'This invite was sent to a different email address';
  END IF;
  
  -- Criar role para o usuário na organização
  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (current_user_id, invite_record.organization_id, invite_record.role)
  ON CONFLICT (user_id, organization_id) DO NOTHING;
  
  -- Marcar convite como aceito
  UPDATE public.organization_invites
  SET accepted_at = now()
  WHERE id = invite_record.id;
  
  RETURN true;
END;
$$;

-- Adicionar constraint unique na tabela user_roles para evitar duplicatas
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_org_unique UNIQUE (user_id, organization_id);

-- Função para sair de uma organização
CREATE OR REPLACE FUNCTION public.leave_organization(_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  admin_count INTEGER;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Verificar se é o único admin
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE organization_id = _org_id AND role = 'admin';
  
  IF admin_count = 1 AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE organization_id = _org_id 
    AND user_id = current_user_id 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Cannot leave organization as the only admin. Transfer admin role first.';
  END IF;
  
  -- Remover role do usuário
  DELETE FROM public.user_roles
  WHERE user_id = current_user_id AND organization_id = _org_id;
  
  -- Se era a organização ativa, limpar do perfil
  UPDATE public.profiles
  SET organization_id = NULL
  WHERE id = current_user_id AND organization_id = _org_id;
  
  RETURN true;
END;
$$;