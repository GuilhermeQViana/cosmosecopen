import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export function useAllVendorIncidents() {
  const { organization } = useOrganization();
  return useQuery({
    queryKey: ['all-vendor-incidents', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await supabase
        .from('vendor_incidents')
        .select('*')
        .eq('organization_id', organization.id)
        .order('incident_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });
}

export function useAllVendorSLAs() {
  const { organization } = useOrganization();
  return useQuery({
    queryKey: ['all-vendor-slas', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await supabase
        .from('vendor_slas')
        .select('*')
        .eq('organization_id', organization.id);
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });
}

export function useAllDueDiligence() {
  const { organization } = useOrganization();
  return useQuery({
    queryKey: ['all-due-diligence', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await supabase
        .from('vendor_due_diligence')
        .select('*')
        .eq('organization_id', organization.id);
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });
}
