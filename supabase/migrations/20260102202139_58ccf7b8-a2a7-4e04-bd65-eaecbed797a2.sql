-- Create a secure function to delete an organization
-- Only the organization admin can delete it
CREATE OR REPLACE FUNCTION public.delete_organization(_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _is_admin boolean;
BEGIN
  -- Get the current user id
  _user_id := auth.uid();
  
  -- Check if user is admin of this organization
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = 'admin'
  ) INTO _is_admin;
  
  IF NOT _is_admin THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir organizações';
  END IF;
  
  -- Delete all related data in order
  
  -- Delete action plan tasks
  DELETE FROM public.action_plan_tasks
  WHERE action_plan_id IN (
    SELECT id FROM public.action_plans WHERE organization_id = _org_id
  );
  
  -- Delete action plan comments
  DELETE FROM public.action_plan_comments
  WHERE action_plan_id IN (
    SELECT id FROM public.action_plans WHERE organization_id = _org_id
  );
  
  -- Delete action plans
  DELETE FROM public.action_plans WHERE organization_id = _org_id;
  
  -- Delete assessment evidences
  DELETE FROM public.assessment_evidences
  WHERE assessment_id IN (
    SELECT id FROM public.assessments WHERE organization_id = _org_id
  );
  
  -- Delete comment reactions
  DELETE FROM public.comment_reactions
  WHERE comment_id IN (
    SELECT id FROM public.assessment_comments
    WHERE assessment_id IN (
      SELECT id FROM public.assessments WHERE organization_id = _org_id
    )
  );
  
  -- Delete assessment comments
  DELETE FROM public.assessment_comments
  WHERE assessment_id IN (
    SELECT id FROM public.assessments WHERE organization_id = _org_id
  );
  
  -- Delete assessments
  DELETE FROM public.assessments WHERE organization_id = _org_id;
  
  -- Delete risk controls
  DELETE FROM public.risk_controls
  WHERE risk_id IN (
    SELECT id FROM public.risks WHERE organization_id = _org_id
  );
  
  -- Delete risk history
  DELETE FROM public.risk_history
  WHERE risk_id IN (
    SELECT id FROM public.risks WHERE organization_id = _org_id
  );
  
  -- Delete risks
  DELETE FROM public.risks WHERE organization_id = _org_id;
  
  -- Delete evidences
  DELETE FROM public.evidences WHERE organization_id = _org_id;
  
  -- Delete evidence folders
  DELETE FROM public.evidence_folders WHERE organization_id = _org_id;
  
  -- Delete diagnostic snapshots
  DELETE FROM public.diagnostic_snapshots WHERE organization_id = _org_id;
  
  -- Delete notifications
  DELETE FROM public.notifications WHERE organization_id = _org_id;
  
  -- Delete organization invites
  DELETE FROM public.organization_invites WHERE organization_id = _org_id;
  
  -- Delete access logs
  DELETE FROM public.access_logs WHERE organization_id = _org_id;
  
  -- Delete user roles
  DELETE FROM public.user_roles WHERE organization_id = _org_id;
  
  -- Update profiles to remove organization reference
  UPDATE public.profiles 
  SET organization_id = NULL 
  WHERE organization_id = _org_id;
  
  -- Finally delete the organization
  DELETE FROM public.organizations WHERE id = _org_id;
  
  RETURN true;
END;
$$;