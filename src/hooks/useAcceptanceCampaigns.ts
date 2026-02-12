import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type AcceptanceCampaign = {
  id: string;
  policy_id: string;
  organization_id: string;
  title: string;
  description: string | null;
  target_audience: string;
  target_roles: string[] | null;
  deadline: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  policy_title?: string;
  total_users?: number;
  accepted_count?: number;
};

export type PolicyAcceptance = {
  id: string;
  campaign_id: string;
  user_id: string;
  accepted_at: string;
  ip_address: string | null;
};

export function useAcceptanceCampaigns() {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const campaignsQuery = useQuery({
    queryKey: ['acceptance-campaigns', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data: campaigns, error } = await supabase
        .from('policy_acceptance_campaigns')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch policy titles
      const policyIds = [...new Set((campaigns || []).map(c => c.policy_id))];
      let policyMap: Record<string, string> = {};
      if (policyIds.length > 0) {
        const { data: policies } = await supabase.from('policies').select('id, title').in('id', policyIds);
        if (policies) policyMap = Object.fromEntries(policies.map(p => [p.id, p.title]));
      }

      // Fetch acceptance counts
      const campaignIds = (campaigns || []).map(c => c.id);
      let acceptanceMap: Record<string, number> = {};
      if (campaignIds.length > 0) {
        const { data: acceptances } = await supabase.from('policy_acceptances').select('campaign_id').in('campaign_id', campaignIds);
        if (acceptances) {
          acceptances.forEach(a => { acceptanceMap[a.campaign_id] = (acceptanceMap[a.campaign_id] || 0) + 1; });
        }
      }

      // Fetch total team members count
      const { count: totalUsers } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('organization_id', orgId);

      return (campaigns || []).map(c => ({
        ...c,
        policy_title: policyMap[c.policy_id] || 'Política removida',
        accepted_count: acceptanceMap[c.id] || 0,
        total_users: totalUsers || 0,
      })) as AcceptanceCampaign[];
    },
    enabled: !!orgId,
  });

  const createCampaign = useMutation({
    mutationFn: async (input: { policy_id: string; title: string; description?: string; target_audience?: string; deadline?: string }) => {
      if (!orgId || !user) throw new Error('Sem contexto');
      const { data, error } = await supabase
        .from('policy_acceptance_campaigns')
        .insert({
          ...input,
          organization_id: orgId,
          created_by: user.id,
          target_audience: input.target_audience || 'todos',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceptance-campaigns', orgId] });
      toast.success('Campanha criada');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const closeCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('policy_acceptance_campaigns').update({ status: 'encerrada' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceptance-campaigns', orgId] });
      toast.success('Campanha encerrada');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const acceptPolicy = useMutation({
    mutationFn: async (campaignId: string) => {
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('policy_acceptances').insert({
        campaign_id: campaignId,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceptance-campaigns', orgId] });
      toast.success('Aceite registrado');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    campaigns: campaignsQuery.data || [],
    isLoading: campaignsQuery.isLoading,
    createCampaign,
    closeCampaign,
    acceptPolicy,
  };
}
