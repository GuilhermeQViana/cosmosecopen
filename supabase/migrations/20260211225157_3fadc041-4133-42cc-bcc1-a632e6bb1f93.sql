
-- Fase 1A: Novos campos na tabela vendors para ciclo de vida
ALTER TABLE public.vendors 
  ADD COLUMN IF NOT EXISTS lifecycle_stage text NOT NULL DEFAULT 'ativo',
  ADD COLUMN IF NOT EXISTS data_classification text,
  ADD COLUMN IF NOT EXISTS service_type text,
  ADD COLUMN IF NOT EXISTS contract_value numeric,
  ADD COLUMN IF NOT EXISTS contract_currency text NOT NULL DEFAULT 'BRL';

-- Fase 1B: Tabela de Due Diligence
CREATE TABLE public.vendor_due_diligence (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  status text NOT NULL DEFAULT 'pendente',
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  approved_by uuid,
  inherent_risk_score numeric,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_due_diligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org due diligence"
  ON public.vendor_due_diligence FOR SELECT
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org due diligence"
  ON public.vendor_due_diligence FOR ALL
  USING (user_belongs_to_org(auth.uid(), organization_id));

-- Tabela de itens do checklist de Due Diligence
CREATE TABLE public.vendor_due_diligence_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  due_diligence_id uuid NOT NULL REFERENCES public.vendor_due_diligence(id) ON DELETE CASCADE,
  category text NOT NULL,
  item_name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pendente',
  observations text,
  verified_by uuid,
  verified_at timestamp with time zone,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_due_diligence_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view due diligence items"
  ON public.vendor_due_diligence_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.vendor_due_diligence dd
    WHERE dd.id = vendor_due_diligence_items.due_diligence_id
    AND user_belongs_to_org(auth.uid(), dd.organization_id)
  ));

CREATE POLICY "Users can manage due diligence items"
  ON public.vendor_due_diligence_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.vendor_due_diligence dd
    WHERE dd.id = vendor_due_diligence_items.due_diligence_id
    AND user_belongs_to_org(auth.uid(), dd.organization_id)
  ));

-- Trigger para updated_at
CREATE TRIGGER update_vendor_due_diligence_updated_at
  BEFORE UPDATE ON public.vendor_due_diligence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
