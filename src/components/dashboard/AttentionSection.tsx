import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  Clock,
  Shield,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import { Risk } from '@/hooks/useRisks';
import { ActionPlan } from '@/hooks/useActionPlans';

interface AttentionSectionProps {
  controls: Control[];
  assessments: Assessment[];
  risks: Risk[];
  actionPlans: ActionPlan[];
  isLoading?: boolean;
}

export function AttentionSection({
  controls,
  assessments,
  risks,
  actionPlans,
  isLoading = false,
}: AttentionSectionProps) {
  // Calculate attention items
  const assessedControlIds = new Set(assessments.map(a => a.control_id));
  const pendingControls = controls.filter(c => !assessedControlIds.has(c.id)).slice(0, 3);
  
  const criticalRisks = risks
    .filter(r => (r.inherent_probability * r.inherent_impact) >= 20)
    .slice(0, 3);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overduePlans = actionPlans
    .filter(p => {
      if (p.status === 'done') return false;
      if (!p.due_date) return false;
      const dueDate = new Date(p.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    })
    .slice(0, 3);

  const hasAttentionItems = pendingControls.length > 0 || criticalRisks.length > 0 || overduePlans.length > 0;

  if (isLoading) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAttentionItems) {
    return (
      <Card className="border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-[hsl(var(--success))]/10">
              <Shield className="h-5 w-5 text-[hsl(var(--success))]" />
            </div>
            <div>
              <CardTitle className="text-lg">Tudo em Ordem</CardTitle>
              <CardDescription>
                Não há itens críticos que precisam de atenção imediata
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-lg">Atenção Necessária</CardTitle>
            <CardDescription>
              Itens críticos que precisam de ação imediata
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Critical Risks */}
          {criticalRisks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Riscos Críticos ({criticalRisks.length})
              </div>
              <div className="space-y-2">
                {criticalRisks.map((risk) => (
                  <div
                    key={risk.id}
                    className="p-2 bg-background/80 rounded-lg border border-destructive/20 text-sm"
                  >
                    <code className="text-xs font-mono text-destructive">{risk.code}</code>
                    <p className="truncate text-foreground">{risk.title}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/riscos">
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          )}

          {/* Overdue Action Plans */}
          {overduePlans.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--warning))]">
                <Clock className="h-4 w-4" />
                Planos Atrasados ({overduePlans.length})
              </div>
              <div className="space-y-2">
                {overduePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-2 bg-background/80 rounded-lg border border-[hsl(var(--warning))]/20 text-sm"
                  >
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px] px-1 py-0 border-[hsl(var(--warning))] text-[hsl(var(--warning))]">
                        {plan.due_date ? new Date(plan.due_date).toLocaleDateString('pt-BR') : '-'}
                      </Badge>
                    </div>
                    <p className="truncate text-foreground mt-1">{plan.title}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/plano-acao">
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          )}

          {/* Pending Controls */}
          {pendingControls.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Shield className="h-4 w-4" />
                Controles Pendentes ({pendingControls.length})
              </div>
              <div className="space-y-2">
                {pendingControls.map((control) => (
                  <div
                    key={control.id}
                    className="p-2 bg-background/80 rounded-lg border text-sm"
                  >
                    <code className="text-xs font-mono text-primary">{control.code}</code>
                    <p className="truncate text-foreground">{control.name}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/diagnostico">
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
