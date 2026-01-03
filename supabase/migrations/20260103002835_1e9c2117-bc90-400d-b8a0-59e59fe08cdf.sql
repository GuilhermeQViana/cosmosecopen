-- Alterar tabela frameworks para suportar frameworks customizados

-- Primeiro, adicionar as novas colunas
ALTER TABLE public.frameworks 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by uuid;

-- Alterar o tipo do campo code de enum para text
ALTER TABLE public.frameworks 
ALTER COLUMN code TYPE text USING code::text;

-- Criar índice para melhorar performance de queries por organização
CREATE INDEX IF NOT EXISTS idx_frameworks_organization_id ON public.frameworks(organization_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_is_custom ON public.frameworks(is_custom);

-- Atualizar RLS policies para frameworks

-- Remover policies existentes
DROP POLICY IF EXISTS "Anyone can view frameworks" ON public.frameworks;

-- Criar nova policy para SELECT: todos podem ver frameworks padrão, apenas membros da org podem ver customizados
CREATE POLICY "Users can view frameworks"
ON public.frameworks
FOR SELECT
USING (
  is_custom = false 
  OR (is_custom = true AND user_belongs_to_org(auth.uid(), organization_id))
);

-- Policy para INSERT: apenas membros da organização podem criar frameworks customizados
CREATE POLICY "Users can create custom frameworks"
ON public.frameworks
FOR INSERT
WITH CHECK (
  is_custom = true 
  AND organization_id IS NOT NULL 
  AND user_belongs_to_org(auth.uid(), organization_id)
);

-- Policy para UPDATE: apenas membros da organização podem atualizar seus frameworks customizados
CREATE POLICY "Users can update custom frameworks"
ON public.frameworks
FOR UPDATE
USING (
  is_custom = true 
  AND user_belongs_to_org(auth.uid(), organization_id)
);

-- Policy para DELETE: apenas membros da organização podem deletar seus frameworks customizados
CREATE POLICY "Users can delete custom frameworks"
ON public.frameworks
FOR DELETE
USING (
  is_custom = true 
  AND user_belongs_to_org(auth.uid(), organization_id)
);

-- Atualizar RLS para tabela controls para permitir criação de controles em frameworks customizados

-- Remover policy existente
DROP POLICY IF EXISTS "Anyone can view controls" ON public.controls;

-- Criar policy para SELECT: todos podem ver controles de frameworks padrão, apenas membros podem ver de customizados
CREATE POLICY "Users can view controls"
ON public.controls
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.frameworks f
    WHERE f.id = controls.framework_id
    AND (f.is_custom = false OR (f.is_custom = true AND user_belongs_to_org(auth.uid(), f.organization_id)))
  )
);

-- Policy para INSERT: apenas para frameworks customizados da organização
CREATE POLICY "Users can create controls in custom frameworks"
ON public.controls
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.frameworks f
    WHERE f.id = controls.framework_id
    AND f.is_custom = true
    AND user_belongs_to_org(auth.uid(), f.organization_id)
  )
);

-- Policy para UPDATE: apenas para frameworks customizados da organização
CREATE POLICY "Users can update controls in custom frameworks"
ON public.controls
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.frameworks f
    WHERE f.id = controls.framework_id
    AND f.is_custom = true
    AND user_belongs_to_org(auth.uid(), f.organization_id)
  )
);

-- Policy para DELETE: apenas para frameworks customizados da organização
CREATE POLICY "Users can delete controls in custom frameworks"
ON public.controls
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.frameworks f
    WHERE f.id = controls.framework_id
    AND f.is_custom = true
    AND user_belongs_to_org(auth.uid(), f.organization_id)
  )
);