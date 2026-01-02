-- Add risk_id column to action_plans table to link action plans to risks
ALTER TABLE public.action_plans 
ADD COLUMN risk_id uuid REFERENCES public.risks(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_action_plans_risk_id ON public.action_plans(risk_id);