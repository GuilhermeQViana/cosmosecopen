-- Adicionar coluna framework_id nas tabelas compartilhadas

-- 1. Adicionar framework_id na tabela evidences
ALTER TABLE public.evidences 
ADD COLUMN IF NOT EXISTS framework_id UUID REFERENCES public.frameworks(id);

-- 2. Adicionar framework_id na tabela action_plans
ALTER TABLE public.action_plans 
ADD COLUMN IF NOT EXISTS framework_id UUID REFERENCES public.frameworks(id);

-- 3. Adicionar framework_id na tabela risks
ALTER TABLE public.risks 
ADD COLUMN IF NOT EXISTS framework_id UUID REFERENCES public.frameworks(id);

-- Criar índices para melhor performance nas queries filtradas
CREATE INDEX IF NOT EXISTS idx_evidences_framework_id ON public.evidences(framework_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_framework_id ON public.action_plans(framework_id);
CREATE INDEX IF NOT EXISTS idx_risks_framework_id ON public.risks(framework_id);