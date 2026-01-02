-- Create evidence_folders table for organizing evidences
CREATE TABLE public.evidence_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.evidence_folders(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add folder_id to evidences table
ALTER TABLE public.evidences 
ADD COLUMN folder_id UUID REFERENCES public.evidence_folders(id) ON DELETE SET NULL;

-- Enable RLS on evidence_folders
ALTER TABLE public.evidence_folders ENABLE ROW LEVEL SECURITY;

-- RLS policies for evidence_folders
CREATE POLICY "Users can view org folders"
ON public.evidence_folders
FOR SELECT
USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can manage org folders"
ON public.evidence_folders
FOR ALL
USING (user_belongs_to_org(auth.uid(), organization_id));

-- Create index for better query performance
CREATE INDEX idx_evidence_folders_org ON public.evidence_folders(organization_id);
CREATE INDEX idx_evidence_folders_parent ON public.evidence_folders(parent_id);
CREATE INDEX idx_evidences_folder ON public.evidences(folder_id);

-- Trigger for updated_at
CREATE TRIGGER update_evidence_folders_updated_at
BEFORE UPDATE ON public.evidence_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();