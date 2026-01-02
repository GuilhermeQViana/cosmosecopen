import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import { Database } from '@/integrations/supabase/types';

type TaskPriority = Database['public']['Enums']['task_priority'];

interface ControlForGeneration {
  controlId: string;
  assessmentId: string;
  controlCode: string;
  controlName: string;
  controlDescription: string | null;
  currentMaturity: number;
  targetMaturity: number;
}

interface GeneratedPlan {
  controlId: string;
  assessmentId: string;
  plan: {
    title: string;
    description: string;
    priority: 'critica' | 'alta' | 'media' | 'baixa';
    subtasks: string[];
  };
}

interface FailedControl {
  controlId: string;
  controlCode: string;
  error: string;
}

interface GenerationResult {
  success: GeneratedPlan[];
  failed: FailedControl[];
}

export function useGenerateActionPlans() {
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const generateMutation = useMutation({
    mutationFn: async (controls: ControlForGeneration[]): Promise<GenerationResult> => {
      if (!organization?.id || !currentFramework?.id) {
        throw new Error('Organização ou framework não selecionado');
      }

      setProgress({ current: 0, total: controls.length });

      // Call edge function
      const { data, error } = await supabase.functions.invoke('generate-bulk-action-plans', {
        body: {
          controls,
          framework: currentFramework?.name || 'Framework',
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao gerar planos de ação');
      }

      const result = data as GenerationResult;

      // Save successful plans to database
      if (result.success.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();

        for (const item of result.success) {
          // Create action plan
          const { data: actionPlan, error: planError } = await supabase
            .from('action_plans')
            .insert({
              organization_id: organization.id,
              framework_id: currentFramework.id,
              assessment_id: item.assessmentId,
              title: item.plan.title,
              description: item.plan.description,
              priority: item.plan.priority as TaskPriority,
              status: 'backlog',
              ai_generated: true,
              created_by: user?.id || null,
            })
            .select()
            .single();

          if (planError) {
            console.error('Error creating action plan:', planError);
            continue;
          }

          // Create subtasks
          if (actionPlan && item.plan.subtasks.length > 0) {
            const tasks = item.plan.subtasks.map((title, index) => ({
              action_plan_id: actionPlan.id,
              title,
              order_index: index,
              completed: false,
            }));

            const { error: tasksError } = await supabase
              .from('action_plan_tasks')
              .insert(tasks);

            if (tasksError) {
              console.error('Error creating tasks:', tasksError);
            }
          }

          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
      queryClient.invalidateQueries({ queryKey: ['action-plan-tasks'] });
    },
  });

  return {
    generate: generateMutation.mutate,
    generateAsync: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    progress,
    error: generateMutation.error,
    reset: generateMutation.reset,
  };
}

export function useNonConformingControls() {
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();

  const findNonConformingWithoutPlans = async (): Promise<ControlForGeneration[]> => {
    if (!organization?.id || !currentFramework?.id) {
      console.log('[AI Plans] No organization or framework selected');
      return [];
    }

    console.log('[AI Plans] Fetching fresh data from database...');

    // 1. Fetch controls for current framework
    const { data: controls, error: controlsError } = await supabase
      .from('controls')
      .select('id, code, name, description')
      .eq('framework_id', currentFramework.id);

    if (controlsError) {
      console.error('[AI Plans] Error fetching controls:', controlsError);
      return [];
    }

    if (!controls || controls.length === 0) {
      console.log('[AI Plans] No controls found for framework');
      return [];
    }

    // 2. Fetch non-conforming assessments (FRESH DATA from database)
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('id, control_id, maturity_level, target_maturity, status')
      .eq('organization_id', organization.id)
      .in('status', ['nao_conforme', 'parcial']);

    if (assessmentsError) {
      console.error('[AI Plans] Error fetching assessments:', assessmentsError);
      return [];
    }

    console.log('[AI Plans] Non-conforming assessments found:', assessments?.length || 0);

    if (!assessments || assessments.length === 0) {
      console.log('[AI Plans] No non-conforming assessments found');
      return [];
    }

    // 3. Get existing action plans for these assessments
    const assessmentIds = assessments.map(a => a.id);
    const { data: existingPlans, error: plansError } = await supabase
      .from('action_plans')
      .select('assessment_id')
      .in('assessment_id', assessmentIds);

    if (plansError) {
      console.error('[AI Plans] Error fetching existing plans:', plansError);
    }

    const existingAssessmentIds = new Set(existingPlans?.map(p => p.assessment_id) || []);
    console.log('[AI Plans] Existing plans found:', existingPlans?.length || 0);

    // 4. Filter out assessments that already have plans
    const controlsForGeneration: ControlForGeneration[] = [];

    for (const assessment of assessments) {
      if (existingAssessmentIds.has(assessment.id)) {
        continue;
      }

      const control = controls.find(c => c.id === assessment.control_id);
      if (!control) {
        continue;
      }

      controlsForGeneration.push({
        controlId: control.id,
        assessmentId: assessment.id,
        controlCode: control.code,
        controlName: control.name,
        controlDescription: control.description,
        currentMaturity: parseInt(assessment.maturity_level) || 0,
        targetMaturity: parseInt(assessment.target_maturity) || 3,
      });
    }

    console.log('[AI Plans] Controls for AI generation:', controlsForGeneration.length);

    return controlsForGeneration;
  };

  return { findNonConformingWithoutPlans };
}
