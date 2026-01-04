import { useMemo } from 'react';
import { useActionPlans } from '@/hooks/useActionPlans';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import { calculateRiskScore, getRiskScoreClassification } from '@/lib/risk-methodology';
import { AdvancedFilters } from '@/components/diagnostico/AdvancedFiltersPanel';
import { Database } from '@/integrations/supabase/types';
import { Control } from '@/hooks/useControls';

type Assessment = Database['public']['Tables']['assessments']['Row'];

// Hook to get assessment evidences count
export function useAssessmentEvidencesCount() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['assessment-evidences-count', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return {};

      const { data, error } = await supabase
        .from('assessment_evidences')
        .select('assessment_id')
        .order('assessment_id');

      if (error) throw error;

      // Count evidences per assessment
      const counts: Record<string, number> = {};
      data?.forEach((item) => {
        counts[item.assessment_id] = (counts[item.assessment_id] || 0) + 1;
      });

      return counts;
    },
    enabled: !!organization?.id,
  });
}

// Hook to get action plans by assessment
export function useActionPlansByAssessment() {
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

// Main hook for filtering controls with advanced filters
export function useAdvancedControlFilters(
  controls: Control[],
  assessments: Assessment[],
  filters: AdvancedFilters
) {
  const { data: evidenceCounts = {} } = useAssessmentEvidencesCount();
  const actionPlanCounts = useActionPlansByAssessment();

  // Create assessment map for quick lookup
  const assessmentMap = useMemo(() => 
    new Map(assessments.map((a) => [a.control_id, a])),
    [assessments]
  );

  // Calculate filter counts for UI
  const filterMetrics = useMemo(() => {
    let withEvidence = 0;
    let withoutEvidence = 0;
    let withActionPlan = 0;
    let withoutActionPlan = 0;

    controls.forEach((control) => {
      const assessment = assessmentMap.get(control.id);
      if (assessment) {
        // Check evidences
        if (evidenceCounts[assessment.id] && evidenceCounts[assessment.id] > 0) {
          withEvidence++;
        } else {
          withoutEvidence++;
        }

        // Check action plans
        if (actionPlanCounts[assessment.id] && actionPlanCounts[assessment.id] > 0) {
          withActionPlan++;
        } else {
          withoutActionPlan++;
        }
      } else {
        withoutEvidence++;
        withoutActionPlan++;
      }
    });

    return {
      evidenceCounts: { with: withEvidence, without: withoutEvidence },
      actionPlanCounts: { with: withActionPlan, without: withoutActionPlan },
    };
  }, [controls, assessmentMap, evidenceCounts, actionPlanCounts]);

  // Apply filters
  const filteredControls = useMemo(() => {
    const hasActiveFilters =
      filters.riskScore.length > 0 ||
      filters.weight.length > 0 ||
      filters.hasEvidence !== null ||
      filters.hasActionPlan !== null;

    if (!hasActiveFilters) return controls;

    return controls.filter((control) => {
      const assessment = assessmentMap.get(control.id);
      
      // Risk Score filter
      if (filters.riskScore.length > 0) {
        if (!assessment) return false;
        
        const currentMaturity = parseInt(assessment.maturity_level);
        const targetMaturity = parseInt(assessment.target_maturity);
        const weight = control.weight || 1;
        const riskScore = calculateRiskScore(currentMaturity, targetMaturity, weight);
        const classificationResult = getRiskScoreClassification(riskScore);
        
        const levelMap: Record<string, 'baixo' | 'medio' | 'alto' | 'critico'> = {
          'LOW': 'baixo',
          'MEDIUM': 'medio',
          'HIGH': 'alto',
          'CRITICAL': 'critico',
        };
        
        const normalizedLevel = levelMap[classificationResult.level] || 'baixo';
        if (!filters.riskScore.includes(normalizedLevel)) {
          return false;
        }
      }

      // Weight filter
      if (filters.weight.length > 0) {
        const weight = control.weight || 1;
        if (!filters.weight.includes(weight as 1 | 2 | 3)) {
          return false;
        }
      }

      // Evidence filter
      if (filters.hasEvidence !== null) {
        const hasEvidence = assessment 
          ? (evidenceCounts[assessment.id] || 0) > 0 
          : false;
        if (filters.hasEvidence !== hasEvidence) {
          return false;
        }
      }

      // Action Plan filter
      if (filters.hasActionPlan !== null) {
        const hasActionPlan = assessment 
          ? (actionPlanCounts[assessment.id] || 0) > 0 
          : false;
        if (filters.hasActionPlan !== hasActionPlan) {
          return false;
        }
      }

      return true;
    });
  }, [controls, assessmentMap, filters, evidenceCounts, actionPlanCounts]);

  return {
    filteredControls,
    filterMetrics,
    evidenceCounts,
    actionPlanCounts,
  };
}
