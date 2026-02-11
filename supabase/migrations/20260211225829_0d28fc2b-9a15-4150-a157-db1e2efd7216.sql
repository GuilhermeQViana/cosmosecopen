
-- Phase 2A: Vendor Contracts
CREATE TABLE public.vendor_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  contract_number TEXT,
  contract_type TEXT NOT NULL DEFAULT 'servico',
  start_date DATE,
  end_date DATE,
  renewal_date DATE,
  value NUMERIC,
  currency TEXT NOT NULL DEFAULT 'BRL',
  billing_frequency TEXT,
  auto_renewal BOOLEAN DEFAULT false,
  security_clauses BOOLEAN DEFAULT false,
  lgpd_clauses BOOLEAN DEFAULT false,
  sla_defined BOOLEAN DEFAULT false,
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vendor_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org contracts" ON public.vendor_contracts
  FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org contracts" ON public.vendor_contracts
  FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));

-- Phase 2B: Vendor Incidents
CREATE TABLE public.vendor_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reported_date DATE DEFAULT CURRENT_DATE,
  resolved_date DATE,
  severity TEXT NOT NULL DEFAULT 'media',
  category TEXT NOT NULL DEFAULT 'outro',
  title TEXT NOT NULL,
  description TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  impact_description TEXT,
  reported_by UUID,
  resolved_by UUID,
  status TEXT NOT NULL DEFAULT 'aberto',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vendor_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org incidents" ON public.vendor_incidents
  FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org incidents" ON public.vendor_incidents
  FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));

-- Phase 2C: Vendor SLAs
CREATE TABLE public.vendor_slas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  contract_id UUID REFERENCES public.vendor_contracts(id) ON DELETE SET NULL,
  metric_name TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'percentual',
  current_value NUMERIC,
  compliance_status TEXT NOT NULL DEFAULT 'conforme',
  period TEXT NOT NULL DEFAULT 'mensal',
  measured_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vendor_slas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org slas" ON public.vendor_slas
  FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org slas" ON public.vendor_slas
  FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
