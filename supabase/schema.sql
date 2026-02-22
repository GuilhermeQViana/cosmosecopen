-- =============================================
-- CosmoSec - Schema SQL Consolidado
-- Plataforma GRC Open Source
-- =============================================
-- Este script cria toda a estrutura do banco de dados necessária
-- para rodar o CosmoSec. Execute no SQL Editor do Supabase.
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- =============================================
-- 1. TIPOS ENUM CUSTOMIZADOS
-- =============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'auditor', 'analyst');
CREATE TYPE public.maturity_level AS ENUM ('0', '1', '2', '3', '4', '5');
CREATE TYPE public.conformity_status AS ENUM ('conforme', 'parcial', 'nao_conforme', 'nao_aplicavel');
CREATE TYPE public.risk_treatment AS ENUM ('mitigar', 'aceitar', 'transferir', 'evitar');
CREATE TYPE public.task_priority AS ENUM ('critica', 'alta', 'media', 'baixa');
CREATE TYPE public.task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done');
CREATE TYPE public.evidence_classification AS ENUM ('publico', 'interno', 'confidencial');

-- =============================================
-- 2. TABELAS PRINCIPAIS
-- =============================================

-- Organizations
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- View segura
CREATE VIEW public.organizations_safe
WITH (security_invoker = on) AS
  SELECT id, name, description, logo_url, created_at, updated_at
  FROM public.organizations;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  email_notifications BOOLEAN DEFAULT true,
  risk_alerts BOOLEAN DEFAULT true,
  due_date_reminders BOOLEAN DEFAULT true,
  layout_density TEXT DEFAULT 'default' CHECK (layout_density IN ('compact', 'default', 'comfortable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Super Admins
CREATE TABLE public.super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Frameworks
CREATE TABLE public.frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  version TEXT,
  description TEXT,
  icon TEXT DEFAULT 'shield',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Controls
CREATE TABLE public.controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES public.frameworks(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.controls(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  weight INTEGER DEFAULT 1 CHECK (weight >= 1 AND weight <= 5),
  criticality TEXT CHECK (criticality IN ('baixo', 'medio', 'alto', 'critico')),
  weight_reason TEXT,
  implementation_example TEXT,
  evidence_example TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Framework Mappings
CREATE TABLE public.framework_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_control_id UUID REFERENCES public.controls(id) ON DELETE CASCADE NOT NULL,
  target_control_id UUID REFERENCES public.controls(id) ON DELETE CASCADE NOT NULL,
  mapping_type TEXT NOT NULL DEFAULT 'equivalent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_control_id, target_control_id)
);

-- Assessments
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  control_id UUID REFERENCES public.controls(id) ON DELETE CASCADE NOT NULL,
  maturity_level maturity_level NOT NULL DEFAULT '0',
  target_maturity maturity_level NOT NULL DEFAULT '3',
  status conformity_status NOT NULL DEFAULT 'nao_conforme',
  observations TEXT,
  assessed_by UUID REFERENCES auth.users(id),
  assessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, control_id)
);

-- Assessment Comments
CREATE TABLE public.assessment_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  parent_id UUID REFERENCES public.assessment_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comment Reactions
CREATE TABLE public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.assessment_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike', 'emoji')),
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Risks
CREATE TABLE public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  framework_id UUID REFERENCES public.frameworks(id),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  inherent_probability INTEGER NOT NULL DEFAULT 1 CHECK (inherent_probability >= 1 AND inherent_probability <= 5),
  inherent_impact INTEGER NOT NULL DEFAULT 1 CHECK (inherent_impact >= 1 AND inherent_impact <= 5),
  residual_probability INTEGER DEFAULT 1 CHECK (residual_probability >= 1 AND residual_probability <= 5),
  residual_impact INTEGER DEFAULT 1 CHECK (residual_impact >= 1 AND residual_impact <= 5),
  treatment risk_treatment NOT NULL DEFAULT 'mitigar',
  treatment_plan TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk Controls
CREATE TABLE public.risk_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES public.risks(id) ON DELETE CASCADE NOT NULL,
  control_id UUID REFERENCES public.controls(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(risk_id, control_id)
);

-- Risk History
CREATE TABLE public.risk_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES auth.users(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'level_change', 'treatment_change')),
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  old_level INTEGER,
  new_level INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evidence Folders
CREATE TABLE public.evidence_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.evidence_folders(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evidences
CREATE TABLE public.evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  framework_id UUID REFERENCES public.frameworks(id),
  folder_id UUID REFERENCES public.evidence_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  classification evidence_classification NOT NULL DEFAULT 'interno',
  tags TEXT[],
  expires_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assessment Evidences
CREATE TABLE public.assessment_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  evidence_id UUID REFERENCES public.evidences(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assessment_id, evidence_id)
);

-- Action Plans
CREATE TABLE public.action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  framework_id UUID REFERENCES public.frameworks(id),
  risk_id UUID REFERENCES public.risks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'media',
  status task_status NOT NULL DEFAULT 'backlog',
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Action Plan Tasks
CREATE TABLE public.action_plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID REFERENCES public.action_plans(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Action Plan Comments
CREATE TABLE public.action_plan_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID REFERENCES public.action_plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Diagnostic Snapshots
CREATE TABLE public.diagnostic_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  framework_id UUID NOT NULL REFERENCES public.frameworks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization Invites
CREATE TABLE public.organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'analyst',
  invited_by UUID REFERENCES auth.users(id),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Access Logs
CREATE TABLE public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feedbacks
CREATE TABLE public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  module TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  liked TEXT,
  suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contact Requests
CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT,
  company_size TEXT,
  how_found TEXT,
  message TEXT,
  interest_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  contacted_at TIMESTAMPTZ,
  contacted_by UUID REFERENCES auth.users(id)
);

