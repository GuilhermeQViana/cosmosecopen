-- Criar tabela para snapshots de diagnóstico
CREATE TABLE public.diagnostic_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  framework_id UUID NOT NULL REFERENCES public.frameworks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.diagnostic_snapshots ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view org snapshots"
ON public.diagnostic_snapshots
FOR SELECT
USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org snapshots"
ON public.diagnostic_snapshots
FOR ALL
USING (user_belongs_to_org(auth.uid(), organization_id));

-- Índice para consultas frequentes
CREATE INDEX idx_diagnostic_snapshots_org_framework 
ON public.diagnostic_snapshots(organization_id, framework_id);