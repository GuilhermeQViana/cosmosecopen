import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useActionPlans } from '@/hooks/useActionPlans';

// Fetch evidence counts for all assessments
export function useEvidenceCountsByAssessment() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['evidence-counts-by-assessment', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_evidences')
        .select('assessment_id');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((item) => {
        counts[item.assessment_id] = (counts[item.assessment_id] || 0) + 1;
      });

      return counts;
    },
    enabled: !!organization?.id,
    staleTime: 30000,
  });
}

// Fetch action plan counts for all assessments
export function useActionPlanCountsByAssessment() {
  const { data: actionPlans = [] } = useActionPlans();

  return useMemo(() => {
    const counts: Record<string, number> = {};
    actionPlans.forEach((plan) => {
      if (plan.assessment_id) {
        counts[plan.assessment_id] = (counts[plan.assessment_id] || 0) + 1;
      }
    });
    return counts;
  }, [actionPlans]);
}

// Fetch comment counts for all assessments
export function useCommentCountsByAssessment() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['comment-counts-by-assessment', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_comments')
        .select('assessment_id');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((item) => {
        counts[item.assessment_id] = (counts[item.assessment_id] || 0) + 1;
      });

      return counts;
    },
    enabled: !!organization?.id,
    staleTime: 30000,
  });
}

// Hook to check if a control is "problematic" (non-conforme + no plans + no evidence)
export function useProblematicControls(
  assessments: Array<{ id: string; control_id: string; status: string }>
) {
  const { data: evidenceCounts = {} } = useEvidenceCountsByAssessment();
  const actionPlanCounts = useActionPlanCountsByAssessment();

  return useMemo(() => {
    const problematic = new Set<string>();

    assessments.forEach((assessment) => {
      const isNonConforming = assessment.status === 'nao_conforme' || assessment.status === 'parcial';
      const hasNoEvidence = !evidenceCounts[assessment.id] || evidenceCounts[assessment.id] === 0;
      const hasNoPlans = !actionPlanCounts[assessment.id] || actionPlanCounts[assessment.id] === 0;

      if (isNonConforming && hasNoEvidence && hasNoPlans) {
        problematic.add(assessment.control_id);
      }
    });

    return problematic;
  }, [assessments, evidenceCounts, actionPlanCounts]);
}
