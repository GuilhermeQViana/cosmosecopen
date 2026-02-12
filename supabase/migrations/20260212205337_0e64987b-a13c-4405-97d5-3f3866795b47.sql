
-- Add approvers JSONB column to policy_workflows
ALTER TABLE public.policy_workflows 
ADD COLUMN approvers jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Migrate existing data from level1/level2 columns to new approvers array
UPDATE public.policy_workflows
SET approvers = CASE
  WHEN approval_levels = 2 THEN
    jsonb_build_array(
      jsonb_build_object('level', 1, 'approver_id', level1_approver_id, 'department', ''),
      jsonb_build_object('level', 2, 'approver_id', level2_approver_id, 'department', '')
    )
  WHEN approval_levels = 1 THEN
    jsonb_build_array(
      jsonb_build_object('level', 1, 'approver_id', level1_approver_id, 'department', '')
    )
  ELSE '[]'::jsonb
END;
