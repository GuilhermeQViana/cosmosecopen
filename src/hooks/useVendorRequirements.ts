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
  usage_count?: number;
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

export function useVendorRequirementsWithUsage() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['vendor-requirements-usage', organization?.id],
    queryFn: async () => {
      // Fetch all requirements (including inactive for management page)
      let query = supabase
        .from('vendor_requirements')
        .select(`
          *,
          domain:vendor_assessment_domains(*)
        `)
        .order('order_index', { ascending: true });

      if (organization?.id) {
        query = query.or(`organization_id.is.null,organization_id.eq.${organization.id}`);
      } else {
        query = query.is('organization_id', null);
      }

      const { data: requirements, error } = await query;
      if (error) throw error;

      // Get usage counts from vendor_assessment_responses
      const { data: usageCounts, error: usageError } = await supabase
        .from('vendor_assessment_responses')
        .select('requirement_id');

      if (usageError) {
        console.warn('Could not fetch usage counts:', usageError);
        return (requirements || []).map(r => ({ ...r, usage_count: 0 })) as VendorRequirement[];
      }

      // Count occurrences per requirement_id
      const countMap: Record<string, number> = {};
      (usageCounts || []).forEach((row: any) => {
        countMap[row.requirement_id] = (countMap[row.requirement_id] || 0) + 1;
      });

      return (requirements || []).map(r => ({
        ...r,
        usage_count: countMap[r.id] || 0,
      })) as VendorRequirement[];
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
