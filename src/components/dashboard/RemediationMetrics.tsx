import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartSkeleton } from './ChartSkeleton';
import { Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import type { ActionPlan } from '@/hooks/useActionPlans';

interface RemediationMetricsProps {
  actionPlans: ActionPlan[];
  isLoading?: boolean;
}

export function RemediationMetrics({ actionPlans, isLoading }: RemediationMetricsProps) {
  if (isLoading) {
    return <ChartSkeleton type="custom" height={200} />;
  }

  const metrics = useMemo(() => {
    const now = new Date();
    
    // Calculate MTTR (Mean Time to Remediate)
    const completedPlans = actionPlans.filter(p => p.status === 'done' && p.completed_at);
    let totalDays = 0;
    completedPlans.forEach(p => {
      if (p.completed_at) {
        const created = parseISO(p.created_at);
        const completed = parseISO(p.completed_at);
        totalDays += differenceInDays(completed, created);
      }
    });
    const mttr = completedPlans.length > 0 ? Math.round(totalDays / completedPlans.length) : 0;

    // Calculate overdue backlog
    const overduePlans = actionPlans.filter(p => {
      if (p.status === 'done' || !p.due_date) return false;
      return new Date(p.due_date) < now;
    });
    let totalOverdueDays = 0;
    overduePlans.forEach(p => {
      if (p.due_date) {
        totalOverdueDays += differenceInDays(now, parseISO(p.due_date));
      }
    });

    // Resolution velocity (completed last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentlyCompleted = completedPlans.filter(p => {
      if (!p.completed_at) return false;
      return parseISO(p.completed_at) >= thirtyDaysAgo;
    }).length;

    // In progress count
    const inProgress = actionPlans.filter(p => p.status === 'in_progress').length;
    const pending = actionPlans.filter(p => ['backlog', 'todo'].includes(p.status)).length;

    return {
      mttr,
      overdueCount: overduePlans.length,
      totalOverdueDays,
      velocityPerMonth: recentlyCompleted,
      inProgress,
      pending,
      completed: completedPlans.length,
      total: actionPlans.length,
    };
  }, [actionPlans]);

  const completionRate = metrics.total > 0 
    ? Math.round((metrics.completed / metrics.total) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Métricas de Remediação
        </CardTitle>
        <CardDescription>Tempo e eficiência na resolução de planos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* MTTR */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              MTTR
            </div>
            <div className="text-2xl font-bold font-space">
              {metrics.mttr}
              <span className="text-sm font-normal text-muted-foreground ml-1">dias</span>
            </div>
            <p className="text-xs text-muted-foreground">Tempo médio de resolução</p>
          </div>

          {/* Overdue */}
          <div className={`p-3 rounded-lg space-y-1 ${
            metrics.overdueCount > 0 
              ? 'bg-[hsl(var(--risk-high))]/10' 
              : 'bg-muted/50'
          }`}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className={`h-3 w-3 ${
                metrics.overdueCount > 0 ? 'text-[hsl(var(--risk-high))]' : ''
              }`} />
              Atrasados
            </div>
            <div className={`text-2xl font-bold font-space ${
              metrics.overdueCount > 0 ? 'text-[hsl(var(--risk-high))]' : ''
            }`}>
              {metrics.overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalOverdueDays} dias acumulados
            </p>
          </div>

          {/* Velocity */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-[hsl(var(--success))]" />
              Velocidade
            </div>
            <div className="text-2xl font-bold font-space">
              {metrics.velocityPerMonth}
              <span className="text-sm font-normal text-muted-foreground ml-1">/mês</span>
            </div>
            <p className="text-xs text-muted-foreground">Planos concluídos</p>
          </div>

          {/* Completion Rate */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-[hsl(var(--success))]" />
              Taxa de Conclusão
            </div>
            <div className="text-2xl font-bold font-space text-[hsl(var(--success))]">
              {completionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.completed} de {metrics.total}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso Geral</span>
            <span>{metrics.pending} pendentes • {metrics.inProgress} em andamento • {metrics.completed} concluídos</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-[hsl(var(--success))] transition-all duration-500"
              style={{ width: `${(metrics.completed / Math.max(metrics.total, 1)) * 100}%` }}
            />
            <div 
              className="h-full bg-[hsl(var(--chart-3))] transition-all duration-500"
              style={{ width: `${(metrics.inProgress / Math.max(metrics.total, 1)) * 100}%` }}
            />
            <div 
              className="h-full bg-muted-foreground/30 transition-all duration-500"
              style={{ width: `${(metrics.pending / Math.max(metrics.total, 1)) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
