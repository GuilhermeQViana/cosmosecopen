import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Policy-Risk linkages
export function usePolicyRisks(policyId: string | undefined) {
  return useQuery({
    queryKey: ['policy-risks', policyId],
    queryFn: async () => {
      if (!policyId) return [];
      const { data, error } = await supabase
        .from('policy_risks')
        .select('*, risks(id, code, title, category, inherent_probability, inherent_impact)')
        .eq('policy_id', policyId);
      if (error) throw error;
      return data;
    },
    enabled: !!policyId,
  });
}

export function useLinkPolicyRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ policyId, riskId }: { policyId: string; riskId: string }) => {
      const { error } = await supabase.from('policy_risks').insert({ policy_id: policyId, risk_id: riskId });
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['policy-risks', v.policyId] });
      toast.success('Risco vinculado');
    },
    onError: () => toast.error('Erro ao vincular risco'),
  });
}

export function useUnlinkPolicyRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ policyId, riskId }: { policyId: string; riskId: string }) => {
      const { error } = await supabase.from('policy_risks').delete().eq('policy_id', policyId).eq('risk_id', riskId);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['policy-risks', v.policyId] });
      toast.success('Risco desvinculado');
    },
    onError: () => toast.error('Erro ao desvincular risco'),
  });
}

// Policy-Control linkages
export function usePolicyControls(policyId: string | undefined) {
  return useQuery({
    queryKey: ['policy-controls', policyId],
    queryFn: async () => {
      if (!policyId) return [];
      const { data, error } = await supabase
        .from('policy_controls')
        .select('*, controls(id, code, name, category, framework_id)')
        .eq('policy_id', policyId);
      if (error) throw error;
      return data;
    },
    enabled: !!policyId,
  });
}

export function useLinkPolicyControl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ policyId, controlId }: { policyId: string; controlId: string }) => {
      const { error } = await supabase.from('policy_controls').insert({ policy_id: policyId, control_id: controlId });
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['policy-controls', v.policyId] });
      toast.success('Controle vinculado');
    },
    onError: () => toast.error('Erro ao vincular controle'),
  });
}

export function useUnlinkPolicyControl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ policyId, controlId }: { policyId: string; controlId: string }) => {
      const { error } = await supabase.from('policy_controls').delete().eq('policy_id', policyId).eq('control_id', controlId);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['policy-controls', v.policyId] });
      toast.success('Controle desvinculado');
    },
    onError: () => toast.error('Erro ao desvincular controle'),
  });
}
