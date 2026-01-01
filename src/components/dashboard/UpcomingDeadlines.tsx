import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, AlertCircle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { useMemo } from 'react';
import type { ActionPlan } from '@/hooks/useActionPlans';

interface UpcomingDeadlinesProps {
  actionPlans: ActionPlan[];
  isLoading?: boolean;
}

const priorityColors: Record<string, string> = {
  critica: 'badge-risk-critical',
  alta: 'badge-risk-high',
  media: 'badge-risk-medium',
  baixa: 'badge-risk-low',
};

const priorityLabels: Record<string, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export function UpcomingDeadlines({ actionPlans, isLoading }: UpcomingDeadlinesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Próximos Prazos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }
  const deadlines = useMemo(() => {
    const today = new Date();
    
    return actionPlans
      .filter(plan => plan.due_date && plan.status !== 'done')
      .map(plan => {
        const dueDate = parseISO(plan.due_date!);
        const daysLeft = differenceInDays(dueDate, today);
        return {
          id: plan.id,
          title: plan.title,
          dueDate: plan.due_date,
          daysLeft,
          priority: plan.priority,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);
  }, [actionPlans]);

  if (deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Próximos Prazos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <p className="text-sm text-muted-foreground text-center">
            Nenhum prazo próximo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Próximos Prazos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deadlines.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {item.daysLeft <= 5 && item.daysLeft >= 0 && (
                  <AlertCircle className="h-3 w-3 text-[hsl(var(--risk-critical))]" />
                )}
                {item.daysLeft < 0 
                  ? `${Math.abs(item.daysLeft)} dias atrasado`
                  : item.daysLeft === 0 
                  ? 'Vence hoje'
                  : `${item.daysLeft} dias restantes`
                }
              </p>
            </div>
            <Badge className={priorityColors[item.priority]}>
              {priorityLabels[item.priority]}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
