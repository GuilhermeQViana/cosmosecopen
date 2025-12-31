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

const data = [
  { name: 'Backlog', value: 12, color: 'hsl(var(--muted-foreground))' },
  { name: 'A Fazer', value: 8, color: 'hsl(var(--chart-6))' },
  { name: 'Em Progresso', value: 5, color: 'hsl(var(--chart-3))' },
  { name: 'Em Revisão', value: 3, color: 'hsl(var(--chart-5))' },
  { name: 'Concluído', value: 22, color: 'hsl(var(--chart-2))' },
];

export function ActionPlanStatusChart() {
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
