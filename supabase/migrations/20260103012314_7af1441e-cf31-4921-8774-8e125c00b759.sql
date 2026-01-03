-- Função SECURITY DEFINER para registrar logs de acesso de forma segura
-- Esta função contorna RLS para permitir inserção de logs
CREATE OR REPLACE FUNCTION public.log_access_event(
  _action TEXT,
  _entity_type TEXT DEFAULT NULL,
  _entity_id UUID DEFAULT NULL,
  _details JSONB DEFAULT NULL,
  _ip_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
  _user_id UUID;
  _org_id UUID;
BEGIN
  -- Obter user_id e organization_id do usuário atual
  _user_id := auth.uid();
  
  SELECT organization_id INTO _org_id
  FROM public.profiles
  WHERE id = _user_id;
  
  -- Inserir log
  INSERT INTO public.access_logs (
    user_id,
    organization_id,
    action,
    entity_type,
    entity_id,
    details,
    ip_address
  ) VALUES (
    _user_id,
    _org_id,
    _action,
    _entity_type,
    _entity_id,
    _details,
    _ip_address
  )
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- Função genérica de trigger para logging automático
CREATE OR REPLACE FUNCTION public.log_table_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action TEXT;
  _entity_id UUID;
  _details JSONB;
  _org_id UUID;
BEGIN
  -- Determinar a ação
  IF TG_OP = 'INSERT' THEN
    _action := 'create';
    _entity_id := NEW.id;
    _org_id := NEW.organization_id;
    _details := jsonb_build_object(
      'new_data', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    _action := 'update';
    _entity_id := NEW.id;
    _org_id := NEW.organization_id;
    _details := jsonb_build_object(
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW),
      'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(OLD) -> key IS DISTINCT FROM value
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    _action := 'delete';
    _entity_id := OLD.id;
    _org_id := OLD.organization_id;
    _details := jsonb_build_object(
      'deleted_data', to_jsonb(OLD)
    );
  END IF;
  
  -- Inserir log (ignora se user_id for NULL - operações do sistema)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.access_logs (
      user_id,
      organization_id,
      action,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      _org_id,
      _action,
      TG_TABLE_NAME,
      _entity_id,
      _details
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Criar triggers para tabelas principais

-- Trigger para assessments
DROP TRIGGER IF EXISTS log_assessments_changes ON public.assessments;
CREATE TRIGGER log_assessments_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

-- Trigger para risks
DROP TRIGGER IF EXISTS log_risks_changes ON public.risks;
CREATE TRIGGER log_risks_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.risks
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

-- Trigger para evidences
DROP TRIGGER IF EXISTS log_evidences_changes ON public.evidences;
CREATE TRIGGER log_evidences_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.evidences
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

-- Trigger para action_plans
DROP TRIGGER IF EXISTS log_action_plans_changes ON public.action_plans;
CREATE TRIGGER log_action_plans_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.action_plans
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();