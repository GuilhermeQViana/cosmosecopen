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
import { useMemo } from 'react';
import type { Assessment } from '@/hooks/useAssessments';

interface ControlsMaturityChartProps {
  assessments: Assessment[];
}

const MATURITY_COLORS = [
  'hsl(var(--maturity-0))',
  'hsl(var(--maturity-1))',
  'hsl(var(--maturity-2))',
  'hsl(var(--maturity-3))',
  'hsl(var(--maturity-4))',
  'hsl(var(--maturity-5))',
];

export function ControlsMaturityChart({ assessments }: ControlsMaturityChartProps) {
  const data = useMemo(() => {
    const levelCounts = [0, 0, 0, 0, 0, 0];
    
    assessments.forEach(a => {
      const level = parseInt(a.maturity_level, 10);
      if (level >= 0 && level <= 5) {
        levelCounts[level]++;
      }
    });

    return levelCounts.map((count, index) => ({
      level: `Nível ${index}`,
      count,
      fill: MATURITY_COLORS[index],
    }));
  }, [assessments]);

  const totalAssessed = assessments.length;

  if (totalAssessed === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Controles por Nível de Maturidade</CardTitle>
          <CardDescription>Nenhum controle avaliado</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-sm text-muted-foreground text-center">
            Nenhum controle foi avaliado ainda.<br />
            Acesse o Diagnóstico para começar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Controles por Nível de Maturidade</CardTitle>
        <CardDescription>Distribuição dos {totalAssessed} controles avaliados</CardDescription>
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
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
