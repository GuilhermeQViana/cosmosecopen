import { ActionPlan } from '@/hooks/useActionPlans';
import { Card, CardContent } from '@/components/ui/card';
import { ListTodo, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ActionPlanStatsProps {
  plans: ActionPlan[];
}

export function ActionPlanStats({ plans }: ActionPlanStatsProps) {
  const total = plans.length;
  const inProgress = plans.filter((p) => p.status === 'in_progress').length;
  const overdue = plans.filter((p) => {
    if (!p.due_date || p.status === 'done') return false;
    return new Date(p.due_date) < new Date();
  }).length;
  const completed = plans.filter((p) => p.status === 'done').length;

  const stats = [
    {
      label: 'Total de Ações',
      value: total,
      icon: ListTodo,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Em Progresso',
      value: inProgress,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Atrasadas',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Concluídas',
      value: completed,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
