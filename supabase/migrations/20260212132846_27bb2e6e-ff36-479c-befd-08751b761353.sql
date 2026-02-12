
-- 1. Policies
CREATE TABLE public.policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  framework_id uuid REFERENCES public.frameworks(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  content text DEFAULT '',
  category text,
  status text NOT NULL DEFAULT 'rascunho',
  version integer NOT NULL DEFAULT 1,
  owner_id uuid,
  approver_id uuid,
  approved_at timestamptz,
  published_at timestamptz,
  expires_at timestamptz,
  next_review_at timestamptz,
  tags text[],
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage org policies" ON public.policies FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org policies" ON public.policies FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER log_policies_changes AFTER INSERT OR UPDATE OR DELETE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

-- 2. Policy Versions
CREATE TABLE public.policy_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  changed_by uuid,
  change_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.policy_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view policy versions" ON public.policy_versions FOR SELECT USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_versions.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can insert policy versions" ON public.policy_versions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_versions.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));

-- 3. Policy Comments
CREATE TABLE public.policy_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  user_id uuid,
  parent_id uuid REFERENCES public.policy_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.policy_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage policy comments" ON public.policy_comments FOR ALL USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_comments.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can view policy comments" ON public.policy_comments FOR SELECT USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_comments.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));

-- 4. Policy Controls
CREATE TABLE public.policy_controls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  control_id uuid NOT NULL REFERENCES public.controls(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(policy_id, control_id)
);
ALTER TABLE public.policy_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage policy controls" ON public.policy_controls FOR ALL USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_controls.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can view policy controls" ON public.policy_controls FOR SELECT USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_controls.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));

-- 5. Policy Risks
CREATE TABLE public.policy_risks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  risk_id uuid NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(policy_id, risk_id)
);
ALTER TABLE public.policy_risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage policy risks" ON public.policy_risks FOR ALL USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_risks.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can view policy risks" ON public.policy_risks FOR SELECT USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_risks.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));

-- 6. Policy Workflows
CREATE TABLE public.policy_workflows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  approval_levels integer NOT NULL DEFAULT 1,
  level1_role text DEFAULT 'admin',
  level2_role text,
  level1_approver_id uuid,
  level2_approver_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.policy_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage org workflows" ON public.policy_workflows FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org workflows" ON public.policy_workflows FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE TRIGGER update_policy_workflows_updated_at BEFORE UPDATE ON public.policy_workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Policy Approvals
CREATE TABLE public.policy_approvals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  approval_level integer NOT NULL DEFAULT 1,
  approver_id uuid,
  status text NOT NULL DEFAULT 'pendente',
  comments text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.policy_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage policy approvals" ON public.policy_approvals FOR ALL USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_approvals.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can view policy approvals" ON public.policy_approvals FOR SELECT USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_approvals.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));

-- 8. Acceptance Campaigns
CREATE TABLE public.policy_acceptance_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_audience text NOT NULL DEFAULT 'todos',
  target_roles text[],
  deadline timestamptz,
  status text NOT NULL DEFAULT 'ativa',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.policy_acceptance_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage org campaigns" ON public.policy_acceptance_campaigns FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org campaigns" ON public.policy_acceptance_campaigns FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));

-- 9. Acceptances
CREATE TABLE public.policy_acceptances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.policy_acceptance_campaigns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  UNIQUE(campaign_id, user_id)
);
ALTER TABLE public.policy_acceptances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own acceptances" ON public.policy_acceptances FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own acceptances" ON public.policy_acceptances FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Org members can view campaign acceptances" ON public.policy_acceptances FOR SELECT USING (EXISTS (SELECT 1 FROM public.policy_acceptance_campaigns c WHERE c.id = policy_acceptances.campaign_id AND user_belongs_to_org(auth.uid(), c.organization_id)));

-- 10. Templates
CREATE TABLE public.policy_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text NOT NULL DEFAULT '',
  category text,
  framework_code text,
  is_system boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.policy_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view system templates" ON public.policy_templates FOR SELECT USING (is_system = true);
