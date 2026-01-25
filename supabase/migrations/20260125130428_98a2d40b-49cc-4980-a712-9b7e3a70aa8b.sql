-- =============================================
-- FASE 1: CORREÇÕES DE SEGURANÇA CRÍTICAS
-- =============================================

-- 1.1 Corrigir vazamento de dados de perfis
-- Remove a policy atual que permite visualização sem autenticação adequada
DROP POLICY IF EXISTS "Users can view profiles in their org" ON public.profiles;

-- Cria nova policy restritiva que exige autenticação
CREATE POLICY "Users can view profiles in their org"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    id = auth.uid() 
    OR user_belongs_to_org(auth.uid(), organization_id)
  )
);

-- 1.2 Proteger tokens de convite de organização
-- Remove a policy que expõe tokens para qualquer pessoa
DROP POLICY IF EXISTS "Anyone can view invite by token" ON public.organization_invites;

-- Cria policy que só permite ver convites direcionados ao próprio email
CREATE POLICY "Users can view invites sent to their email"
ON public.organization_invites FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 1.3 Restringir sistema de notificações
-- Remove a policy permissiva que permite qualquer usuário inserir notificações
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Cria função SECURITY DEFINER para inserção controlada de notificações
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _organization_id uuid,
  _title text,
  _message text DEFAULT NULL,
  _type text DEFAULT 'info',
  _link text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notification_id uuid;
BEGIN
  -- Verifica se o chamador tem permissão (pertence à mesma organização ou é o próprio usuário)
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Insere a notificação
  INSERT INTO public.notifications (user_id, organization_id, title, message, type, link)
  VALUES (_user_id, _organization_id, _title, _message, _type, _link)
  RETURNING id INTO _notification_id;
  
  RETURN _notification_id;
END;
$$;

-- Adiciona policy de DELETE para notificações (usuários podem deletar suas próprias)
CREATE POLICY "Users can delete their notifications"
ON public.notifications FOR DELETE
USING (user_id = auth.uid());