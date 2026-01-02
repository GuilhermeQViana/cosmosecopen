-- Function to calculate risk score and create notification for critical controls
CREATE OR REPLACE FUNCTION public.check_critical_risk_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  control_weight INTEGER;
  target_maturity INTEGER;
  current_maturity INTEGER;
  risk_score INTEGER;
  control_code TEXT;
  control_name TEXT;
BEGIN
  -- Get control details
  SELECT c.weight, c.code, c.name 
  INTO control_weight, control_code, control_name
  FROM public.controls c
  WHERE c.id = NEW.control_id;

  -- Use default weight of 1 if not set
  control_weight := COALESCE(control_weight, 1);
  
  -- Parse maturity levels (they are stored as text enum '0'-'5')
  current_maturity := NEW.maturity_level::INTEGER;
  target_maturity := NEW.target_maturity::INTEGER;
  
  -- Calculate risk score: (target - current) * weight
  risk_score := GREATEST(0, target_maturity - current_maturity) * LEAST(control_weight, 3);
  
  -- If risk score is critical (>= 10), create notifications for admins
  IF risk_score >= 10 THEN
    INSERT INTO public.notifications (user_id, organization_id, title, message, type, link)
    SELECT 
      ur.user_id,
      NEW.organization_id,
      'Risk Score Crítico: ' || control_code,
      'O controle "' || control_name || '" atingiu Risk Score ' || risk_score || ' (Crítico). Ação imediata requerida.',
      'risk',
      '/diagnostico'
    FROM public.user_roles ur
    WHERE ur.organization_id = NEW.organization_id 
      AND ur.role = 'admin'
      -- Avoid duplicate notifications within 24 hours
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.user_id = ur.user_id
          AND n.title LIKE 'Risk Score Crítico: ' || control_code || '%'
          AND n.created_at > NOW() - INTERVAL '24 hours'
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for assessment changes
DROP TRIGGER IF EXISTS check_critical_risk_on_assessment ON public.assessments;
CREATE TRIGGER check_critical_risk_on_assessment
  AFTER INSERT OR UPDATE OF maturity_level, target_maturity
  ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_critical_risk_score();