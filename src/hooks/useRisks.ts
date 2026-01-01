import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import type { Database } from '@/integrations/supabase/types';

type RiskTreatment = Database['public']['Enums']['risk_treatment'];

export interface Risk {
  id: string;
  code: string;
  title: string;
  description: string | null;
  category: string | null;
  inherent_probability: number;
  inherent_impact: number;
  residual_probability: number | null;
  residual_impact: number | null;
  treatment: RiskTreatment;
  treatment_plan: string | null;
  owner_id: string | null;
  organization_id: string;
  framework_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskControl {
  id: string;
  risk_id: string;
  control_id: string;
  created_at: string;
}

/**
 * Hook to fetch risks.
 * Optionally filters by framework if filterByFramework is true (default: true).
 */
export function useRisks(options?: { filterByFramework?: boolean }) {
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();
  const filterByFramework = options?.filterByFramework ?? true;

  return useQuery({
    queryKey: ['risks', organization?.id, filterByFramework ? currentFramework?.id : null],
    queryFn: async () => {
      if (!organization?.id) return [];

      let query = supabase
        .from('risks')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      // Filter by framework if enabled and framework is selected
      if (filterByFramework && currentFramework?.id) {
        query = query.or(`framework_id.eq.${currentFramework.id},framework_id.is.null`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Risk[];
    },
    enabled: !!organization?.id,
  });
}

export function useRisk(riskId: string | null) {
  return useQuery({
    queryKey: ['risk', riskId],
    queryFn: async () => {
      if (!riskId) return null;

      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('id', riskId)
        .maybeSingle();

      if (error) throw error;
      return data as Risk | null;
    },
    enabled: !!riskId,
  });
}

export function useRiskControls(riskId: string | null) {
  return useQuery({
    queryKey: ['risk-controls', riskId],
    queryFn: async () => {
      if (!riskId) return [];

      const { data, error } = await supabase
        .from('risk_controls')
        .select(`
          id,
          risk_id,
          control_id,
          created_at,
          controls (
            id,
            code,
            name,
            category,
            framework_id,
            frameworks (
              name,
              code
            )
          )
        `)
        .eq('risk_id', riskId);

      if (error) throw error;
      return data;
    },
    enabled: !!riskId,
  });
}

export function useCreateRisk() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();

  return useMutation({
    mutationFn: async (risk: Omit<Risk, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'owner_id' | 'framework_id'>) => {
      if (!organization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('risks')
        .insert({
          ...risk,
          organization_id: organization.id,
          framework_id: currentFramework?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
    },
  });
}

export function useUpdateRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...risk }: Partial<Risk> & { id: string }) => {
      const { data, error } = await supabase
        .from('risks')
        .update(risk)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['risk', variables.id] });
    },
  });
}

export function useDeleteRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('risks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
    },
  });
}

export function useLinkRiskControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ riskId, controlId }: { riskId: string; controlId: string }) => {
      const { data, error } = await supabase
        .from('risk_controls')
        .insert({
          risk_id: riskId,
          control_id: controlId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risk-controls', variables.riskId] });
    },
  });
}

export function useUnlinkRiskControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ riskId, controlId }: { riskId: string; controlId: string }) => {
      const { error } = await supabase
        .from('risk_controls')
        .delete()
        .eq('risk_id', riskId)
        .eq('control_id', controlId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risk-controls', variables.riskId] });
    },
  });
}

// Helper functions
export function calculateRiskLevel(probability: number, impact: number): number {
  return probability * impact;
}

export function getRiskLevelColor(level: number): string {
  if (level >= 20) return 'bg-red-500';
  if (level >= 12) return 'bg-orange-500';
  if (level >= 6) return 'bg-yellow-500';
  if (level >= 3) return 'bg-lime-500';
  return 'bg-green-500';
}

export function getRiskLevelLabel(level: number): string {
  if (level >= 20) return 'Crítico';
  if (level >= 12) return 'Alto';
  if (level >= 6) return 'Médio';
  if (level >= 3) return 'Baixo';
  return 'Muito Baixo';
}

export const RISK_CATEGORIES = [
  'Operacional',
  'Cibernético',
  'Conformidade',
  'Estratégico',
  'Financeiro',
  'Reputacional',
  'Tecnológico',
  'Legal',
];

export const TREATMENT_OPTIONS: { value: RiskTreatment; label: string }[] = [
  { value: 'mitigar', label: 'Mitigar' },
  { value: 'aceitar', label: 'Aceitar' },
  { value: 'transferir', label: 'Transferir' },
  { value: 'evitar', label: 'Evitar' },
];
