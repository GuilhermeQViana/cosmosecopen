-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'auditor', 'analyst');
CREATE TYPE public.framework_type AS ENUM ('nist_csf', 'iso_27001', 'bcb_cmn');
CREATE TYPE public.maturity_level AS ENUM ('0', '1', '2', '3', '4', '5');
CREATE TYPE public.conformity_status AS ENUM ('conforme', 'parcial', 'nao_conforme', 'nao_aplicavel');
CREATE TYPE public.risk_treatment AS ENUM ('mitigar', 'aceitar', 'transferir', 'evitar');
CREATE TYPE public.task_priority AS ENUM ('critica', 'alta', 'media', 'baixa');
CREATE TYPE public.task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done');
CREATE TYPE public.evidence_classification AS ENUM ('publico', 'interno', 'confidencial');

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Frameworks table (seed data)
CREATE TABLE public.frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code framework_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Controls table (control items from each framework)
CREATE TABLE public.controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES public.frameworks(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.controls(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Framework mappings (cross-framework relationships)
CREATE TABLE public.framework_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_control_id UUID REFERENCES public.controls(id) ON DELETE CASCADE NOT NULL,
  target_control_id UUID REFERENCES public.controls(id) ON DELETE CASCADE NOT NULL,
  mapping_type TEXT NOT NULL DEFAULT 'equivalent', -- equivalent, partial, related
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_control_id, target_control_id)
);

-- Assessments (control evaluations per organization)
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

-- Risks registry
CREATE TABLE public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
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

-- Link risks to controls
CREATE TABLE public.risk_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES public.risks(id) ON DELETE CASCADE NOT NULL,
  control_id UUID REFERENCES public.controls(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(risk_id, control_id)
);

-- Evidences vault
CREATE TABLE public.evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
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

-- Link evidences to assessments
CREATE TABLE public.assessment_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  evidence_id UUID REFERENCES public.evidences(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assessment_id, evidence_id)
);

-- Action plans
CREATE TABLE public.action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
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

-- Action plan tasks (subtasks)
CREATE TABLE public.action_plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID REFERENCES public.action_plans(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Action plan comments
CREATE TABLE public.action_plan_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID REFERENCES public.action_plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
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

-- Access logs for auditing
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

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plan_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Check if user belongs to organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND organization_id = _org_id
  )
$$;

-- RLS Policies

-- Organizations: users can see their own org
CREATE POLICY "Users can view their organization"
  ON public.organizations FOR SELECT
  USING (public.user_belongs_to_org(auth.uid(), id));

CREATE POLICY "Admins can update their organization"
  ON public.organizations FOR UPDATE
  USING (public.user_belongs_to_org(auth.uid(), id) AND public.has_role(auth.uid(), 'admin'));

-- Profiles: users can manage their own profile
CREATE POLICY "Users can view profiles in their org"
  ON public.profiles FOR SELECT
  USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id) OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- User roles: admins can manage, users can view
CREATE POLICY "Users can view roles in their org"
  ON public.user_roles FOR SELECT
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin') AND public.user_belongs_to_org(auth.uid(), organization_id));

-- Frameworks: public read
CREATE POLICY "Anyone can view frameworks"
  ON public.frameworks FOR SELECT
  TO authenticated
  USING (true);

-- Controls: public read
CREATE POLICY "Anyone can view controls"
  ON public.controls FOR SELECT
  TO authenticated
  USING (true);

-- Framework mappings: public read
CREATE POLICY "Anyone can view mappings"
  ON public.framework_mappings FOR SELECT
  TO authenticated
  USING (true);

-- Assessments: org-scoped
CREATE POLICY "Users can view org assessments"
  ON public.assessments FOR SELECT
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org assessments"
  ON public.assessments FOR ALL
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

-- Risks: org-scoped
CREATE POLICY "Users can view org risks"
  ON public.risks FOR SELECT
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org risks"
  ON public.risks FOR ALL
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

-- Risk controls: org-scoped via risk
CREATE POLICY "Users can view risk controls"
  ON public.risk_controls FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.risks r
    WHERE r.id = risk_id AND public.user_belongs_to_org(auth.uid(), r.organization_id)
  ));

CREATE POLICY "Users can manage risk controls"
  ON public.risk_controls FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.risks r
    WHERE r.id = risk_id AND public.user_belongs_to_org(auth.uid(), r.organization_id)
  ));

-- Evidences: org-scoped
CREATE POLICY "Users can view org evidences"
  ON public.evidences FOR SELECT
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org evidences"
  ON public.evidences FOR ALL
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

-- Assessment evidences: org-scoped via assessment
CREATE POLICY "Users can view assessment evidences"
  ON public.assessment_evidences FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = assessment_id AND public.user_belongs_to_org(auth.uid(), a.organization_id)
  ));

CREATE POLICY "Users can manage assessment evidences"
  ON public.assessment_evidences FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = assessment_id AND public.user_belongs_to_org(auth.uid(), a.organization_id)
  ));

-- Action plans: org-scoped
CREATE POLICY "Users can view org action plans"
  ON public.action_plans FOR SELECT
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org action plans"
  ON public.action_plans FOR ALL
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

-- Action plan tasks: via action plan
CREATE POLICY "Users can view action plan tasks"
  ON public.action_plan_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.action_plans ap
    WHERE ap.id = action_plan_id AND public.user_belongs_to_org(auth.uid(), ap.organization_id)
  ));

CREATE POLICY "Users can manage action plan tasks"
  ON public.action_plan_tasks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.action_plans ap
    WHERE ap.id = action_plan_id AND public.user_belongs_to_org(auth.uid(), ap.organization_id)
  ));

-- Action plan comments: via action plan
CREATE POLICY "Users can view action plan comments"
  ON public.action_plan_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.action_plans ap
    WHERE ap.id = action_plan_id AND public.user_belongs_to_org(auth.uid(), ap.organization_id)
  ));

CREATE POLICY "Users can manage action plan comments"
  ON public.action_plan_comments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.action_plans ap
    WHERE ap.id = action_plan_id AND public.user_belongs_to_org(auth.uid(), ap.organization_id)
  ));

-- Notifications: user-scoped
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Access logs: admins can view org logs
CREATE POLICY "Admins can view org access logs"
  ON public.access_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') AND public.user_belongs_to_org(auth.uid(), organization_id));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_evidences_updated_at BEFORE UPDATE ON public.evidences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_action_plans_updated_at BEFORE UPDATE ON public.action_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Handle new user trigger (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert seed data for frameworks
INSERT INTO public.frameworks (code, name, version, description) VALUES
  ('nist_csf', 'NIST Cybersecurity Framework', '2.0', 'Framework de cibersegurança do NIST com 6 funções principais'),
  ('iso_27001', 'ISO/IEC 27001', '2022', 'Norma internacional para sistemas de gestão de segurança da informação'),
  ('bcb_cmn', 'BCB/CMN Resolução 4.893', '2021', 'Regulamentação brasileira para segurança cibernética no setor financeiro');

-- Create storage bucket for evidences
INSERT INTO storage.buckets (id, name, public) VALUES ('evidences', 'evidences', false);

-- Storage policies
CREATE POLICY "Users can upload evidences"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'evidences' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view evidences in their org"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'evidences' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their evidences"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'evidences' AND auth.role() = 'authenticated');