-- Generated Reports
CREATE TABLE public.generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  framework_id UUID REFERENCES public.frameworks(id) ON DELETE SET NULL,
  period TEXT,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3. MÓDULO DE POLÍTICAS
-- =============================================

CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  framework_id UUID REFERENCES public.frameworks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT DEFAULT '',
  category TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho',
  version INTEGER NOT NULL DEFAULT 1,
  owner_id UUID,
  approver_id UUID,
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  tags TEXT[],
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.policy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  changed_by UUID,
  change_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.policy_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  user_id UUID,
  parent_id UUID REFERENCES public.policy_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.policy_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  control_id UUID NOT NULL REFERENCES public.controls(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(policy_id, control_id)
);

CREATE TABLE public.policy_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  risk_id UUID NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(policy_id, risk_id)
);

CREATE TABLE public.policy_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  approval_levels INTEGER NOT NULL DEFAULT 1,
  level1_role TEXT DEFAULT 'admin',
  level2_role TEXT,
  level1_approver_id UUID,
  level2_approver_id UUID,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sla_days INTEGER,
  notify_approver BOOLEAN NOT NULL DEFAULT true,
  approvers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.policy_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  approval_level INTEGER NOT NULL DEFAULT 1,
  approver_id UUID,
  status TEXT NOT NULL DEFAULT 'pendente',
  comments TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.policy_acceptance_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT NOT NULL DEFAULT 'todos',
  target_roles TEXT[],
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ativa',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.policy_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.policy_acceptance_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  UNIQUE(campaign_id, user_id)
);

CREATE TABLE public.policy_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL DEFAULT '',
  category TEXT,
  framework_code TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 4. MÓDULO DE FORNECEDORES (VRM)
-- =============================================

CREATE TABLE public.vendor_assessment_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  criticality TEXT NOT NULL DEFAULT 'media',
  status TEXT NOT NULL DEFAULT 'ativo',
  lifecycle_stage TEXT NOT NULL DEFAULT 'ativo',
  data_classification TEXT,
  service_type TEXT,
  contract_value NUMERIC,
  contract_currency TEXT NOT NULL DEFAULT 'BRL',
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

CREATE TABLE public.vendor_due_diligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  status TEXT NOT NULL DEFAULT 'pendente',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  approved_by UUID,
  inherent_risk_score NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vendor_due_diligence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  due_diligence_id UUID NOT NULL REFERENCES public.vendor_due_diligence(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  observations TEXT,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vendor_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE public.vendor_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE public.vendor_slas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE public.vendor_evidence_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  classification TEXT NOT NULL DEFAULT 'interno',
  category TEXT NOT NULL DEFAULT 'outro',
  expires_at TIMESTAMPTZ,
  tags TEXT[],
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.vendor_risk_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL,
  trend TEXT NOT NULL,
  top_concerns TEXT[] NOT NULL DEFAULT '{}',
  recommendation TEXT NOT NULL,
  summary TEXT NOT NULL,
  analyzed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vendor_offboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT 'fim_contrato',
  initiated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  initiated_by UUID,
  status TEXT NOT NULL DEFAULT 'iniciado',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.vendor_offboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offboarding_id UUID NOT NULL REFERENCES public.vendor_offboarding(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  completed_by UUID,
  completed_at TIMESTAMPTZ,
  observations TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.vendor_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  scope TEXT NOT NULL DEFAULT 'assessment',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  vendor_response JSONB,
  status TEXT NOT NULL DEFAULT 'pendente'
);

-- =============================================
-- 5. MÓDULO DE QUALIFICAÇÃO
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

-- =============================================
-- 6. HABILITAR RLS EM TODAS AS TABELAS
-- =============================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plan_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acceptance_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_assessment_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_due_diligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_due_diligence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_slas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_evidence_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_risk_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_offboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_offboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_portal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_responses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. FUNÇÕES DO BANCO DE DADOS
-- =============================================

-- Função auxiliar: updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Verificar se user pertence à org
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND organization_id = _org_id);
$$;

-- Verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Obter organização do user
CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organization_id FROM public.profiles WHERE id = _user_id;
$$;

-- Verificar super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = check_user_id);
$$;

-- Obter organizações do user
CREATE OR REPLACE FUNCTION public.get_user_organizations()
RETURNS TABLE (id uuid, name text, description text, logo_url text, created_at timestamptz, updated_at timestamptz, role app_role)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.id, o.name, o.description, o.logo_url, o.created_at, o.updated_at, ur.role
  FROM public.organizations o
  INNER JOIN public.user_roles ur ON ur.organization_id = o.id
  WHERE ur.user_id = auth.uid()
  ORDER BY o.name;
$$;

-- Definir organização ativa
CREATE OR REPLACE FUNCTION public.set_active_organization(_org_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE has_access boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND organization_id = _org_id) INTO has_access;
  IF NOT has_access THEN RAISE EXCEPTION 'User does not have access to this organization'; END IF;
  UPDATE public.profiles SET organization_id = _org_id WHERE id = auth.uid();
  RETURN true;
END; $$;

-- Criar organização com admin
CREATE OR REPLACE FUNCTION public.create_organization_with_admin(org_name text, org_description text DEFAULT NULL)
RETURNS organizations LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_org public.organizations; current_user_id UUID; user_has_org boolean;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'User not authenticated'; END IF;
  INSERT INTO public.organizations (name, description) VALUES (org_name, org_description) RETURNING * INTO new_org;
  INSERT INTO public.user_roles (user_id, organization_id, role) VALUES (current_user_id, new_org.id, 'admin');
  SELECT organization_id IS NOT NULL INTO user_has_org FROM public.profiles WHERE id = current_user_id;
  IF NOT user_has_org THEN UPDATE public.profiles SET organization_id = new_org.id WHERE id = current_user_id; END IF;
  RETURN new_org;
END; $$;

