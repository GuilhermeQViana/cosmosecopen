import { useMemo } from 'react';
import { SortOption } from '@/components/diagnostico/SortDropdown';
import { calculateRiskScore } from '@/lib/risk-methodology';
import { Control } from '@/hooks/useControls';
import { Database } from '@/integrations/supabase/types';

type Assessment = Database['public']['Tables']['assessments']['Row'];

export function useSortedControls(
  controls: Control[],
  assessments: Assessment[],
  sortOption: SortOption
): Control[] {
  const assessmentMap = useMemo(
    () => new Map(assessments.map((a) => [a.control_id, a])),
    [assessments]
  );

  return useMemo(() => {
    const sorted = [...controls];

    sorted.sort((a, b) => {
      const assessmentA = assessmentMap.get(a.id);
      const assessmentB = assessmentMap.get(b.id);

      switch (sortOption) {
        case 'risk_score_desc':
        case 'risk_score_asc': {
          const scoreA = assessmentA
            ? calculateRiskScore(
                parseInt(assessmentA.maturity_level),
                parseInt(assessmentA.target_maturity),
                a.weight || 1
              )
            : 0;
          const scoreB = assessmentB
            ? calculateRiskScore(
                parseInt(assessmentB.maturity_level),
                parseInt(assessmentB.target_maturity),
                b.weight || 1
              )
            : 0;
          return sortOption === 'risk_score_desc' ? scoreB - scoreA : scoreA - scoreB;
        }

        case 'maturity_gap_desc':
        case 'maturity_gap_asc': {
          const gapA = assessmentA
            ? parseInt(assessmentA.target_maturity) - parseInt(assessmentA.maturity_level)
            : 0;
          const gapB = assessmentB
            ? parseInt(assessmentB.target_maturity) - parseInt(assessmentB.maturity_level)
            : 0;
          return sortOption === 'maturity_gap_desc' ? gapB - gapA : gapA - gapB;
        }

        case 'weight_desc':
        case 'weight_asc': {
          const weightA = a.weight || 1;
          const weightB = b.weight || 1;
          return sortOption === 'weight_desc' ? weightB - weightA : weightA - weightB;
        }

        case 'last_assessment': {
          // Unassessed controls come first (need assessment)
          if (!assessmentA && assessmentB) return -1;
          if (assessmentA && !assessmentB) return 1;
          if (!assessmentA && !assessmentB) return 0;
          
          // Sort by assessment date, oldest first
          const dateA = new Date(assessmentA!.assessed_at || assessmentA!.updated_at).getTime();
          const dateB = new Date(assessmentB!.assessed_at || assessmentB!.updated_at).getTime();
          return dateA - dateB;
        }

        case 'code_asc':
        case 'code_desc': {
          const codeA = a.code.toLowerCase();
          const codeB = b.code.toLowerCase();
          const result = codeA.localeCompare(codeB, undefined, { numeric: true });
          return sortOption === 'code_desc' ? -result : result;
        }

        case 'name_asc': {
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        }

        default:
          return 0;
      }
    });

    return sorted;
  }, [controls, assessmentMap, sortOption]);
}
