import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import { calculateRiskScore, getRiskScoreClassification } from '@/lib/risk-methodology';

interface CreateRiskFromControlParams {
  control: Control;
  assessment: Assessment;
}

interface BulkCreateRisksParams {
  items: CreateRiskFromControlParams[];
}

function generateRiskCode(index: number): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `RSK-${year}${month}-${String(index).padStart(3, '0')}`;
}

function mapRiskScoreToLevel(riskScore: number): { probability: number; impact: number } {
  // Map risk score (0-15) to probability and impact (1-5 each)
  // Higher risk score = higher probability and impact
  if (riskScore >= 10) {
    return { probability: 5, impact: 5 }; // Critical: 25
  } else if (riskScore >= 6) {
    return { probability: 4, impact: 4 }; // High: 16
  } else if (riskScore >= 3) {
    return { probability: 3, impact: 3 }; // Medium: 9
  } else if (riskScore >= 1) {
    return { probability: 2, impact: 2 }; // Low: 4
  }
  return { probability: 1, impact: 1 }; // Very Low: 1
}

function getCategoryFromControl(control: Control): string {
  // Try to infer category from control metadata
  const category = control.category?.toLowerCase() || '';
  const name = control.name?.toLowerCase() || '';
  const code = control.code?.toLowerCase() || '';
  
  if (category.includes('govern') || name.includes('govern') || code.includes('gv')) {
    return 'Conformidade';
  }
  if (category.includes('protect') || name.includes('protect') || code.includes('pr')) {
    return 'Cibernético';
  }
  if (category.includes('detect') || name.includes('detect') || code.includes('de')) {
    return 'Cibernético';
  }
  if (category.includes('respond') || name.includes('respond') || code.includes('rs')) {
    return 'Operacional';
  }
  if (category.includes('recover') || name.includes('recover') || code.includes('rc')) {
    return 'Operacional';
  }
  if (category.includes('identify') || name.includes('identify') || code.includes('id')) {
    return 'Estratégico';
  }
  if (category.includes('access') || name.includes('access') || name.includes('acesso')) {
    return 'Cibernético';
  }
  if (category.includes('data') || name.includes('data') || name.includes('dados')) {
    return 'Tecnológico';
  }
  
  return 'Operacional'; // Default category
}

export function useCreateRiskFromControl() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();

  return useMutation({
    mutationFn: async ({ control, assessment }: CreateRiskFromControlParams) => {
      if (!organization?.id) throw new Error('No organization');

      const currentMaturity = parseInt(assessment.maturity_level);
      const targetMaturity = parseInt(assessment.target_maturity);
      const weight = control.weight || 1;
      const riskScore = calculateRiskScore(currentMaturity, targetMaturity, weight);
      const classification = getRiskScoreClassification(riskScore);
      const { probability, impact } = mapRiskScoreToLevel(riskScore);
      const category = getCategoryFromControl(control);

      // Get the count of existing risks to generate a unique code
      const { count } = await supabase
        .from('risks')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id);

      const riskCode = generateRiskCode((count || 0) + 1);

      // Create the risk
      const { data: risk, error: riskError } = await supabase
        .from('risks')
        .insert({
          code: riskCode,
          title: `Risco: ${control.name}`,
          description: `Risco identificado automaticamente a partir do controle ${control.code} com Risk Score ${classification.label} (${riskScore}). Gap de maturidade: ${targetMaturity - currentMaturity} níveis.`,
          category,
          inherent_probability: probability,
          inherent_impact: impact,
          treatment: 'mitigar',
          treatment_plan: `Implementar ações para elevar a maturidade do controle ${control.code} de ${currentMaturity} para ${targetMaturity}.`,
          organization_id: organization.id,
          framework_id: currentFramework?.id || null,
        })
        .select()
        .single();

      if (riskError) throw riskError;

      // Link the control to the risk
      const { error: linkError } = await supabase
        .from('risk_controls')
        .insert({
          risk_id: risk.id,
          control_id: control.id,
        });

      if (linkError) throw linkError;

      return risk;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['control-risks'] });
    },
  });
}

export function useBulkCreateRisksFromControls() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();

  return useMutation({
    mutationFn: async ({ items }: BulkCreateRisksParams) => {
      if (!organization?.id) throw new Error('No organization');
      if (items.length === 0) return [];

      // Get existing risk count
      const { count: existingCount } = await supabase
        .from('risks')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id);

      // Get control IDs that already have linked risks
      const controlIds = items.map(item => item.control.id);
      const { data: existingLinks } = await supabase
        .from('risk_controls')
        .select('control_id')
        .in('control_id', controlIds);

      const linkedControlIds = new Set(existingLinks?.map(l => l.control_id) || []);

      // Filter out controls that already have risks
      const newItems = items.filter(item => !linkedControlIds.has(item.control.id));

      if (newItems.length === 0) {
        return { created: 0, skipped: items.length };
      }

      const createdRisks = [];
      let index = (existingCount || 0) + 1;

      for (const { control, assessment } of newItems) {
        const currentMaturity = parseInt(assessment.maturity_level);
        const targetMaturity = parseInt(assessment.target_maturity);
        const weight = control.weight || 1;
        const riskScore = calculateRiskScore(currentMaturity, targetMaturity, weight);
        const classification = getRiskScoreClassification(riskScore);
        const { probability, impact } = mapRiskScoreToLevel(riskScore);
        const category = getCategoryFromControl(control);

        const riskCode = generateRiskCode(index++);

        // Create the risk
        const { data: risk, error: riskError } = await supabase
          .from('risks')
          .insert({
            code: riskCode,
            title: `Risco: ${control.name}`,
            description: `Risco identificado automaticamente a partir do controle ${control.code} com Risk Score ${classification.label} (${riskScore}). Gap de maturidade: ${targetMaturity - currentMaturity} níveis.`,
            category,
            inherent_probability: probability,
            inherent_impact: impact,
            treatment: 'mitigar',
            treatment_plan: `Implementar ações para elevar a maturidade do controle ${control.code} de ${currentMaturity} para ${targetMaturity}.`,
            organization_id: organization.id,
            framework_id: currentFramework?.id || null,
          })
          .select()
          .single();

        if (riskError) {
          console.error('Error creating risk:', riskError);
          continue;
        }

        // Link the control to the risk
        const { error: linkError } = await supabase
          .from('risk_controls')
          .insert({
            risk_id: risk.id,
            control_id: control.id,
          });

        if (linkError) {
          console.error('Error linking control:', linkError);
        }

        createdRisks.push(risk);
      }

      return { 
        created: createdRisks.length, 
        skipped: items.length - newItems.length,
        risks: createdRisks 
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['control-risks'] });
    },
  });
}