-- Aceitar convite
CREATE OR REPLACE FUNCTION public.accept_organization_invite(_token uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE invite_record RECORD; current_user_id UUID; current_user_email TEXT;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'User not authenticated'; END IF;
  SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
  SELECT * INTO invite_record FROM public.organization_invites WHERE token = _token;
  IF NOT FOUND THEN RAISE EXCEPTION 'Convite não encontrado'; END IF;
  IF invite_record.accepted_at IS NOT NULL THEN RAISE EXCEPTION 'Este convite já foi aceito'; END IF;
  IF invite_record.expires_at < now() THEN RAISE EXCEPTION 'Este convite expirou'; END IF;
  IF current_user_email != invite_record.email THEN RAISE EXCEPTION 'Este convite foi enviado para outro e-mail'; END IF;
  INSERT INTO public.user_roles (user_id, organization_id, role) VALUES (current_user_id, invite_record.organization_id, invite_record.role) ON CONFLICT (user_id, organization_id) DO NOTHING;
  UPDATE public.organization_invites SET accepted_at = now() WHERE id = invite_record.id;
  RETURN true;
END; $$;

-- Sair de organização
CREATE OR REPLACE FUNCTION public.leave_organization(_org_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_user_id UUID; admin_count INTEGER;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'User not authenticated'; END IF;
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE organization_id = _org_id AND role = 'admin';
  IF admin_count = 1 AND EXISTS (SELECT 1 FROM public.user_roles WHERE organization_id = _org_id AND user_id = current_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Cannot leave organization as the only admin. Transfer admin role first.';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = current_user_id AND organization_id = _org_id;
  UPDATE public.profiles SET organization_id = NULL WHERE id = current_user_id AND organization_id = _org_id;
  RETURN true;
END; $$;

-- Deletar organização
CREATE OR REPLACE FUNCTION public.delete_organization(_org_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _user_id uuid; _is_admin boolean;
BEGIN
  _user_id := auth.uid();
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND organization_id = _org_id AND role = 'admin') INTO _is_admin;
  IF NOT _is_admin THEN RAISE EXCEPTION 'Apenas administradores podem excluir organizações'; END IF;
  DELETE FROM public.action_plan_tasks WHERE action_plan_id IN (SELECT id FROM public.action_plans WHERE organization_id = _org_id);
  DELETE FROM public.action_plan_comments WHERE action_plan_id IN (SELECT id FROM public.action_plans WHERE organization_id = _org_id);
  DELETE FROM public.action_plans WHERE organization_id = _org_id;
  DELETE FROM public.assessment_evidences WHERE assessment_id IN (SELECT id FROM public.assessments WHERE organization_id = _org_id);
  DELETE FROM public.comment_reactions WHERE comment_id IN (SELECT id FROM public.assessment_comments WHERE assessment_id IN (SELECT id FROM public.assessments WHERE organization_id = _org_id));
  DELETE FROM public.assessment_comments WHERE assessment_id IN (SELECT id FROM public.assessments WHERE organization_id = _org_id);
  DELETE FROM public.assessments WHERE organization_id = _org_id;
  DELETE FROM public.risk_controls WHERE risk_id IN (SELECT id FROM public.risks WHERE organization_id = _org_id);
  DELETE FROM public.risk_history WHERE risk_id IN (SELECT id FROM public.risks WHERE organization_id = _org_id);
  DELETE FROM public.risks WHERE organization_id = _org_id;
  DELETE FROM public.evidences WHERE organization_id = _org_id;
  DELETE FROM public.evidence_folders WHERE organization_id = _org_id;
  DELETE FROM public.diagnostic_snapshots WHERE organization_id = _org_id;
  DELETE FROM public.notifications WHERE organization_id = _org_id;
  DELETE FROM public.organization_invites WHERE organization_id = _org_id;
  DELETE FROM public.access_logs WHERE organization_id = _org_id;
  DELETE FROM public.user_roles WHERE organization_id = _org_id;
  UPDATE public.profiles SET organization_id = NULL WHERE organization_id = _org_id;
  DELETE FROM public.organizations WHERE id = _org_id;
  RETURN true;
END; $$;

-- Verificar acesso da organização (sempre true — plataforma gratuita)
CREATE OR REPLACE FUNCTION public.check_organization_access(_org_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.organizations WHERE id = _org_id);
END; $$;

-- Log de acesso
CREATE OR REPLACE FUNCTION public.log_access_event(_action TEXT, _entity_type TEXT DEFAULT NULL, _entity_id UUID DEFAULT NULL, _details JSONB DEFAULT NULL, _ip_address TEXT DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _log_id UUID; _user_id UUID; _org_id UUID;
BEGIN
  _user_id := auth.uid();
  SELECT organization_id INTO _org_id FROM public.profiles WHERE id = _user_id;
  INSERT INTO public.access_logs (user_id, organization_id, action, entity_type, entity_id, details, ip_address)
  VALUES (_user_id, _org_id, _action, _entity_type, _entity_id, _details, _ip_address) RETURNING id INTO _log_id;
  RETURN _log_id;
END; $$;

-- Log de mudanças em tabelas
CREATE OR REPLACE FUNCTION public.log_table_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _action TEXT; _entity_id UUID; _details JSONB; _org_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN _action := 'create'; _entity_id := NEW.id; _org_id := NEW.organization_id;
    _details := jsonb_build_object('new_data', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN _action := 'update'; _entity_id := NEW.id; _org_id := NEW.organization_id;
    _details := jsonb_build_object('old_data', to_jsonb(OLD), 'new_data', to_jsonb(NEW), 'changed_fields', (SELECT jsonb_object_agg(key, value) FROM jsonb_each(to_jsonb(NEW)) WHERE to_jsonb(OLD) -> key IS DISTINCT FROM value));
  ELSIF TG_OP = 'DELETE' THEN _action := 'delete'; _entity_id := OLD.id; _org_id := OLD.organization_id;
    _details := jsonb_build_object('deleted_data', to_jsonb(OLD));
  END IF;
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.access_logs (user_id, organization_id, action, entity_type, entity_id, details) VALUES (auth.uid(), _org_id, _action, TG_TABLE_NAME, _entity_id, _details);
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END; $$;

-- Log de mudanças de risco
CREATE OR REPLACE FUNCTION public.log_risk_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old_level INTEGER; new_level INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.risk_history (risk_id, changed_by, change_type, new_level) VALUES (NEW.id, auth.uid(), 'created', NEW.inherent_probability * NEW.inherent_impact);
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    old_level := OLD.inherent_probability * OLD.inherent_impact;
    new_level := NEW.inherent_probability * NEW.inherent_impact;
    IF old_level != new_level THEN
      INSERT INTO public.risk_history (risk_id, changed_by, change_type, field_changed, old_value, new_value, old_level, new_level) VALUES (NEW.id, auth.uid(), 'level_change', 'inherent_level', old_level::TEXT, new_level::TEXT, old_level, new_level);
      IF new_level >= 20 AND old_level < 20 THEN
        INSERT INTO public.notifications (user_id, organization_id, title, message, type, link) SELECT ur.user_id, NEW.organization_id, 'Risco Crítico: ' || NEW.code, 'O risco "' || NEW.title || '" atingiu nível crítico.', 'risk', '/riscos' FROM public.user_roles ur WHERE ur.organization_id = NEW.organization_id AND ur.role = 'admin';
      END IF;
    END IF;
    IF OLD.treatment != NEW.treatment THEN
      INSERT INTO public.risk_history (risk_id, changed_by, change_type, field_changed, old_value, new_value, old_level, new_level) VALUES (NEW.id, auth.uid(), 'treatment_change', 'treatment', OLD.treatment, NEW.treatment, old_level, new_level);
    END IF;
    IF OLD.title != NEW.title OR OLD.description IS DISTINCT FROM NEW.description OR OLD.category IS DISTINCT FROM NEW.category THEN
      INSERT INTO public.risk_history (risk_id, changed_by, change_type, old_level, new_level) VALUES (NEW.id, auth.uid(), 'updated', old_level, new_level);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END; $$;

-- Verificar risk score crítico
CREATE OR REPLACE FUNCTION public.check_critical_risk_score()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE control_weight INTEGER; target_maturity INTEGER; current_maturity INTEGER; risk_score INTEGER; control_code TEXT; control_name TEXT;
BEGIN
  SELECT c.weight, c.code, c.name INTO control_weight, control_code, control_name FROM public.controls c WHERE c.id = NEW.control_id;
  control_weight := COALESCE(control_weight, 1);
  current_maturity := (NEW.maturity_level::TEXT)::INTEGER;
  target_maturity := (NEW.target_maturity::TEXT)::INTEGER;
  risk_score := GREATEST(0, target_maturity - current_maturity) * LEAST(control_weight, 3);
  IF risk_score >= 10 THEN
    INSERT INTO public.notifications (user_id, organization_id, title, message, type, link) SELECT ur.user_id, NEW.organization_id, 'Risk Score Crítico: ' || control_code, 'O controle "' || control_name || '" atingiu Risk Score ' || risk_score || ' (Crítico). Ação imediata requerida.', 'risk', '/diagnostico' FROM public.user_roles ur WHERE ur.organization_id = NEW.organization_id AND ur.role = 'admin' AND NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.user_id = ur.user_id AND n.title LIKE 'Risk Score Crítico: ' || control_code || '%' AND n.created_at > NOW() - INTERVAL '24 hours');
  END IF;
  RETURN NEW;
END; $$;

-- Verificar deadlines
CREATE OR REPLACE FUNCTION public.check_deadline_notifications()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, organization_id, title, message, type, link)
  SELECT COALESCE(ap.assigned_to, ap.created_by), ap.organization_id, 'Prazo Próximo: ' || ap.title, 'O plano de ação vence em 3 dias.', 'deadline', '/plano-acao'
  FROM public.action_plans ap WHERE ap.due_date = CURRENT_DATE + INTERVAL '3 days' AND ap.status NOT IN ('done') AND COALESCE(ap.assigned_to, ap.created_by) IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.link = '/plano-acao' AND n.title LIKE 'Prazo Próximo:%' AND n.created_at > NOW() - INTERVAL '1 day' AND n.user_id = COALESCE(ap.assigned_to, ap.created_by));
  INSERT INTO public.notifications (user_id, organization_id, title, message, type, link)
  SELECT COALESCE(ap.assigned_to, ap.created_by), ap.organization_id, 'Prazo Vencido: ' || ap.title, 'Este plano de ação está atrasado.', 'deadline', '/plano-acao'
  FROM public.action_plans ap WHERE ap.due_date < CURRENT_DATE AND ap.status NOT IN ('done') AND COALESCE(ap.assigned_to, ap.created_by) IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.link = '/plano-acao' AND n.title LIKE 'Prazo Vencido:%' AND n.created_at > NOW() - INTERVAL '1 day' AND n.user_id = COALESCE(ap.assigned_to, ap.created_by));
END; $$;

-- Criar notificação segura
CREATE OR REPLACE FUNCTION public.create_notification(_user_id uuid, _organization_id uuid, _title text, _message text DEFAULT NULL, _type text DEFAULT 'info', _link text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _notification_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  INSERT INTO public.notifications (user_id, organization_id, title, message, type, link) VALUES (_user_id, _organization_id, _title, _message, _type, _link) RETURNING id INTO _notification_id;
  RETURN _notification_id;
END; $$;

-- Versão automática de políticas
CREATE OR REPLACE FUNCTION public.create_policy_version()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.policy_versions (policy_id, version_number, title, content, changed_by, change_summary) VALUES (NEW.id, NEW.version, OLD.title, OLD.content, auth.uid(), 'Atualização automática');
    NEW.version := OLD.version + 1;
  END IF;
  RETURN NEW;
END; $$;

-- Handle new user (trigger para auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE _super_admin RECORD; _full_name TEXT; _message TEXT; _service_key TEXT; _supabase_url TEXT;
BEGIN
  INSERT INTO public.profiles (id, full_name, email) VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  _full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Sem nome');
  _message := 'Nome: ' || _full_name || ' | Cadastrado em: ' || to_char(NEW.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI');
  FOR _super_admin IN SELECT user_id FROM public.super_admins LOOP
    INSERT INTO public.notifications (user_id, title, message, type, link) VALUES (_super_admin.user_id, '👤 Novo cadastro: ' || NEW.email, _message, 'info', '/configuracoes');
  END LOOP;
  BEGIN
    _service_key := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1);
    _supabase_url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1);
    IF _service_key IS NOT NULL AND _supabase_url IS NOT NULL THEN
      PERFORM net.http_post(url := _supabase_url || '/functions/v1/notify-new-signup', headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || _service_key), body := jsonb_build_object('email', NEW.email, 'full_name', NEW.raw_user_meta_data ->> 'full_name', 'created_at', NEW.created_at));
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END; $function$;

-- =============================================
-- 8. TRIGGERS
-- =============================================

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_evidences_updated_at BEFORE UPDATE ON public.evidences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_action_plans_updated_at BEFORE UPDATE ON public.action_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_evidence_folders_updated_at BEFORE UPDATE ON public.evidence_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessment_comments_updated_at BEFORE UPDATE ON public.assessment_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendor_assessments_updated_at BEFORE UPDATE ON public.vendor_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendor_assessment_responses_updated_at BEFORE UPDATE ON public.vendor_assessment_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendor_action_plans_updated_at BEFORE UPDATE ON public.vendor_action_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendor_due_diligence_updated_at BEFORE UPDATE ON public.vendor_due_diligence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_policy_workflows_updated_at BEFORE UPDATE ON public.policy_workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qualification_templates_updated_at BEFORE UPDATE ON public.qualification_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qualification_campaigns_updated_at BEFORE UPDATE ON public.qualification_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qualification_responses_updated_at BEFORE UPDATE ON public.qualification_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_log_risk_change AFTER INSERT OR UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.log_risk_change();
CREATE TRIGGER check_critical_risk_on_assessment AFTER INSERT OR UPDATE OF maturity_level, target_maturity ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.check_critical_risk_score();
CREATE TRIGGER policy_auto_version BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.create_policy_version();

CREATE TRIGGER log_assessments_changes AFTER INSERT OR UPDATE OR DELETE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();
CREATE TRIGGER log_risks_changes AFTER INSERT OR UPDATE OR DELETE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();
CREATE TRIGGER log_evidences_changes AFTER INSERT OR UPDATE OR DELETE ON public.evidences FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();
CREATE TRIGGER log_action_plans_changes AFTER INSERT OR UPDATE OR DELETE ON public.action_plans FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();
CREATE TRIGGER log_policies_changes AFTER INSERT OR UPDATE OR DELETE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

-- =============================================
-- 9. RLS POLICIES (resumo das principais)
-- =============================================

-- Organizations
CREATE POLICY "Admins can view organizations directly" ON public.organizations FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE organization_id = organizations.id AND user_id = auth.uid()) AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update their organization" ON public.organizations FOR UPDATE USING (user_belongs_to_org(auth.uid(), id) AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can create organizations" ON public.organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Profiles
CREATE POLICY "Users can view profiles in their org" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL AND (id = auth.uid() OR user_belongs_to_org(auth.uid(), organization_id)));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- User Roles
CREATE POLICY "Users can view roles in their org" ON public.user_roles FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin') AND user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can insert their own role" ON public.user_roles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Super Admins
CREATE POLICY "Superadmins can view super_admins" ON public.super_admins FOR SELECT USING (auth.uid() = user_id);

