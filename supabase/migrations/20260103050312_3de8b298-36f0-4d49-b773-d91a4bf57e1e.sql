
-- =============================================
-- MÓDULO DE GESTÃO DE FORNECEDORES (VRM)
-- Fase 1: Estrutura de Banco de Dados Completa
-- =============================================

-- 1. Tabela de Domínios de Avaliação (pré-definidos)
CREATE TABLE public.vendor_assessment_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Fornecedores
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  criticality TEXT NOT NULL DEFAULT 'media',
  status TEXT NOT NULL DEFAULT 'ativo',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contract_start DATE,
  contract_end DATE,
  next_assessment_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 3. Tabela de Requisitos por Domínio
CREATE TABLE public.vendor_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.vendor_assessment_domains(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 1 CHECK (weight >= 1 AND weight <= 3),
  evidence_example TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Avaliações de Fornecedores
CREATE TABLE public.vendor_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'em_andamento',
  overall_score DECIMAL(5,2),
  risk_level TEXT,
  notes TEXT,
  assessed_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de Respostas da Avaliação
CREATE TABLE public.vendor_assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.vendor_assessments(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES public.vendor_requirements(id) ON DELETE CASCADE,
  compliance_level INTEGER NOT NULL DEFAULT 0 CHECK (compliance_level >= 0 AND compliance_level <= 5),
  evidence_provided BOOLEAN DEFAULT false,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assessment_id, requirement_id)
);

