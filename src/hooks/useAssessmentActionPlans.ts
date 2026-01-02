import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface ActionPlanCount {
  total: number;
  pending: number;
  completed: number;
}

export function useAssessmentActionPlans(assessmentId: string | undefined) {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['assessment-action-plans', assessmentId],
    queryFn: async () => {
      if (!assessmentId || !organization?.id) return [];

      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!assessmentId && !!organization?.id,
  });
}

export function useActionPlanCounts(assessmentId: string | undefined): ActionPlanCount {
  const { data: actionPlans = [] } = useAssessmentActionPlans(assessmentId);

  return {
    total: actionPlans.length,
    pending: actionPlans.filter((ap) => ap.status !== 'done').length,
    completed: actionPlans.filter((ap) => ap.status === 'done').length,
  };
}