-- Frameworks
CREATE POLICY "Users can view frameworks" ON public.frameworks FOR SELECT USING (is_custom = false OR (is_custom = true AND user_belongs_to_org(auth.uid(), organization_id)));
CREATE POLICY "Users can create custom frameworks" ON public.frameworks FOR INSERT WITH CHECK (is_custom = true AND organization_id IS NOT NULL AND user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can update custom frameworks" ON public.frameworks FOR UPDATE USING (is_custom = true AND user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can delete custom frameworks" ON public.frameworks FOR DELETE USING (is_custom = true AND user_belongs_to_org(auth.uid(), organization_id));

-- Controls
CREATE POLICY "Users can view controls" ON public.controls FOR SELECT USING (EXISTS (SELECT 1 FROM public.frameworks f WHERE f.id = controls.framework_id AND (f.is_custom = false OR (f.is_custom = true AND user_belongs_to_org(auth.uid(), f.organization_id)))));
CREATE POLICY "Users can create controls in custom frameworks" ON public.controls FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.frameworks f WHERE f.id = controls.framework_id AND f.is_custom = true AND user_belongs_to_org(auth.uid(), f.organization_id)));
CREATE POLICY "Users can update controls in custom frameworks" ON public.controls FOR UPDATE USING (EXISTS (SELECT 1 FROM public.frameworks f WHERE f.id = controls.framework_id AND f.is_custom = true AND user_belongs_to_org(auth.uid(), f.organization_id)));
CREATE POLICY "Users can delete controls in custom frameworks" ON public.controls FOR DELETE USING (EXISTS (SELECT 1 FROM public.frameworks f WHERE f.id = controls.framework_id AND f.is_custom = true AND user_belongs_to_org(auth.uid(), f.organization_id)));

