-- Create vendor evidence vault table
CREATE TABLE public.vendor_evidence_vault (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  file_path text NOT NULL,
  file_type text,
  file_size bigint,
  classification text NOT NULL DEFAULT 'interno',
  category text NOT NULL DEFAULT 'outro',
  expires_at timestamptz,
  tags text[],
  uploaded_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_evidence_vault ENABLE ROW LEVEL SECURITY;

-- RLS Policies using the existing user_belongs_to_org function
CREATE POLICY "Users can view vault evidences from their organization"
  ON public.vendor_evidence_vault FOR SELECT
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can insert vault evidences to their organization"
  ON public.vendor_evidence_vault FOR INSERT
  WITH CHECK (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can update vault evidences from their organization"
  ON public.vendor_evidence_vault FOR UPDATE
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can delete vault evidences from their organization"
  ON public.vendor_evidence_vault FOR DELETE
  USING (user_belongs_to_org(auth.uid(), organization_id));

-- Create index for faster queries
CREATE INDEX idx_vendor_evidence_vault_vendor_id ON public.vendor_evidence_vault(vendor_id);
CREATE INDEX idx_vendor_evidence_vault_organization_id ON public.vendor_evidence_vault(organization_id);
CREATE INDEX idx_vendor_evidence_vault_category ON public.vendor_evidence_vault(category);
CREATE INDEX idx_vendor_evidence_vault_classification ON public.vendor_evidence_vault(classification);