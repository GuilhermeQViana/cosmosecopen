import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const orgId = organization?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
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

  const createTemplate = useMutation({
    mutationFn: async (input: { title: string; description: string; category: string; content: string }) => {
      const { data, error } = await supabase.from('policy_templates').insert({
        title: input.title,
        description: input.description || null,
        category: input.category || null,
        content: input.content,
        is_system: false,
        organization_id: orgId!,
        created_by: user?.id ?? null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-templates', orgId] });
    },
  });

  return { ...query, createTemplate };
}
