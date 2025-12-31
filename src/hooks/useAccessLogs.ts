import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface AccessLog {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  user_id: string | null;
  ip_address: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useAccessLogs() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['access-logs', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch profiles for users
      const userIds = [...new Set(data.filter(l => l.user_id).map(l => l.user_id as string))];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

        return data.map(log => ({
          ...log,
          profile: log.user_id ? profilesMap.get(log.user_id) : null,
        })) as AccessLog[];
      }

      return data as AccessLog[];
    },
    enabled: !!organization?.id,
  });
}
