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

export function useResetAssessments() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();

  return useMutation({
    mutationFn: async () => {
      if (!organization?.id || !currentFramework?.id) {
        throw new Error('Missing context');
      }

      // Get all control IDs for this framework
      const { data: controls } = await supabase
        .from('controls')
        .select('id')
        .eq('framework_id', currentFramework.id);

      if (!controls?.length) return;

      const controlIds = controls.map((c) => c.id);

      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('organization_id', organization.id)
        .in('control_id', controlIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
  });
}

export function useBulkUpsertAssessments() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      assessmentsData: Array<{
        control_id: string;
        maturity_level: MaturityLevel;
        target_maturity?: MaturityLevel;
        status?: ConformityStatus;
        observations?: string | null;
      }>
    ) => {
      if (!organization?.id || !user?.id) {
        throw new Error('Missing context');
      }

      const now = new Date().toISOString();
      
      const records = assessmentsData.map((a) => ({
        organization_id: organization.id,
        control_id: a.control_id,
        maturity_level: a.maturity_level,
        target_maturity: a.target_maturity || '3' as MaturityLevel,
        status: a.status || calculateStatus(a.maturity_level, a.target_maturity || '3'),
        observations: a.observations || null,
        assessed_by: user.id,
        assessed_at: now,
      }));

      const { error } = await supabase
        .from('assessments')
        .upsert(records, { 
          onConflict: 'organization_id,control_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
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