-- Framework Mappings
CREATE POLICY "Anyone can view mappings" ON public.framework_mappings FOR SELECT USING (true);

-- Assessments
CREATE POLICY "Users can view org assessments" ON public.assessments FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org assessments" ON public.assessments FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));

-- Assessment Comments
CREATE POLICY "Users can view assessment comments" ON public.assessment_comments FOR SELECT USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_comments.assessment_id AND user_belongs_to_org(auth.uid(), a.organization_id)));
CREATE POLICY "Users can manage assessment comments" ON public.assessment_comments FOR ALL USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_comments.assessment_id AND user_belongs_to_org(auth.uid(), a.organization_id)));

-- Comment Reactions
CREATE POLICY "Users can view reactions" ON public.comment_reactions FOR SELECT USING (EXISTS (SELECT 1 FROM public.assessment_comments ac JOIN public.assessments a ON a.id = ac.assessment_id WHERE ac.id = comment_reactions.comment_id AND user_belongs_to_org(auth.uid(), a.organization_id)));
CREATE POLICY "Users can manage their reactions" ON public.comment_reactions FOR ALL USING (user_id = auth.uid());

-- Risks
CREATE POLICY "Users can view org risks" ON public.risks FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org risks" ON public.risks FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));

-- Risk Controls
CREATE POLICY "Users can view risk controls" ON public.risk_controls FOR SELECT USING (EXISTS (SELECT 1 FROM public.risks r WHERE r.id = risk_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can manage risk controls" ON public.risk_controls FOR ALL USING (EXISTS (SELECT 1 FROM public.risks r WHERE r.id = risk_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- Risk History
CREATE POLICY "Users can view risk history for their org risks" ON public.risk_history FOR SELECT USING (EXISTS (SELECT 1 FROM public.risks r WHERE r.id = risk_history.risk_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- Evidence Folders
CREATE POLICY "Users can view org folders" ON public.evidence_folders FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org folders" ON public.evidence_folders FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));

-- Evidences
CREATE POLICY "Users can view org evidences" ON public.evidences FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org evidences" ON public.evidences FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));

-- Assessment Evidences
CREATE POLICY "Users can view assessment evidences" ON public.assessment_evidences FOR SELECT USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND user_belongs_to_org(auth.uid(), a.organization_id)));
CREATE POLICY "Users can manage assessment evidences" ON public.assessment_evidences FOR ALL USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND user_belongs_to_org(auth.uid(), a.organization_id)));

