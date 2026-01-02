import { useMemo } from 'react';
import { useControls } from './useControls';
import { useAssessments } from './useAssessments';
import { useRisks } from './useRisks';
import { useActionPlans } from './useActionPlans';

export interface MenuBadges {
  diagnostico: number;
  riscos: number;
  planoAcao: number;
}

/**
 * Hook that calculates badge counts for sidebar menu items
 */
export function useMenuBadges(): { badges: MenuBadges; isLoading: boolean } {
  const { data: controls = [], isLoading: controlsLoading } = useControls();
  const { data: assessments = [], isLoading: assessmentsLoading } = useAssessments();
  const { data: risks = [], isLoading: risksLoading } = useRisks();
  const { data: actionPlans = [], isLoading: plansLoading } = useActionPlans();

  const badges = useMemo(() => {
    // Controls pending assessment
    const assessedControlIds = new Set(assessments.map(a => a.control_id));
    const pendingControls = controls.filter(c => !assessedControlIds.has(c.id)).length;

    // Critical risks (probability * impact >= 20)
    const criticalRisks = risks.filter(r => 
      (r.inherent_probability * r.inherent_impact) >= 20
    ).length;

    // Overdue action plans
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overduePlans = actionPlans.filter(p => {
      if (p.status === 'done') return false;
      if (!p.due_date) return false;
      const dueDate = new Date(p.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;

    return {
      diagnostico: pendingControls,
      riscos: criticalRisks,
      planoAcao: overduePlans,
    };
  }, [controls, assessments, risks, actionPlans]);

  return {
    badges,
    isLoading: controlsLoading || assessmentsLoading || risksLoading || plansLoading,
  };
}
