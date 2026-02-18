
-- =============================================
-- Qualification Templates
-- =============================================
CREATE TABLE public.qualification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
  score_ranges JSONB NOT NULL DEFAULT '[{"min":0,"max":50,"label":"Alto Risco","classification":"alto"},{"min":51,"max":80,"label":"Médio Risco","classification":"medio"},{"min":81,"max":100,"label":"Baixo Risco","classification":"baixo"}]'::jsonb,
  auto_approve_threshold INTEGER DEFAULT 81,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.qualification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org templates"
  ON public.qualification_templates FOR SELECT
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org templates"
  ON public.qualification_templates FOR ALL
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE TRIGGER update_qualification_templates_updated_at
  BEFORE UPDATE ON public.qualification_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Qualification Questions
-- =============================================
CREATE TABLE public.qualification_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.qualification_templates(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'multiple_choice', 'upload', 'date', 'currency', 'number')),
  options JSONB DEFAULT '[]'::jsonb,
  weight INTEGER NOT NULL DEFAULT 10,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_ko BOOLEAN NOT NULL DEFAULT false,
  ko_value TEXT,
  conditional_on UUID REFERENCES public.qualification_questions(id) ON DELETE SET NULL,
  conditional_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.qualification_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view template questions"
  ON public.qualification_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.qualification_templates t
    WHERE t.id = qualification_questions.template_id
    AND user_belongs_to_org(auth.uid(), t.organization_id)
  ));

CREATE POLICY "Users can manage template questions"
  ON public.qualification_questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.qualification_templates t
    WHERE t.id = qualification_questions.template_id
    AND user_belongs_to_org(auth.uid(), t.organization_id)
  ));

-- =============================================
-- Qualification Campaigns
-- =============================================
CREATE TABLE public.qualification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.qualification_templates(id),
  template_version INTEGER NOT NULL DEFAULT 1,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_preenchimento', 'respondido', 'em_analise', 'devolvido', 'aprovado', 'reprovado')),
  expires_at TIMESTAMPTZ NOT NULL,
  score NUMERIC,
  risk_classification TEXT CHECK (risk_classification IN ('baixo', 'medio', 'alto')),
  ko_triggered BOOLEAN NOT NULL DEFAULT false,
  reviewer_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.qualification_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org campaigns"
  ON public.qualification_campaigns FOR SELECT
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org campaigns"
  ON public.qualification_campaigns FOR ALL
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE TRIGGER update_qualification_campaigns_updated_at
  BEFORE UPDATE ON public.qualification_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Qualification Responses
-- =============================================
CREATE TABLE public.qualification_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.qualification_campaigns(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.qualification_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_option JSONB,
  answer_file_url TEXT,
  score_awarded NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, question_id)
);

ALTER TABLE public.qualification_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org responses"
  ON public.qualification_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.qualification_campaigns c
    WHERE c.id = qualification_responses.campaign_id
    AND user_belongs_to_org(auth.uid(), c.organization_id)
  ));

CREATE POLICY "Users can manage org responses"
  ON public.qualification_responses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.qualification_campaigns c
    WHERE c.id = qualification_responses.campaign_id
    AND user_belongs_to_org(auth.uid(), c.organization_id)
  ));

CREATE TRIGGER update_qualification_responses_updated_at
  BEFORE UPDATE ON public.qualification_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
