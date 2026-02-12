import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Policy = {
  id: string;
  organization_id: string;
  framework_id: string | null;
  title: string;
  description: string | null;
  content: string | null;
  category: string | null;
  status: string;
  version: number;
  owner_id: string | null;
  approver_id: string | null;
  approved_at: string | null;
  published_at: string | null;
  expires_at: string | null;
  next_review_at: string | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PolicyInsert = {
  title: string;
  description?: string | null;
  content?: string | null;
  category?: string | null;
  status?: string;
  framework_id?: string | null;
  owner_id?: string | null;
  approver_id?: string | null;
  expires_at?: string | null;
  next_review_at?: string | null;
  tags?: string[] | null;
};

export function usePolicies() {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const policiesQuery = useQuery({
    queryKey: ['policies', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Policy[];
    },
    enabled: !!orgId,
  });

  const createPolicy = useMutation({
    mutationFn: async (input: PolicyInsert) => {
      if (!orgId || !user) throw new Error('Organização ou usuário não encontrado');
      const { data, error } = await supabase
        .from('policies')
        .insert({
          ...input,
          organization_id: orgId,
          created_by: user.id,
          owner_id: input.owner_id || user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Policy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies', orgId] });
      toast.success('Política criada com sucesso');
    },
    onError: (err: Error) => toast.error('Erro ao criar política: ' + err.message),
  });

  const updatePolicy = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Policy> & { id: string }) => {
      const { data, error } = await supabase
        .from('policies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Policy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies', orgId] });
    },
    onError: (err: Error) => toast.error('Erro ao atualizar política: ' + err.message),
  });

  const deletePolicy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('policies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies', orgId] });
      toast.success('Política excluída');
    },
    onError: (err: Error) => toast.error('Erro ao excluir: ' + err.message),
  });

  return {
    policies: policiesQuery.data || [],
    isLoading: policiesQuery.isLoading,
    createPolicy,
    updatePolicy,
    deletePolicy,
  };
}

export function usePolicy(id: string | undefined) {
  return useQuery({
    queryKey: ['policy', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Policy;
    },
    enabled: !!id,
  });
}
