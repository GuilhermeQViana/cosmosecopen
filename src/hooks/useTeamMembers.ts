import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface TeamMember {
  id: string;
  user_id: string;
  role: 'admin' | 'auditor' | 'analyst';
  created_at: string;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email?: string;
  } | null;
}

export function useTeamMembers() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['team-members', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at
        `)
        .eq('organization_id', organization.id);

      if (error) throw error;

      // Fetch profiles for each user
      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return roles.map(role => ({
        ...role,
        profile: profilesMap.get(role.user_id) || null,
      })) as TeamMember[];
    },
    enabled: !!organization?.id,
  });
}
