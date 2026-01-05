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
import { ChartSkeleton } from './ChartSkeleton';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ActionPlan } from '@/hooks/useActionPlans';

interface ActionPlanStatusChartProps {
  actionPlans: ActionPlan[];
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'hsl(var(--muted-foreground))' },
  todo: { label: 'A Fazer', color: 'hsl(var(--chart-6))' },
  in_progress: { label: 'Em Progresso', color: 'hsl(var(--chart-3))' },
  review: { label: 'Em Revisão', color: 'hsl(var(--chart-5))' },
  done: { label: 'Concluído', color: 'hsl(var(--chart-2))' },
};

export function ActionPlanStatusChart({ actionPlans, isLoading }: ActionPlanStatusChartProps) {
  const navigate = useNavigate();

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
      status,
    }));
  }, [actionPlans]);

  const handleClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload?.status) {
      const status = data.activePayload[0].payload.status;
      navigate(`/plano-acao?status=${status}`);
    }
  };

  if (isLoading) {
    return <ChartSkeleton type="bar" height={250} />;
  }

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload;
    const percentage = actionPlans.length > 0 ? Math.round((item.value / actionPlans.length) * 100) : 0;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
          <span className="font-medium">{item.name}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {item.value} planos ({percentage}%)
        </div>
        <p className="text-xs text-primary mt-2">Clique para filtrar</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status dos Planos de Ação</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical" onClick={handleClick} style={{ cursor: 'pointer' }}>
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
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="transition-all duration-200 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
