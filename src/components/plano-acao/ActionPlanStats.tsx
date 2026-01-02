import { ActionPlan } from '@/hooks/useActionPlans';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListTodo, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionPlanStatsProps {
  plans: ActionPlan[];
  isLoading?: boolean;
  onFilterClick?: (filter: 'all' | 'in_progress' | 'overdue' | 'done') => void;
  activeFilter?: string;
}

export function ActionPlanStats({ plans, isLoading, onFilterClick, activeFilter }: ActionPlanStatsProps) {
  const total = plans.length;
  const inProgress = plans.filter((p) => p.status === 'in_progress').length;
  const overdue = plans.filter((p) => {
    if (!p.due_date || p.status === 'done') return false;
    return new Date(p.due_date) < new Date();
  }).length;
  const completed = plans.filter((p) => p.status === 'done').length;

  const stats = [
    {
      key: 'all' as const,
      label: 'Total de Ações',
      value: total,
      icon: ListTodo,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      hoverColor: 'hover:border-primary/50 hover:bg-primary/5',
    },
    {
      key: 'in_progress' as const,
      label: 'Em Progresso',
      value: inProgress,
      icon: Clock,
      color: 'text-[hsl(var(--warning))]',
      bgColor: 'bg-[hsl(var(--warning))]/10',
      hoverColor: 'hover:border-[hsl(var(--warning))]/50 hover:bg-[hsl(var(--warning))]/5',
    },
    {
      key: 'overdue' as const,
      label: 'Atrasadas',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      hoverColor: 'hover:border-destructive/50 hover:bg-destructive/5',
    },
    {
      key: 'done' as const,
      label: 'Concluídas',
      value: completed,
      icon: CheckCircle2,
      color: 'text-[hsl(var(--success))]',
      bgColor: 'bg-[hsl(var(--success))]/10',
      hoverColor: 'hover:border-[hsl(var(--success))]/50 hover:bg-[hsl(var(--success))]/5',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const isActive = activeFilter === stat.key;
        
        return (
          <Card 
            key={stat.label}
            className={cn(
              'border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-200',
              onFilterClick && 'cursor-pointer',
              stat.hoverColor,
              isActive && 'ring-2 ring-primary border-primary/50'
            )}
            onClick={() => onFilterClick?.(stat.key)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-space">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
