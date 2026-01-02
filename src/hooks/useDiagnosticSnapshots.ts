import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessments } from './useAssessments';
import { Json } from '@/integrations/supabase/types';

export interface DiagnosticSnapshot {
  id: string;
  organization_id: string;
  framework_id: string;
  name: string;
  snapshot_data: Json;
  created_by: string | null;
  created_at: string;
}

export function useDiagnosticSnapshots() {
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();

  return useQuery({
    queryKey: ['diagnostic-snapshots', organization?.id, currentFramework?.id],
    queryFn: async () => {
      if (!organization?.id || !currentFramework?.id) return [];

      const { data, error } = await supabase
        .from('diagnostic_snapshots')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('framework_id', currentFramework.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DiagnosticSnapshot[];
    },
    enabled: !!organization?.id && !!currentFramework?.id,
  });
}

export function useCreateSnapshot() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();
  const { user } = useAuth();
  const { data: assessments } = useAssessments();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!organization?.id || !currentFramework?.id || !user?.id) {
        throw new Error('Missing required context');
      }

      const snapshotData = assessments?.map(a => ({
        control_id: a.control_id,
        maturity_level: a.maturity_level,
        target_maturity: a.target_maturity,
        status: a.status,
        observations: a.observations,
      })) || [];

      const { data, error } = await supabase
        .from('diagnostic_snapshots')
        .insert({
          organization_id: organization.id,
          framework_id: currentFramework.id,
          name,
          snapshot_data: snapshotData as unknown as Json,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-snapshots'] });
    },
  });
}

export function useDeleteSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (snapshotId: string) => {
      const { error } = await supabase
        .from('diagnostic_snapshots')
        .delete()
        .eq('id', snapshotId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-snapshots'] });
    },
  });
}
