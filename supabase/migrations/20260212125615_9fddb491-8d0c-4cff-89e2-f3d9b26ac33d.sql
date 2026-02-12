
CREATE TABLE public.vendor_risk_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL,
  trend TEXT NOT NULL,
  top_concerns TEXT[] NOT NULL DEFAULT '{}',
  recommendation TEXT NOT NULL,
  summary TEXT NOT NULL,
  analyzed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendor_risk_analyses_vendor ON public.vendor_risk_analyses(vendor_id);
CREATE INDEX idx_vendor_risk_analyses_org ON public.vendor_risk_analyses(organization_id);

ALTER TABLE public.vendor_risk_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risk analyses for their org"
ON public.vendor_risk_analyses FOR SELECT
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert risk analyses for their org"
ON public.vendor_risk_analyses FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete risk analyses for their org"
ON public.vendor_risk_analyses FOR DELETE
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