CREATE POLICY "Users can view org templates" ON public.policy_templates FOR SELECT USING (organization_id IS NOT NULL AND user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org templates" ON public.policy_templates FOR ALL USING (organization_id IS NOT NULL AND user_belongs_to_org(auth.uid(), organization_id));

-- Auto-version trigger
CREATE OR REPLACE FUNCTION public.create_policy_version()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.policy_versions (policy_id, version_number, title, content, changed_by, change_summary)
    VALUES (NEW.id, NEW.version, OLD.title, OLD.content, auth.uid(), 'Atualização automática');
    NEW.version := OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER policy_auto_version BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.create_policy_version();

-- Seed templates
INSERT INTO public.policy_templates (title, description, content, category, framework_code, is_system) VALUES
('Política de Segurança da Informação', 'Diretrizes gerais de segurança da informação.', '<h1>Política de Segurança da Informação</h1><p>Diretrizes para proteção dos ativos de informação.</p>', 'Segurança', 'iso_27001', true);

INSERT INTO public.policy_templates (title, description, content, category, framework_code, is_system) VALUES
('Política de Controle de Acesso', 'Regras para concessão e revogação de acessos.', '<h1>Política de Controle de Acesso</h1><p>Acesso controlado e rastreável.</p>', 'Acesso', 'iso_27001', true);

INSERT INTO public.policy_templates (title, description, content, category, framework_code, is_system) VALUES
('Política de Uso Aceitável', 'Regras de uso de recursos tecnológicos.', '<h1>Política de Uso Aceitável</h1><p>Uso adequado dos recursos de TI.</p>', 'Segurança', 'iso_27001', true);

INSERT INTO public.policy_templates (title, description, content, category, framework_code, is_system) VALUES
('Política de Backup e Recuperação', 'Procedimentos de backup conforme BCB 4.893.', '<h1>Política de Backup</h1><p>Disponibilidade e integridade dos dados.</p>', 'Continuidade', 'bcb_cmn', true);

INSERT INTO public.policy_templates (title, description, content, category, framework_code, is_system) VALUES
('Política de Resposta a Incidentes', 'Procedimentos de resposta a incidentes.', '<h1>Política de Resposta a Incidentes</h1><p>Processo estruturado de tratamento.</p>', 'Segurança', 'nist_csf', true);

INSERT INTO public.policy_templates (title, description, content, category, framework_code, is_system) VALUES
('Política de Privacidade e LGPD', 'Diretrizes de proteção de dados pessoais.', '<h1>Política de Privacidade</h1><p>Conformidade com a LGPD.</p>', 'Privacidade', NULL, true);

INSERT INTO public.policy_templates (title, description, content, category, framework_code, is_system) VALUES
('Política de BYOD', 'Regras para dispositivos pessoais.', '<h1>Política de BYOD</h1><p>Uso de dispositivos pessoais no ambiente corporativo.</p>', 'Segurança', NULL, true);

INSERT INTO public.policy_templates (title, description, content, category, framework_code, is_system) VALUES
('Política de Senhas', 'Requisitos de complexidade de senhas.', '<h1>Política de Senhas</h1><p>Requisitos de segurança para senhas.</p>', 'Acesso', 'iso_27001', true);

INSERT INTO public.policy_templates (title, description, content, category, framework_code, is_system) VALUES
('Política de Gestão de Mudanças', 'Controle de mudanças em produção.', '<h1>Política de Gestão de Mudanças</h1><p>Minimizar riscos de alterações.</p>', 'Segurança', NULL, true);

INSERT INTO public.policy_templates (title, description, content, category, framework_code, is_system) VALUES
('Política de Continuidade de Negócios', 'Plano de continuidade e recuperação.', '<h1>Política de Continuidade</h1><p>Continuidade das operações críticas.</p>', 'Continuidade', 'bcb_cmn', true);