-- 6. Tabela de Evidências de Fornecedores
CREATE TABLE public.vendor_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.vendor_assessments(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES public.vendor_requirements(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabela de Planos de Ação para Fornecedores
CREATE TABLE public.vendor_action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.vendor_assessments(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES public.vendor_requirements(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'media',
  status task_status NOT NULL DEFAULT 'backlog',
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_assessments_updated_at
  BEFORE UPDATE ON public.vendor_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_assessment_responses_updated_at
  BEFORE UPDATE ON public.vendor_assessment_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_action_plans_updated_at
  BEFORE UPDATE ON public.vendor_action_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.vendor_assessment_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_action_plans ENABLE ROW LEVEL SECURITY;

-- vendor_assessment_domains: leitura pública (dados padrão)
CREATE POLICY "Anyone can view assessment domains"
  ON public.vendor_assessment_domains FOR SELECT
  USING (true);

-- vendors
CREATE POLICY "Users can view org vendors"
  ON public.vendors FOR SELECT
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org vendors"
  ON public.vendors FOR ALL
  USING (user_belongs_to_org(auth.uid(), organization_id));

-- vendor_requirements: padrão (org_id NULL) ou customizado (org_id específico)
CREATE POLICY "Users can view requirements"
  ON public.vendor_requirements FOR SELECT
  USING (organization_id IS NULL OR user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage custom requirements"
  ON public.vendor_requirements FOR ALL
  USING (organization_id IS NOT NULL AND user_belongs_to_org(auth.uid(), organization_id));

-- vendor_assessments
CREATE POLICY "Users can view org assessments"
  ON public.vendor_assessments FOR SELECT
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org assessments"
  ON public.vendor_assessments FOR ALL
  USING (user_belongs_to_org(auth.uid(), organization_id));

-- vendor_assessment_responses
CREATE POLICY "Users can view org responses"
  ON public.vendor_assessment_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.vendor_assessments va
    WHERE va.id = vendor_assessment_responses.assessment_id
    AND user_belongs_to_org(auth.uid(), va.organization_id)
  ));

CREATE POLICY "Users can manage org responses"
  ON public.vendor_assessment_responses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.vendor_assessments va
    WHERE va.id = vendor_assessment_responses.assessment_id
    AND user_belongs_to_org(auth.uid(), va.organization_id)
  ));

-- vendor_evidences
CREATE POLICY "Users can view org vendor evidences"
  ON public.vendor_evidences FOR SELECT
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org vendor evidences"
  ON public.vendor_evidences FOR ALL
  USING (user_belongs_to_org(auth.uid(), organization_id));

-- vendor_action_plans
CREATE POLICY "Users can view org vendor action plans"
  ON public.vendor_action_plans FOR SELECT
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org vendor action plans"
  ON public.vendor_action_plans FOR ALL
  USING (user_belongs_to_org(auth.uid(), organization_id));

-- =============================================
-- SEED DATA: DOMÍNIOS DE AVALIAÇÃO
-- =============================================

INSERT INTO public.vendor_assessment_domains (code, name, description, icon, order_index) VALUES
  ('seg_info', 'Segurança da Informação', 'Avaliação de controles de segurança da informação do fornecedor', 'shield', 1),
  ('cyber', 'Cyber Security', 'Avaliação de controles de segurança cibernética', 'lock', 2),
  ('privacy', 'Privacidade de Dados', 'Avaliação de conformidade com LGPD e privacidade', 'eye-off', 3),
  ('bcn', 'Continuidade de Negócios', 'Avaliação de planos e gestão de continuidade de negócios', 'refresh-cw', 4);

-- =============================================
-- SEED DATA: REQUISITOS PADRÃO (organization_id NULL)
-- =============================================

-- Segurança da Informação (15 requisitos)
INSERT INTO public.vendor_requirements (domain_id, organization_id, code, name, description, weight, evidence_example, order_index) 
SELECT 
  d.id,
  NULL,
  r.code,
  r.name,
  r.description,
  r.weight,
  r.evidence_example,
  r.order_index
FROM public.vendor_assessment_domains d
CROSS JOIN (VALUES
  ('SI-01', 'Política de Segurança da Informação', 'Possui política de segurança documentada e aprovada pela alta direção', 3, 'Documento da política assinado, ata de aprovação', 1),
  ('SI-02', 'Controle de Acesso Lógico', 'Implementa controles de acesso baseados em necessidade de conhecimento', 2, 'Matriz de acessos, logs de revisão de acessos', 2),
  ('SI-03', 'Gestão de Identidades', 'Possui processo formal de gestão de identidades e ciclo de vida de usuários', 2, 'Procedimento documentado, evidência de execução', 3),
  ('SI-04', 'Classificação da Informação', 'Classifica informações conforme criticidade e sensibilidade', 2, 'Política de classificação, exemplos de rotulagem', 4),
  ('SI-05', 'Criptografia', 'Utiliza criptografia em trânsito e em repouso para dados sensíveis', 3, 'Configurações de TLS, políticas de criptografia', 5),
  ('SI-06', 'Gestão de Vulnerabilidades', 'Realiza varreduras e correções de vulnerabilidades periodicamente', 3, 'Relatórios de scan, plano de remediação', 6),
  ('SI-07', 'Monitoramento de Segurança', 'Monitora eventos de segurança em tempo real', 2, 'Dashboard de monitoramento, alertas configurados', 7),
  ('SI-08', 'Resposta a Incidentes', 'Possui plano de resposta a incidentes de segurança', 3, 'Plano de resposta, registro de incidentes tratados', 8),
  ('SI-09', 'Segurança Física', 'Controla acesso físico às instalações e data centers', 2, 'Controles de acesso físico, CFTV', 9),
  ('SI-10', 'Conscientização de Segurança', 'Realiza treinamentos de conscientização em segurança', 1, 'Material de treinamento, lista de presença', 10),
  ('SI-11', 'Gestão de Ativos', 'Mantém inventário atualizado de ativos de informação', 2, 'Inventário de ativos, processo de atualização', 11),
  ('SI-12', 'Segregação de Funções', 'Implementa segregação de funções em processos críticos', 2, 'Matriz de segregação, evidência de implementação', 12),
  ('SI-13', 'Logs e Trilhas de Auditoria', 'Mantém logs de atividades por período adequado', 2, 'Política de retenção, exemplos de logs', 13),
  ('SI-14', 'Backup e Recuperação', 'Realiza backups regulares com testes de restauração', 3, 'Política de backup, relatório de testes', 14),
  ('SI-15', 'Desenvolvimento Seguro', 'Aplica práticas de desenvolvimento seguro (SSDLC)', 2, 'SSDLC documentado, evidência de revisão de código', 15)
) AS r(code, name, description, weight, evidence_example, order_index)
WHERE d.code = 'seg_info';

-- Cyber Security (12 requisitos)
INSERT INTO public.vendor_requirements (domain_id, organization_id, code, name, description, weight, evidence_example, order_index) 
SELECT 
  d.id,
  NULL,
  r.code,
  r.name,
  r.description,
  r.weight,
  r.evidence_example,
  r.order_index
FROM public.vendor_assessment_domains d
CROSS JOIN (VALUES
  ('CY-01', 'Firewall e Segmentação de Rede', 'Implementa firewalls e segmentação adequada de redes', 3, 'Diagrama de rede, regras de firewall', 1),
  ('CY-02', 'Proteção contra Malware', 'Utiliza soluções de proteção contra malware atualizadas', 2, 'Console de antimalware, políticas configuradas', 2),
  ('CY-03', 'Detecção e Prevenção de Intrusão', 'Possui IDS/IPS implementados e monitorados', 2, 'Configuração de IDS/IPS, alertas gerados', 3),
  ('CY-04', 'Gestão de Patches', 'Mantém sistemas atualizados com patches de segurança', 3, 'Política de patches, relatório de conformidade', 4),
  ('CY-05', 'Pentests Periódicos', 'Realiza testes de penetração pelo menos anualmente', 3, 'Relatório de pentest, plano de remediação', 5),
  ('CY-06', 'Proteção de Endpoints', 'Implementa EDR/XDR em endpoints corporativos', 2, 'Console de EDR, políticas de proteção', 6),
  ('CY-07', 'Segurança em Cloud', 'Aplica controles de segurança em ambientes cloud', 2, 'Configurações de segurança cloud, CSPM', 7),
  ('CY-08', 'Zero Trust Architecture', 'Adota princípios de Zero Trust em sua arquitetura', 1, 'Documentação de arquitetura, controles implementados', 8),
  ('CY-09', 'Threat Intelligence', 'Utiliza feeds de inteligência de ameaças', 1, 'Fontes de TI utilizadas, integração com SIEM', 9),
  ('CY-10', 'SOC/SIEM', 'Possui SOC próprio ou contratado com SIEM', 2, 'Contrato SOC, dashboards SIEM', 10),
  ('CY-11', 'Red Team/Blue Team', 'Realiza exercícios de Red Team/Blue Team', 1, 'Relatórios de exercícios, lições aprendidas', 11),
  ('CY-12', 'Gestão de Credenciais Privilegiadas', 'Utiliza PAM para credenciais privilegiadas', 3, 'Console PAM, políticas de acesso privilegiado', 12)
) AS r(code, name, description, weight, evidence_example, order_index)
WHERE d.code = 'cyber';

-- Privacidade de Dados (10 requisitos)
INSERT INTO public.vendor_requirements (domain_id, organization_id, code, name, description, weight, evidence_example, order_index) 
SELECT 
  d.id,
  NULL,
  r.code,
  r.name,
  r.description,
  r.weight,
  r.evidence_example,
  r.order_index
FROM public.vendor_assessment_domains d
CROSS JOIN (VALUES
  ('PV-01', 'Política de Privacidade', 'Possui política de privacidade publicada e atualizada', 3, 'Política de privacidade, data de atualização', 1),
  ('PV-02', 'Base Legal para Tratamento', 'Documenta base legal para cada tratamento de dados', 3, 'Registro de bases legais por tratamento', 2),
  ('PV-03', 'Consentimento', 'Coleta e gerencia consentimentos quando aplicável', 2, 'Mecanismo de consentimento, gestão de opt-out', 3),
  ('PV-04', 'Direitos dos Titulares', 'Possui processo para atender direitos dos titulares', 3, 'Formulário de requisição, SLA de atendimento', 4),
  ('PV-05', 'Registro de Tratamento', 'Mantém registro de atividades de tratamento (ROPA)', 2, 'ROPA atualizado', 5),
  ('PV-06', 'DPIA Realizado', 'Realiza DPIA para tratamentos de alto risco', 2, 'Relatório de DPIA, metodologia utilizada', 6),
  ('PV-07', 'Encarregado de Dados (DPO)', 'Possui DPO nomeado e divulgado', 2, 'Nomeação do DPO, canal de contato', 7),
  ('PV-08', 'Transferência Internacional', 'Possui salvaguardas para transferência internacional', 2, 'Cláusulas contratuais, análise de adequação', 8),
  ('PV-09', 'Retenção e Descarte', 'Define e aplica política de retenção de dados', 2, 'Política de retenção, evidência de descarte', 9),
  ('PV-10', 'Notificação de Incidentes', 'Possui processo de notificação de incidentes de dados', 3, 'Procedimento de notificação, template ANPD', 10)
) AS r(code, name, description, weight, evidence_example, order_index)
WHERE d.code = 'privacy';

-- Continuidade de Negócios (8 requisitos)
INSERT INTO public.vendor_requirements (domain_id, organization_id, code, name, description, weight, evidence_example, order_index) 
SELECT 
  d.id,
  NULL,
  r.code,
  r.name,
  r.description,
  r.weight,
  r.evidence_example,
  r.order_index
FROM public.vendor_assessment_domains d
CROSS JOIN (VALUES
  ('BC-01', 'Plano de Continuidade de Negócios', 'Possui PCN documentado e aprovado', 3, 'Documento do PCN, aprovação da diretoria', 1),
  ('BC-02', 'Análise de Impacto (BIA)', 'Realizou BIA para processos críticos', 3, 'Relatório de BIA, processos mapeados', 2),
  ('BC-03', 'RTO e RPO Definidos', 'Define RTO e RPO para sistemas críticos', 2, 'Matriz de RTO/RPO por sistema', 3),
  ('BC-04', 'Site de Contingência', 'Possui site de contingência ou DR em cloud', 2, 'Contrato de DR, arquitetura de contingência', 4),
  ('BC-05', 'Testes Periódicos do PCN', 'Realiza testes do PCN pelo menos anualmente', 3, 'Relatório de teste, plano de melhorias', 5),
  ('BC-06', 'Plano de Comunicação de Crise', 'Possui plano de comunicação de crise', 2, 'Plano de comunicação, lista de contatos', 6),
  ('BC-07', 'Cadeia de Fornecedores Alternativa', 'Possui fornecedores alternativos para itens críticos', 1, 'Lista de fornecedores alternativos', 7),
  ('BC-08', 'Seguros Adequados', 'Possui cobertura de seguros para riscos operacionais', 1, 'Apólices de seguro vigentes', 8)
) AS r(code, name, description, weight, evidence_example, order_index)
WHERE d.code = 'bcn';

-- =============================================
-- STORAGE BUCKET PARA EVIDÊNCIAS
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-evidences', 'vendor-evidences', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para evidências de fornecedores
CREATE POLICY "Users can upload vendor evidences"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-evidences' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view vendor evidences"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-evidences' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete vendor evidences"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vendor-evidences' AND auth.uid() IS NOT NULL);
