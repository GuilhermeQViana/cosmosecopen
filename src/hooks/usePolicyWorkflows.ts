import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

export type PolicyWorkflow = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  approval_levels: number;
  level1_role: string | null;
  level1_approver_id: string | null;
  level2_role: string | null;
  level2_approver_id: string | null;
  is_default: boolean;
  sla_days: number | null;
  notify_approver: boolean;
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

export type PendingApprovalWithPolicy = PolicyApproval & {
  policy_title: string;
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
      return (data as any[]).map(d => ({
        ...d,
        description: d.description ?? null,
        is_default: d.is_default ?? false,
        sla_days: d.sla_days ?? null,
        notify_approver: d.notify_approver ?? true,
      })) as PolicyWorkflow[];
    },
    enabled: !!orgId,
  });

  const pendingApprovalsQuery = useQuery({
    queryKey: ['pending-approvals-org', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('policy_approvals')
        .select('*, policies!inner(title, organization_id)')
        .eq('status', 'pendente')
        .eq('policies.organization_id', orgId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(d => ({
        ...d,
        policy_title: (d.policies as any)?.title || 'Sem título',
      })) as PendingApprovalWithPolicy[];
    },
    enabled: !!orgId,
  });

  const approvalHistoryQuery = useQuery({
    queryKey: ['approval-history-org', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('policy_approvals')
        .select('*, policies!inner(title, organization_id)')
        .neq('status', 'pendente')
        .eq('policies.organization_id', orgId)
        .order('approved_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as any[]).map(d => ({
        ...d,
        policy_title: (d.policies as any)?.title || 'Sem título',
      })) as PendingApprovalWithPolicy[];
    },
    enabled: !!orgId,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['policy-workflows', orgId] });
    queryClient.invalidateQueries({ queryKey: ['pending-approvals-org', orgId] });
    queryClient.invalidateQueries({ queryKey: ['approval-history-org', orgId] });
  };

  const createWorkflow = useMutation({
    mutationFn: async (input: Omit<PolicyWorkflow, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) => {
      if (!orgId) throw new Error('Sem organização');
      const { data, error } = await supabase
        .from('policy_workflows')
        .insert({ ...input, organization_id: orgId } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { invalidateAll(); toast.success('Workflow criado'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateWorkflow = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PolicyWorkflow> & { id: string }) => {
      const { error } = await supabase.from('policy_workflows').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast.success('Workflow atualizado'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteWorkflow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('policy_workflows').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast.success('Workflow excluído'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const duplicateWorkflow = useMutation({
    mutationFn: async (wf: PolicyWorkflow) => {
      if (!orgId) throw new Error('Sem organização');
      const { data, error } = await supabase
        .from('policy_workflows')
        .insert({
          organization_id: orgId,
          name: `${wf.name} (cópia)`,
          description: wf.description,
          approval_levels: wf.approval_levels,
          level1_role: wf.level1_role,
          level1_approver_id: wf.level1_approver_id,
          level2_role: wf.level2_role,
          level2_approver_id: wf.level2_approver_id,
          is_default: false,
          sla_days: wf.sla_days,
          notify_approver: wf.notify_approver,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { invalidateAll(); toast.success('Workflow duplicado'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const setDefaultWorkflow = useMutation({
    mutationFn: async (id: string) => {
      if (!orgId) throw new Error('Sem organização');
      // Remove default from all
      const { error: e1 } = await supabase
        .from('policy_workflows')
        .update({ is_default: false } as any)
        .eq('organization_id', orgId);
      if (e1) throw e1;
      // Set new default
      const { error: e2 } = await supabase
        .from('policy_workflows')
        .update({ is_default: true } as any)
        .eq('id', id);
      if (e2) throw e2;
    },
    onSuccess: () => { invalidateAll(); toast.success('Workflow padrão definido'); },
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
    onSuccess: () => { invalidateAll(); toast.success('Decisão registrada'); },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    workflows: workflowsQuery.data || [],
    isLoading: workflowsQuery.isLoading,
    pendingApprovals: pendingApprovalsQuery.data || [],
    approvalHistory: approvalHistoryQuery.data || [],
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    setDefaultWorkflow,
    handleApproval,
  };
}
