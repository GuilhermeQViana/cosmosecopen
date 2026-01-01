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
import { useMemo } from 'react';
import type { Assessment } from '@/hooks/useAssessments';

interface MaturityTrendChartProps {
  assessments: Assessment[];
  frameworkName?: string;
}

// Convert maturity level to percentage
function maturityToPercent(level: string): number {
  const numLevel = parseInt(level, 10);
  return (numLevel / 5) * 100;
}

export function MaturityTrendChart({ assessments, frameworkName }: MaturityTrendChartProps) {
  const data = useMemo(() => {
    if (assessments.length === 0) return [];

    // Group assessments by month
    const monthlyData = new Map<string, { sum: number; count: number }>();
    
    assessments.forEach(a => {
      if (a.assessed_at) {
        const date = new Date(a.assessed_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { sum: 0, count: 0 });
        }
        
        const entry = monthlyData.get(monthKey)!;
        entry.sum += maturityToPercent(a.maturity_level);
        entry.count++;
      }
    });

    // Convert to array and sort by date
    const sortedData = Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6) // Last 6 months
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
          score: Math.round(value.sum / value.count),
        };
      });

    return sortedData;
  }, [assessments]);

  if (data.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-base">Evolução da Maturidade</CardTitle>
          <CardDescription>
            {frameworkName || 'Framework não selecionado'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-muted-foreground text-center">
            Avalie controles para visualizar a evolução da maturidade ao longo do tempo.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate current average maturity
  const currentMaturity = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + maturityToPercent(a.maturity_level), 0) / assessments.length)
    : 0;

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Evolução da Maturidade</CardTitle>
          <CardDescription>
            {frameworkName || 'Framework'} - Score atual: {currentMaturity}%
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value}%`, 'Maturidade']}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="score"
              name="Maturidade"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorScore)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
