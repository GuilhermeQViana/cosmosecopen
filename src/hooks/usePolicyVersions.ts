import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PolicyVersion = {
  id: string;
  policy_id: string;
  version_number: number;
  title: string;
  content: string;
  change_summary: string | null;
  changed_by: string | null;
  created_at: string;
};

export function usePolicyVersions(policyId: string | undefined) {
  return useQuery({
    queryKey: ['policy-versions', policyId],
    queryFn: async () => {
      if (!policyId) return [];
      const { data, error } = await supabase
        .from('policy_versions')
        .select('*')
        .eq('policy_id', policyId)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return data as PolicyVersion[];
    },
    enabled: !!policyId,
  });
}
