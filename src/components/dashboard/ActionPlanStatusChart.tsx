import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import type { ActionPlan } from '@/hooks/useActionPlans';

interface ActionPlanStatusChartProps {
  actionPlans: ActionPlan[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'hsl(var(--muted-foreground))' },
  todo: { label: 'A Fazer', color: 'hsl(var(--chart-6))' },
  in_progress: { label: 'Em Progresso', color: 'hsl(var(--chart-3))' },
  review: { label: 'Em Revisão', color: 'hsl(var(--chart-5))' },
  done: { label: 'Concluído', color: 'hsl(var(--chart-2))' },
};

export function ActionPlanStatusChart({ actionPlans }: ActionPlanStatusChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {
      backlog: 0,
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };

    actionPlans.forEach(plan => {
      if (counts[plan.status] !== undefined) {
        counts[plan.status]++;
      }
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_CONFIG[status]?.label || status,
      value: count,
      color: STATUS_CONFIG[status]?.color || 'hsl(var(--muted-foreground))',
    }));
  }, [actionPlans]);

  if (actionPlans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status dos Planos de Ação</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-sm text-muted-foreground text-center">
            Nenhum plano de ação criado ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status dos Planos de Ação</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
