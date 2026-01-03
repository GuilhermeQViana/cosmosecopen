import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface VendorAssessmentDomain {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  order_index: number;
}

export interface VendorRequirement {
  id: string;
  domain_id: string;
  organization_id: string | null;
  code: string;
  name: string;
  description: string | null;
  weight: number;
  evidence_example: string | null;
  order_index: number;
  is_active: boolean;
  domain?: VendorAssessmentDomain;
}

export function useVendorDomains() {
  return useQuery({
    queryKey: ['vendor-assessment-domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_assessment_domains')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as VendorAssessmentDomain[];
    },
  });
}

export function useVendorRequirements() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['vendor-requirements', organization?.id],
    queryFn: async () => {
      // Fetch default requirements (org_id NULL) and custom ones for this org
      let query = supabase
        .from('vendor_requirements')
        .select(`
          *,
          domain:vendor_assessment_domains(*)
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (organization?.id) {
        query = query.or(`organization_id.is.null,organization_id.eq.${organization.id}`);
      } else {
        query = query.is('organization_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as VendorRequirement[];
    },
    enabled: true,
  });
}

export function useVendorRequirementsByDomain() {
  const { data: requirements, isLoading, error } = useVendorRequirements();
  const { data: domains } = useVendorDomains();

  const requirementsByDomain = domains?.map((domain) => ({
    domain,
    requirements: requirements?.filter((r) => r.domain_id === domain.id) || [],
  })) || [];

  return {
    requirementsByDomain,
    isLoading,
    error,
    totalRequirements: requirements?.length || 0,
  };
}