-- Action Plans
CREATE POLICY "Users can view org action plans" ON public.action_plans FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org action plans" ON public.action_plans FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));

-- Action Plan Tasks
CREATE POLICY "Users can view action plan tasks" ON public.action_plan_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM public.action_plans ap WHERE ap.id = action_plan_id AND user_belongs_to_org(auth.uid(), ap.organization_id)));
CREATE POLICY "Users can manage action plan tasks" ON public.action_plan_tasks FOR ALL USING (EXISTS (SELECT 1 FROM public.action_plans ap WHERE ap.id = action_plan_id AND user_belongs_to_org(auth.uid(), ap.organization_id)));

-- Action Plan Comments
CREATE POLICY "Users can view action plan comments" ON public.action_plan_comments FOR SELECT USING (EXISTS (SELECT 1 FROM public.action_plans ap WHERE ap.id = action_plan_id AND user_belongs_to_org(auth.uid(), ap.organization_id)));
CREATE POLICY "Users can manage action plan comments" ON public.action_plan_comments FOR ALL USING (EXISTS (SELECT 1 FROM public.action_plans ap WHERE ap.id = action_plan_id AND user_belongs_to_org(auth.uid(), ap.organization_id)));

-- Diagnostic Snapshots
CREATE POLICY "Users can view org snapshots" ON public.diagnostic_snapshots FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org snapshots" ON public.diagnostic_snapshots FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));

-- Notifications
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their notifications" ON public.notifications FOR DELETE USING (user_id = auth.uid());

