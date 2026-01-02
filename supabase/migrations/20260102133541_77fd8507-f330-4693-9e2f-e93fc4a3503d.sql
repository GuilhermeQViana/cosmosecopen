-- Create table for risk history tracking
CREATE TABLE public.risk_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_id UUID NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES auth.users(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'level_change', 'treatment_change')),
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  old_level INTEGER,
  new_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.risk_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view risk history for their org risks"
ON public.risk_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.risks r
    WHERE r.id = risk_history.risk_id
    AND user_belongs_to_org(auth.uid(), r.organization_id)
  )
);

-- Create index for faster lookups
CREATE INDEX idx_risk_history_risk_id ON public.risk_history(risk_id);
CREATE INDEX idx_risk_history_created_at ON public.risk_history(created_at DESC);

-- Function to log risk changes
CREATE OR REPLACE FUNCTION public.log_risk_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_level INTEGER;
  new_level INTEGER;
  change_type TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Log creation
    INSERT INTO public.risk_history (risk_id, changed_by, change_type, new_level)
    VALUES (NEW.id, auth.uid(), 'created', NEW.inherent_probability * NEW.inherent_impact);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    old_level := OLD.inherent_probability * OLD.inherent_impact;
    new_level := NEW.inherent_probability * NEW.inherent_impact;

    -- Check for level change
    IF old_level != new_level THEN
      INSERT INTO public.risk_history (risk_id, changed_by, change_type, field_changed, old_value, new_value, old_level, new_level)
      VALUES (NEW.id, auth.uid(), 'level_change', 'inherent_level', old_level::TEXT, new_level::TEXT, old_level, new_level);
      
      -- Create notification if risk increased to critical
      IF new_level >= 20 AND old_level < 20 THEN
        INSERT INTO public.notifications (user_id, organization_id, title, message, type, link)
        SELECT ur.user_id, NEW.organization_id, 
               'Risco Crítico: ' || NEW.code,
               'O risco "' || NEW.title || '" atingiu nível crítico.',
               'risk',
               '/riscos'
        FROM public.user_roles ur
        WHERE ur.organization_id = NEW.organization_id AND ur.role = 'admin';
      END IF;
    END IF;

    -- Check for treatment change
    IF OLD.treatment != NEW.treatment THEN
      INSERT INTO public.risk_history (risk_id, changed_by, change_type, field_changed, old_value, new_value, old_level, new_level)
      VALUES (NEW.id, auth.uid(), 'treatment_change', 'treatment', OLD.treatment, NEW.treatment, old_level, new_level);
    END IF;

    -- Log other updates
    IF OLD.title != NEW.title OR OLD.description IS DISTINCT FROM NEW.description OR OLD.category IS DISTINCT FROM NEW.category THEN
      INSERT INTO public.risk_history (risk_id, changed_by, change_type, old_level, new_level)
      VALUES (NEW.id, auth.uid(), 'updated', old_level, new_level);
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Create trigger for risk changes
CREATE TRIGGER trigger_log_risk_change
AFTER INSERT OR UPDATE ON public.risks
FOR EACH ROW
EXECUTE FUNCTION public.log_risk_change();

-- Function to create deadline notifications (to be called by cron)
CREATE OR REPLACE FUNCTION public.check_deadline_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify for action plans due in 3 days
  INSERT INTO public.notifications (user_id, organization_id, title, message, type, link)
  SELECT 
    COALESCE(ap.assigned_to, ap.created_by),
    ap.organization_id,
    'Prazo Próximo: ' || ap.title,
    'O plano de ação vence em 3 dias.',
    'deadline',
    '/plano-acao'
  FROM public.action_plans ap
  WHERE ap.due_date = CURRENT_DATE + INTERVAL '3 days'
    AND ap.status NOT IN ('done')
    AND COALESCE(ap.assigned_to, ap.created_by) IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.link = '/plano-acao' 
        AND n.title LIKE 'Prazo Próximo:%'
        AND n.created_at > NOW() - INTERVAL '1 day'
        AND n.user_id = COALESCE(ap.assigned_to, ap.created_by)
    );

  -- Notify for overdue action plans
  INSERT INTO public.notifications (user_id, organization_id, title, message, type, link)
  SELECT 
    COALESCE(ap.assigned_to, ap.created_by),
    ap.organization_id,
    'Prazo Vencido: ' || ap.title,
    'Este plano de ação está atrasado.',
    'deadline',
    '/plano-acao'
  FROM public.action_plans ap
  WHERE ap.due_date < CURRENT_DATE
    AND ap.status NOT IN ('done')
    AND COALESCE(ap.assigned_to, ap.created_by) IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.link = '/plano-acao' 
        AND n.title LIKE 'Prazo Vencido:%'
        AND n.created_at > NOW() - INTERVAL '1 day'
        AND n.user_id = COALESCE(ap.assigned_to, ap.created_by)
    );
END;
$$;

-- Allow INSERT for notifications from triggers
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);