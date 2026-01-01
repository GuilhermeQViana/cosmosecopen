import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type MaturityLevel = Database['public']['Enums']['maturity_level'];
type ConformityStatus = Database['public']['Enums']['conformity_status'];

export interface Assessment {
  id: string;
  organization_id: string;
  control_id: string;
  maturity_level: MaturityLevel;
  target_maturity: MaturityLevel;
  status: ConformityStatus;
  observations: string | null;
  assessed_by: string | null;
  assessed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch assessments for the active framework.
 * Uses the global FrameworkContext automatically.
 */
export function useAssessments(frameworkId?: string | null) {
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();
  
  // Use provided frameworkId or fall back to global context
  const activeFrameworkId = frameworkId ?? currentFramework?.id ?? null;

  return useQuery({
    queryKey: ['assessments', organization?.id, activeFrameworkId],
    queryFn: async () => {
      if (!organization?.id || !activeFrameworkId) return [];

      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          controls!inner(framework_id)
        `)
        .eq('organization_id', organization.id)
        .eq('controls.framework_id', activeFrameworkId);

      if (error) throw error;
      return data as (Assessment & { controls: { framework_id: string } })[];
    },
    enabled: !!organization?.id && !!activeFrameworkId,
  });
}

export function useUpsertAssessment() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      controlId,
      maturityLevel,
      targetMaturity,
      status,
      observations,
    }: {
      controlId: string;
      maturityLevel: MaturityLevel;
      targetMaturity?: MaturityLevel;
      status?: ConformityStatus;
      observations?: string;
    }) => {
      if (!organization?.id || !user?.id) {
        throw new Error('Organization or user not found');
      }

      // Check if assessment exists
      const { data: existing } = await supabase
        .from('assessments')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('control_id', controlId)
        .maybeSingle();

      const assessmentData = {
        organization_id: organization.id,
        control_id: controlId,
        maturity_level: maturityLevel,
        target_maturity: targetMaturity || '3',
        status: status || calculateStatus(maturityLevel, targetMaturity || '3'),
        observations: observations || null,
        assessed_by: user.id,
        assessed_at: new Date().toISOString(),
      };

      if (existing) {
        const { data, error } = await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('assessments')
          .insert(assessmentData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
  });
}

function calculateStatus(
  maturity: MaturityLevel,
  target: MaturityLevel
): ConformityStatus {
  const maturityNum = parseInt(maturity);
  const targetNum = parseInt(target);

  if (maturityNum >= targetNum) return 'conforme';
  if (maturityNum >= targetNum - 1) return 'parcial';
  return 'nao_conforme';
}
