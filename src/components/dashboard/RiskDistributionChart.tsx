import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Crítico', value: 3, color: 'hsl(var(--risk-critical))' },
  { name: 'Alto', value: 8, color: 'hsl(var(--risk-high))' },
  { name: 'Médio', value: 15, color: 'hsl(var(--risk-medium))' },
  { name: 'Baixo', value: 12, color: 'hsl(var(--risk-low))' },
];

export function RiskDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribuição de Riscos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
