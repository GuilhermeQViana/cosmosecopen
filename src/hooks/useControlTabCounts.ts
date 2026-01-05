import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEvidences } from './useEvidences';

export interface ControlTabCounts {
  evidences: number;
  plans: number;
  risks: number;
  comments: number;
}

export function useControlTabCounts(
  controlId: string | undefined,
  assessmentId: string | undefined,
  controlCode: string | undefined
) {
  const { data: allEvidences = [] } = useEvidences();

  // Count evidences linked to this control (by tag or description)
  const evidenceCount = controlCode
    ? allEvidences.filter(
        (e) => e.tags?.includes(controlCode) || e.description?.includes(controlCode)
      ).length
    : 0;

  // Fetch action plans count for this assessment
  const { data: plansCount = 0 } = useQuery({
    queryKey: ['control-plans-count', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return 0;

      const { count, error } = await supabase
        .from('action_plans')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_id', assessmentId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!assessmentId,
  });

  // Fetch risks count linked to this control
  const { data: risksCount = 0 } = useQuery({
    queryKey: ['control-risks-count', controlId],
    queryFn: async () => {
      if (!controlId) return 0;

      const { count, error } = await supabase
        .from('risk_controls')
        .select('*', { count: 'exact', head: true })
        .eq('control_id', controlId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!controlId,
  });

  // Fetch comments count for this assessment
  const { data: commentsCount = 0 } = useQuery({
    queryKey: ['control-comments-count', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return 0;

      const { count, error } = await supabase
        .from('assessment_comments')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_id', assessmentId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!assessmentId,
  });

  return {
    evidences: evidenceCount,
    plans: plansCount,
    risks: risksCount,
    comments: commentsCount,
  } as ControlTabCounts;
}
