import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export type PolicyTemplate = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string | null;
  framework_code: string | null;
  is_system: boolean;
  organization_id: string | null;
  created_by: string | null;
  created_at: string;
};

export function usePolicyTemplates() {
  const { organization } = useOrganization();
  const orgId = organization?.id;

  return useQuery({
    queryKey: ['policy-templates', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policy_templates')
        .select('*')
        .or(`is_system.eq.true,organization_id.eq.${orgId}`)
        .order('title');
      if (error) throw error;
      return data as PolicyTemplate[];
    },
    enabled: !!orgId,
  });
}
