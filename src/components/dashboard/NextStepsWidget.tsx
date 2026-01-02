import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  AlertTriangle,
  ListTodo,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import { Risk } from '@/hooks/useRisks';
import { ActionPlan } from '@/hooks/useActionPlans';
import { Evidence } from '@/hooks/useEvidences';

interface NextStepsWidgetProps {
  controls: Control[];
  assessments: Assessment[];
  risks: Risk[];
  actionPlans: ActionPlan[];
  evidences: Evidence[];
  isLoading?: boolean;
}

interface NextStep {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  path: string;
  priority: number;
}

export function NextStepsWidget({
  controls,
  assessments,
  risks,
  actionPlans,
  evidences,
  isLoading = false,
}: NextStepsWidgetProps) {
  // Calculate next steps based on current data
  const nextSteps: NextStep[] = [];

  const assessedControlIds = new Set(assessments.map(a => a.control_id));
  const pendingControls = controls.filter(c => !assessedControlIds.has(c.id)).length;

  // Priority 1: Pending controls to assess
  if (pendingControls > 0) {
    nextSteps.push({
      id: 'assess-controls',
      icon: Shield,
      iconColor: 'text-primary',
      title: `Avaliar ${pendingControls} controles pendentes`,
      description: 'Complete a avaliação de maturidade dos controles restantes',
      path: '/diagnostico',
      priority: 1,
    });
  }

  // Priority 2: Non-conforming controls without action plans
  const nonConformingAssessments = assessments.filter(a => 
    a.status === 'nao_conforme' || a.status === 'parcial'
  );
  const assessmentsWithPlans = new Set(
    actionPlans.filter(p => p.assessment_id).map(p => p.assessment_id)
  );
  const gapsWithoutPlans = nonConformingAssessments.filter(
    a => !assessmentsWithPlans.has(a.id)
  ).length;

  if (gapsWithoutPlans > 0) {
    nextSteps.push({
      id: 'create-action-plans',
      icon: ListTodo,
      iconColor: 'text-[hsl(var(--warning))]',
      title: `Criar planos para ${gapsWithoutPlans} gaps`,
      description: 'Defina ações corretivas para controles não conformes',
      path: '/plano-acao',
      priority: 2,
    });
  }

  // Priority 3: Critical risks without treatment plan
  const criticalRisksNoTreatment = risks.filter(r => 
    (r.inherent_probability * r.inherent_impact) >= 20 && !r.treatment_plan
  ).length;

  if (criticalRisksNoTreatment > 0) {
    nextSteps.push({
      id: 'treat-risks',
      icon: AlertTriangle,
      iconColor: 'text-destructive',
      title: `Tratar ${criticalRisksNoTreatment} riscos críticos`,
      description: 'Defina planos de tratamento para riscos de alto impacto',
      path: '/riscos',
      priority: 3,
    });
  }

  // Priority 4: In-progress action plans
  const inProgressPlans = actionPlans.filter(p => p.status === 'in_progress').length;
  if (inProgressPlans > 0) {
    nextSteps.push({
      id: 'progress-plans',
      icon: CheckCircle2,
      iconColor: 'text-[hsl(var(--info))]',
      title: `Atualizar ${inProgressPlans} planos em andamento`,
      description: 'Registre o progresso das ações em execução',
      path: '/plano-acao',
      priority: 4,
    });
  }

  // Priority 5: Controls without evidence
  if (evidences.length === 0 && assessments.length > 0) {
    nextSteps.push({
      id: 'add-evidence',
      icon: FileCheck,
      iconColor: 'text-[hsl(var(--success))]',
      title: 'Adicionar evidências',
      description: 'Documente as evidências de conformidade dos controles',
      path: '/evidencias',
      priority: 5,
    });
  }

  // Limit to 4 steps
  const displaySteps = nextSteps.sort((a, b) => a.priority - b.priority).slice(0, 4);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displaySteps.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[hsl(var(--success))]" />
            <CardTitle className="text-base">Próximos Passos</CardTitle>
          </div>
          <CardDescription>
            Excelente! Você está em dia com suas tarefas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mr-2 text-[hsl(var(--success))]" />
            <span>Nenhuma ação pendente</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Próximos Passos</CardTitle>
        </div>
        <CardDescription>
          Ações recomendadas para melhorar sua conformidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {displaySteps.map((step) => (
          <Link
            key={step.id}
            to={step.path}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className={`p-2 rounded-full bg-muted ${step.iconColor}`}>
              <step.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {step.description}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
