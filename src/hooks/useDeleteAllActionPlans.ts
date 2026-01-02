import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export function useDeleteAllActionPlans() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async () => {
      if (!organization?.id) throw new Error('No organization');

      const { error } = await supabase
        .from('action_plans')
        .delete()
        .eq('organization_id', organization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
    },
  });
}
