import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

export type PolicyWorkflow = {
  id: string;
  organization_id: string;
  name: string;
  approval_levels: number;
  level1_role: string | null;
  level1_approver_id: string | null;
  level2_role: string | null;
  level2_approver_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PolicyApproval = {
  id: string;
  policy_id: string;
  version_number: number;
  approval_level: number;
  approver_id: string | null;
  status: string;
  comments: string | null;
  approved_at: string | null;
  created_at: string;
};

export function usePolicyWorkflows() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const workflowsQuery = useQuery({
    queryKey: ['policy-workflows', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('policy_workflows')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PolicyWorkflow[];
    },
    enabled: !!orgId,
  });

  const createWorkflow = useMutation({
    mutationFn: async (input: Omit<PolicyWorkflow, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) => {
      if (!orgId) throw new Error('Sem organização');
      const { data, error } = await supabase
        .from('policy_workflows')
        .insert({ ...input, organization_id: orgId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-workflows', orgId] });
      toast.success('Workflow criado');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateWorkflow = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PolicyWorkflow> & { id: string }) => {
      const { error } = await supabase.from('policy_workflows').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-workflows', orgId] });
      toast.success('Workflow atualizado');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteWorkflow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('policy_workflows').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-workflows', orgId] });
      toast.success('Workflow excluído');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { workflows: workflowsQuery.data || [], isLoading: workflowsQuery.isLoading, createWorkflow, updateWorkflow, deleteWorkflow };
}

export function usePolicyApprovals(policyId?: string) {
  const queryClient = useQueryClient();

  const approvalsQuery = useQuery({
    queryKey: ['policy-approvals', policyId],
    queryFn: async () => {
      if (!policyId) return [];
      const { data, error } = await supabase
        .from('policy_approvals')
        .select('*')
        .eq('policy_id', policyId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as PolicyApproval[];
    },
    enabled: !!policyId,
  });

  const submitForApproval = useMutation({
    mutationFn: async ({ policyId, versionNumber, approverId }: { policyId: string; versionNumber: number; approverId?: string }) => {
      const { error } = await supabase.from('policy_approvals').insert({
        policy_id: policyId,
        version_number: versionNumber,
        approval_level: 1,
        approver_id: approverId || null,
        status: 'pendente',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-approvals', policyId] });
      toast.success('Enviado para aprovação');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleApproval = useMutation({
    mutationFn: async ({ approvalId, status, comments }: { approvalId: string; status: 'aprovada' | 'rejeitada'; comments?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('policy_approvals').update({
        status,
        comments: comments || null,
        approver_id: user?.id,
        approved_at: status === 'aprovada' ? new Date().toISOString() : null,
      }).eq('id', approvalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-approvals', policyId] });
      toast.success('Decisão registrada');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { approvals: approvalsQuery.data || [], isLoading: approvalsQuery.isLoading, submitForApproval, handleApproval };
}
