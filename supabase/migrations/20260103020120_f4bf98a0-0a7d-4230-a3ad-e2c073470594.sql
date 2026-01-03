-- Adicionar campos de trial e subscription na tabela organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Criar função para verificar se organização tem acesso ativo
CREATE OR REPLACE FUNCTION public.check_organization_access(_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  org_record RECORD;
BEGIN
  SELECT trial_ends_at, subscription_status, subscription_ends_at
  INTO org_record
  FROM public.organizations
  WHERE id = _org_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Acesso ativo se:
  -- 1. Está em trial e trial não expirou
  -- 2. Subscription está ativa
  IF org_record.subscription_status = 'trialing' AND org_record.trial_ends_at > now() THEN
    RETURN true;
  END IF;
  
  IF org_record.subscription_status = 'active' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Atualizar organizações existentes para terem trial de 7 dias a partir de agora
UPDATE public.organizations
SET trial_ends_at = now() + interval '7 days',
    subscription_status = 'trialing'
WHERE trial_ends_at IS NULL;