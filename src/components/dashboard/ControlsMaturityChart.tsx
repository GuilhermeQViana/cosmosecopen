import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const data = [
  { level: 'Nível 0', count: 25, fill: 'hsl(var(--maturity-0))' },
  { level: 'Nível 1', count: 35, fill: 'hsl(var(--maturity-1))' },
  { level: 'Nível 2', count: 48, fill: 'hsl(var(--maturity-2))' },
  { level: 'Nível 3', count: 62, fill: 'hsl(var(--maturity-3))' },
  { level: 'Nível 4', count: 28, fill: 'hsl(var(--maturity-4))' },
  { level: 'Nível 5', count: 19, fill: 'hsl(var(--maturity-5))' },
];

export function ControlsMaturityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Controles por Nível de Maturidade</CardTitle>
        <CardDescription>Distribuição dos 217 controles avaliados</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="level"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value} controles`, 'Quantidade']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Bar key={index} dataKey="count" fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
