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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useVendors, getRiskLevelFromScore } from '@/hooks/useVendors';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

export function VendorComparison() {
  const { data: vendors = [], isLoading } = useVendors();

  const chartData = useMemo(() => {
    return vendors
      .filter(v => v.last_assessment?.overall_score !== undefined && v.last_assessment?.overall_score !== null)
      .map(vendor => ({
        name: vendor.name.length > 15 ? vendor.name.substring(0, 15) + '...' : vendor.name,
        fullName: vendor.name,
        score: vendor.last_assessment?.overall_score ?? 0,
        riskLevel: getRiskLevelFromScore(vendor.last_assessment?.overall_score ?? null),
        criticality: vendor.criticality,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 vendors
  }, [vendors]);

  const getBarColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critico':
        return 'hsl(0, 84%, 60%)'; // Red
      case 'alto':
        return 'hsl(25, 95%, 53%)'; // Orange
      case 'medio':
        return 'hsl(45, 93%, 47%)'; // Amber
      default:
        return 'hsl(142, 76%, 36%)'; // Green
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Comparativo de Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = chartData.length > 0;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Comparativo de Fornecedores</CardTitle>
        <CardDescription>
          Ranking dos {Math.min(10, chartData.length)} fornecedores por score de conformidade
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Realize avaliações para comparar fornecedores</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  strokeOpacity={0.3}
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}%`,
                    props.payload.fullName,
                  ]}
                  labelFormatter={() => 'Score de Conformidade'}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.riskLevel)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
