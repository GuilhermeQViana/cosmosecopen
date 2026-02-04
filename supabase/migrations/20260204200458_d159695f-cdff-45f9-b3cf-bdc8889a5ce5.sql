-- Tabela para armazenar leads de contato comercial
CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT,
  company_size TEXT,
  how_found TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  contacted_at TIMESTAMPTZ,
  contacted_by UUID REFERENCES auth.users(id)
);

-- Índices para consultas frequentes
CREATE INDEX idx_contact_requests_status ON public.contact_requests(status);
CREATE INDEX idx_contact_requests_created_at ON public.contact_requests(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Qualquer pessoa pode inserir (formulário público)
CREATE POLICY "Anyone can insert contact requests"
ON public.contact_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Super admins podem ver todos os contatos
CREATE POLICY "Super admins can view all contact requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Policy: Super admins podem atualizar contatos
CREATE POLICY "Super admins can update contact requests"
ON public.contact_requests
FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));