import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useVendorAssessments } from '@/hooks/useVendorAssessments';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';

interface VendorTrendChartProps {
  vendorId?: string;
}

export function VendorTrendChart({ vendorId }: VendorTrendChartProps) {
  const { data: assessments = [], isLoading } = useVendorAssessments(vendorId);

  const chartData = useMemo(() => {
    if (assessments.length === 0) return [];

    // Group assessments by month
    const monthlyData: Record<string, { scores: number[]; count: number }> = {};

    assessments
      .filter(a => a.overall_score !== null && (a.status === 'completed' || a.status === 'approved'))
      .forEach(assessment => {
        const monthKey = format(startOfMonth(parseISO(assessment.assessment_date)), 'yyyy-MM');
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { scores: [], count: 0 };
        }
        
        monthlyData[monthKey].scores.push(assessment.overall_score!);
        monthlyData[monthKey].count++;
      });

    // Calculate averages and format for chart
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([monthKey, data]) => {
        const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
        const date = parseISO(monthKey + '-01');
        
        return {
          month: format(date, 'MMM/yy', { locale: ptBR }),
          score: avgScore,
          assessments: data.count,
        };
      });
  }, [assessments]);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Evolução da Conformidade</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = chartData.length > 0;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Evolução da Conformidade</CardTitle>
        <CardDescription>
          Tendência do score médio de avaliações ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            <p>Realize avaliações para ver a evolução temporal</p>
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  strokeOpacity={0.3}
                />
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
                  formatter={(value: number, name: string) => {
                    if (name === 'score') return [`${value}%`, 'Score Médio'];
                    return [value, 'Avaliações'];
                  }}
                />
                <Legend 
                  formatter={(value) => value === 'score' ? 'Score Médio' : 'Avaliações'}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
