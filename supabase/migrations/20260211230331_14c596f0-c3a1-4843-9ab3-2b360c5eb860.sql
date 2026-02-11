
-- Tabela vendor_offboarding
CREATE TABLE public.vendor_offboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT 'fim_contrato',
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  initiated_by UUID,
  status TEXT NOT NULL DEFAULT 'iniciado',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vendor_offboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage org offboarding" ON public.vendor_offboarding
  FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can view org offboarding" ON public.vendor_offboarding
  FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));

-- Tabela vendor_offboarding_tasks
CREATE TABLE public.vendor_offboarding_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offboarding_id UUID NOT NULL REFERENCES public.vendor_offboarding(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  completed_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  observations TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vendor_offboarding_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage offboarding tasks" ON public.vendor_offboarding_tasks
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.vendor_offboarding o
    WHERE o.id = vendor_offboarding_tasks.offboarding_id
    AND user_belongs_to_org(auth.uid(), o.organization_id)
  ));

CREATE POLICY "Users can view offboarding tasks" ON public.vendor_offboarding_tasks
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.vendor_offboarding o
    WHERE o.id = vendor_offboarding_tasks.offboarding_id
    AND user_belongs_to_org(auth.uid(), o.organization_id)
  ));

-- Tabela vendor_portal_tokens para Self-Assessment
CREATE TABLE public.vendor_portal_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  scope TEXT NOT NULL DEFAULT 'assessment',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  vendor_response JSONB,
  status TEXT NOT NULL DEFAULT 'pendente'
);

ALTER TABLE public.vendor_portal_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage org portal tokens" ON public.vendor_portal_tokens
  FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can view org portal tokens" ON public.vendor_portal_tokens
  FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