-- Organization Invites
CREATE POLICY "Admins can manage invites for their org" ON public.organization_invites FOR ALL USING (has_role(auth.uid(), 'admin') AND user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view invites sent to their email" ON public.organization_invites FOR SELECT USING (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Access Logs
CREATE POLICY "Admins can view org access logs" ON public.access_logs FOR SELECT USING (has_role(auth.uid(), 'admin') AND user_belongs_to_org(auth.uid(), organization_id));

-- Feedbacks
CREATE POLICY "Users can insert own feedback" ON public.feedbacks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own feedback" ON public.feedbacks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Superadmins can view all feedbacks" ON public.feedbacks FOR SELECT USING (is_super_admin(auth.uid()));

-- Contact Requests
CREATE POLICY "Anyone can insert contact requests" ON public.contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Super admins can view all contact requests" ON public.contact_requests FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Super admins can update contact requests" ON public.contact_requests FOR UPDATE USING (is_super_admin(auth.uid())) WITH CHECK (is_super_admin(auth.uid()));

-- Generated Reports
CREATE POLICY "Users can view org reports" ON public.generated_reports FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can insert org reports" ON public.generated_reports FOR INSERT WITH CHECK (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Admins can delete org reports" ON public.generated_reports FOR DELETE USING (user_belongs_to_org(auth.uid(), organization_id) AND has_role(auth.uid(), 'admin'));

-- Policies module
CREATE POLICY "Users can manage org policies" ON public.policies FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org policies" ON public.policies FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view policy versions" ON public.policy_versions FOR SELECT USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_versions.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can insert policy versions" ON public.policy_versions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_versions.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can manage policy comments" ON public.policy_comments FOR ALL USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_comments.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can view policy comments" ON public.policy_comments FOR SELECT USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_comments.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can manage policy controls" ON public.policy_controls FOR ALL USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_controls.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can view policy controls" ON public.policy_controls FOR SELECT USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_controls.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can manage policy risks" ON public.policy_risks FOR ALL USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_risks.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can view policy risks" ON public.policy_risks FOR SELECT USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_risks.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can manage org workflows" ON public.policy_workflows FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org workflows" ON public.policy_workflows FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage policy approvals" ON public.policy_approvals FOR ALL USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_approvals.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can view policy approvals" ON public.policy_approvals FOR SELECT USING (EXISTS (SELECT 1 FROM public.policies p WHERE p.id = policy_approvals.policy_id AND user_belongs_to_org(auth.uid(), p.organization_id)));
CREATE POLICY "Users can manage org campaigns" ON public.policy_acceptance_campaigns FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org campaigns" ON public.policy_acceptance_campaigns FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view own acceptances" ON public.policy_acceptances FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own acceptances" ON public.policy_acceptances FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Org members can view campaign acceptances" ON public.policy_acceptances FOR SELECT USING (EXISTS (SELECT 1 FROM public.policy_acceptance_campaigns c WHERE c.id = policy_acceptances.campaign_id AND user_belongs_to_org(auth.uid(), c.organization_id)));
CREATE POLICY "Anyone can view system templates" ON public.policy_templates FOR SELECT USING (is_system = true);
CREATE POLICY "Users can view org templates" ON public.policy_templates FOR SELECT USING (organization_id IS NOT NULL AND user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org templates" ON public.policy_templates FOR ALL USING (organization_id IS NOT NULL AND user_belongs_to_org(auth.uid(), organization_id));

-- Vendors module
CREATE POLICY "Anyone can view assessment domains" ON public.vendor_assessment_domains FOR SELECT USING (true);
CREATE POLICY "Users can view org vendors" ON public.vendors FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org vendors" ON public.vendors FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view requirements" ON public.vendor_requirements FOR SELECT USING (organization_id IS NULL OR user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage custom requirements" ON public.vendor_requirements FOR ALL USING (organization_id IS NOT NULL AND user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org assessments" ON public.vendor_assessments FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org assessments" ON public.vendor_assessments FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org responses" ON public.vendor_assessment_responses FOR SELECT USING (EXISTS (SELECT 1 FROM public.vendor_assessments va WHERE va.id = vendor_assessment_responses.assessment_id AND user_belongs_to_org(auth.uid(), va.organization_id)));
CREATE POLICY "Users can manage org responses" ON public.vendor_assessment_responses FOR ALL USING (EXISTS (SELECT 1 FROM public.vendor_assessments va WHERE va.id = vendor_assessment_responses.assessment_id AND user_belongs_to_org(auth.uid(), va.organization_id)));
CREATE POLICY "Users can view org vendor evidences" ON public.vendor_evidences FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org vendor evidences" ON public.vendor_evidences FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org vendor action plans" ON public.vendor_action_plans FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org vendor action plans" ON public.vendor_action_plans FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org due diligence" ON public.vendor_due_diligence FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org due diligence" ON public.vendor_due_diligence FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view due diligence items" ON public.vendor_due_diligence_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.vendor_due_diligence dd WHERE dd.id = vendor_due_diligence_items.due_diligence_id AND user_belongs_to_org(auth.uid(), dd.organization_id)));
CREATE POLICY "Users can manage due diligence items" ON public.vendor_due_diligence_items FOR ALL USING (EXISTS (SELECT 1 FROM public.vendor_due_diligence dd WHERE dd.id = vendor_due_diligence_items.due_diligence_id AND user_belongs_to_org(auth.uid(), dd.organization_id)));
CREATE POLICY "Users can view org contracts" ON public.vendor_contracts FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org contracts" ON public.vendor_contracts FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org incidents" ON public.vendor_incidents FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org incidents" ON public.vendor_incidents FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org slas" ON public.vendor_slas FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org slas" ON public.vendor_slas FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view vault evidences from their organization" ON public.vendor_evidence_vault FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can insert vault evidences to their organization" ON public.vendor_evidence_vault FOR INSERT WITH CHECK (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can update vault evidences from their organization" ON public.vendor_evidence_vault FOR UPDATE USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can delete vault evidences from their organization" ON public.vendor_evidence_vault FOR DELETE USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view risk analyses for their org" ON public.vendor_risk_analyses FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert risk analyses for their org" ON public.vendor_risk_analyses FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete risk analyses for their org" ON public.vendor_risk_analyses FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org offboarding" ON public.vendor_offboarding FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org offboarding" ON public.vendor_offboarding FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage offboarding tasks" ON public.vendor_offboarding_tasks FOR ALL USING (EXISTS (SELECT 1 FROM public.vendor_offboarding o WHERE o.id = vendor_offboarding_tasks.offboarding_id AND user_belongs_to_org(auth.uid(), o.organization_id)));
CREATE POLICY "Users can view offboarding tasks" ON public.vendor_offboarding_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM public.vendor_offboarding o WHERE o.id = vendor_offboarding_tasks.offboarding_id AND user_belongs_to_org(auth.uid(), o.organization_id)));
CREATE POLICY "Admins can manage org portal tokens" ON public.vendor_portal_tokens FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id) AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view org portal tokens" ON public.vendor_portal_tokens FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));

-- Qualification module
CREATE POLICY "Users can view org templates" ON public.qualification_templates FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org templates" ON public.qualification_templates FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view template questions" ON public.qualification_questions FOR SELECT USING (EXISTS (SELECT 1 FROM public.qualification_templates t WHERE t.id = qualification_questions.template_id AND user_belongs_to_org(auth.uid(), t.organization_id)));
CREATE POLICY "Users can manage template questions" ON public.qualification_questions FOR ALL USING (EXISTS (SELECT 1 FROM public.qualification_templates t WHERE t.id = qualification_questions.template_id AND user_belongs_to_org(auth.uid(), t.organization_id)));
CREATE POLICY "Users can view org campaigns" ON public.qualification_campaigns FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can manage org campaigns" ON public.qualification_campaigns FOR ALL USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can view org responses" ON public.qualification_responses FOR SELECT USING (EXISTS (SELECT 1 FROM public.qualification_campaigns c WHERE c.id = qualification_responses.campaign_id AND user_belongs_to_org(auth.uid(), c.organization_id)));
CREATE POLICY "Users can manage org responses" ON public.qualification_responses FOR ALL USING (EXISTS (SELECT 1 FROM public.qualification_campaigns c WHERE c.id = qualification_responses.campaign_id AND user_belongs_to_org(auth.uid(), c.organization_id)));

