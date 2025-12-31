import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const data = [
  { month: 'Jul', nist: 52, iso: 58, bcb: 45 },
  { month: 'Ago', nist: 55, iso: 60, bcb: 50 },
  { month: 'Set', nist: 60, iso: 65, bcb: 58 },
  { month: 'Out', nist: 63, iso: 68, bcb: 62 },
  { month: 'Nov', nist: 66, iso: 72, bcb: 68 },
  { month: 'Dez', nist: 68, iso: 75, bcb: 71 },
];

export function MaturityTrendChart() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-base">Evolução da Conformidade</CardTitle>
        <CardDescription>Últimos 6 meses por framework</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorNist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorIso" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBcb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="nist"
              name="NIST CSF"
              stroke="hsl(var(--chart-1))"
              fill="url(#colorNist)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="iso"
              name="ISO 27001"
              stroke="hsl(var(--chart-2))"
              fill="url(#colorIso)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="bcb"
              name="BCB/CMN"
              stroke="hsl(var(--chart-3))"
              fill="url(#colorBcb)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
