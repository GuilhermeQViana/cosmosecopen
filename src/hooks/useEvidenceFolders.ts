import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface EvidenceFolder {
  id: string;
  name: string;
  parent_id: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export function useEvidenceFolders() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['evidence-folders', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('evidence_folders')
        .select('*')
        .eq('organization_id', organization.id)
        .order('name');

      if (error) throw error;
      return data as EvidenceFolder[];
    },
    enabled: !!organization?.id,
  });
}

export function useCreateEvidenceFolder() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async ({ name, parent_id }: { name: string; parent_id?: string | null }) => {
      if (!organization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('evidence_folders')
        .insert({
          name,
          parent_id: parent_id || null,
          organization_id: organization.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence-folders'] });
    },
  });
}

export function useUpdateEvidenceFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('evidence_folders')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence-folders'] });
    },
  });
}

export function useDeleteEvidenceFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('evidence_folders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence-folders'] });
      queryClient.invalidateQueries({ queryKey: ['evidences'] });
    },
  });
}

export function useMoveEvidenceToFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ evidenceId, folderId }: { evidenceId: string; folderId: string | null }) => {
      const { error } = await supabase
        .from('evidences')
        .update({ folder_id: folderId })
        .eq('id', evidenceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidences'] });
    },
  });
}