-- =============================================
-- 10. STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('evidences', 'evidences', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-evidences', 'vendor-evidences', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-contracts', 'vendor-contracts', false) ON CONFLICT DO NOTHING;

-- Storage policies for evidences
CREATE POLICY "Users can view evidences in their org" ON storage.objects FOR SELECT USING (bucket_id = 'evidences' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND organization_id::text = (storage.foldername(name))[1]));
CREATE POLICY "Users can upload evidences" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evidences' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND organization_id::text = (storage.foldername(name))[1]));
CREATE POLICY "Users can delete their evidences" ON storage.objects FOR DELETE USING (bucket_id = 'evidences' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND organization_id::text = (storage.foldername(name))[1]));

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for logos
CREATE POLICY "Logo images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Admins can upload organization logo" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.organization_id::text = (storage.foldername(name))[1] AND ur.role = 'admin'));
CREATE POLICY "Admins can update organization logo" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.organization_id::text = (storage.foldername(name))[1] AND ur.role = 'admin'));
CREATE POLICY "Admins can delete organization logo" ON storage.objects FOR DELETE USING (bucket_id = 'logos' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.organization_id::text = (storage.foldername(name))[1] AND ur.role = 'admin'));

-- Storage policies for vendor-evidences
CREATE POLICY "Users can view vendor evidences" ON storage.objects FOR SELECT USING (bucket_id = 'vendor-evidences' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND organization_id::text = (storage.foldername(name))[1]));
CREATE POLICY "Users can upload vendor evidences" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vendor-evidences' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND organization_id::text = (storage.foldername(name))[1]));
CREATE POLICY "Users can delete vendor evidences" ON storage.objects FOR DELETE USING (bucket_id = 'vendor-evidences' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND organization_id::text = (storage.foldername(name))[1]));

-- Storage policies for vendor-contracts
CREATE POLICY "Users can upload vendor contracts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vendor-contracts' AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can read vendor contracts" ON storage.objects FOR SELECT USING (bucket_id = 'vendor-contracts' AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete vendor contracts" ON storage.objects FOR DELETE USING (bucket_id = 'vendor-contracts' AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()));

-- =============================================
-- 11. SEED DATA
-- =============================================

-- Frameworks padrão
INSERT INTO public.frameworks (code, name, version, description) VALUES
  ('nist_csf', 'NIST Cybersecurity Framework', '2.0', 'Framework de cibersegurança do NIST com 6 funções principais'),
  ('iso_27001', 'ISO/IEC 27001', '2022', 'Norma internacional para sistemas de gestão de segurança da informação'),
  ('bcb_cmn', 'BCB/CMN Resolução 4.893', '2021', 'Regulamentação brasileira para segurança cibernética no setor financeiro');

-- Domínios de avaliação de fornecedores
INSERT INTO public.vendor_assessment_domains (code, name, description, icon, order_index) VALUES
  ('seg_info', 'Segurança da Informação', 'Avaliação de controles de segurança da informação do fornecedor', 'shield', 1),
  ('cyber', 'Cyber Security', 'Avaliação de controles de segurança cibernética', 'lock', 2),
  ('privacy', 'Privacidade de Dados', 'Avaliação de conformidade com LGPD e privacidade', 'eye-off', 3),
  ('bcn', 'Continuidade de Negócios', 'Avaliação de planos e gestão de continuidade de negócios', 'refresh-cw', 4);

-- Templates de políticas
INSERT INTO public.policy_templates (title, description, content, category, framework_code, is_system) VALUES
  ('Política de Segurança da Informação', 'Diretrizes gerais de segurança da informação.', '<h1>Política de Segurança da Informação</h1><p>Diretrizes para proteção dos ativos de informação.</p>', 'Segurança', 'iso_27001', true),
  ('Política de Controle de Acesso', 'Regras para concessão e revogação de acessos.', '<h1>Política de Controle de Acesso</h1><p>Acesso controlado e rastreável.</p>', 'Acesso', 'iso_27001', true),
  ('Política de Uso Aceitável', 'Regras de uso de recursos tecnológicos.', '<h1>Política de Uso Aceitável</h1><p>Uso adequado dos recursos de TI.</p>', 'Segurança', 'iso_27001', true),
  ('Política de Backup e Recuperação', 'Procedimentos de backup conforme BCB 4.893.', '<h1>Política de Backup</h1><p>Disponibilidade e integridade dos dados.</p>', 'Continuidade', 'bcb_cmn', true),
  ('Política de Resposta a Incidentes', 'Procedimentos de resposta a incidentes.', '<h1>Política de Resposta a Incidentes</h1><p>Processo estruturado de tratamento.</p>', 'Segurança', 'nist_csf', true),
  ('Política de Privacidade e LGPD', 'Diretrizes de proteção de dados pessoais.', '<h1>Política de Privacidade</h1><p>Conformidade com a LGPD.</p>', 'Privacidade', NULL, true);

-- Habilitar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =============================================
-- FIM DO SCHEMA
-- =============================================
-- NOTA: Os controles dos frameworks (NIST CSF, ISO 27001, BCB/CMN) e os
-- requisitos padrão de fornecedores são inseridos pelas migrações individuais.
-- Consulte a pasta supabase/migrations/ para os dados completos de seed.
-- 
-- Para adicionar seu primeiro super admin, execute:
-- INSERT INTO public.super_admins (user_id) SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com';
