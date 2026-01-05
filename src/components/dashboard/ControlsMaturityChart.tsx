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
import { ChartSkeleton } from './ChartSkeleton';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Assessment } from '@/hooks/useAssessments';

interface ControlsMaturityChartProps {
  assessments: Assessment[];
  isLoading?: boolean;
}

const MATURITY_COLORS = [
  'hsl(var(--maturity-0))',
  'hsl(var(--maturity-1))',
  'hsl(var(--maturity-2))',
  'hsl(var(--maturity-3))',
  'hsl(var(--maturity-4))',
  'hsl(var(--maturity-5))',
];

const MATURITY_LABELS = [
  'Inexistente',
  'Inicial',
  'Repetível',
  'Definido',
  'Gerenciado',
  'Otimizado',
];

export function ControlsMaturityChart({ assessments, isLoading }: ControlsMaturityChartProps) {
  const navigate = useNavigate();

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
      fullLabel: `${index} - ${MATURITY_LABELS[index]}`,
      count,
      fill: MATURITY_COLORS[index],
      maturityLevel: index.toString(),
    }));
  }, [assessments]);

  const totalAssessed = assessments.length;

  const handleClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload?.maturityLevel !== undefined) {
      const level = data.activePayload[0].payload.maturityLevel;
      navigate(`/diagnostico?maturity=${level}`);
    }
  };

  if (isLoading) {
    return <ChartSkeleton type="bar" height={250} description />;
  }

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload;
    const percentage = totalAssessed > 0 ? Math.round((item.count / totalAssessed) * 100) : 0;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: item.fill }} />
          <span className="font-medium">{item.fullLabel}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {item.count} controles ({percentage}%)
        </div>
        <p className="text-xs text-primary mt-2">Clique para filtrar</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Controles por Nível de Maturidade</CardTitle>
        <CardDescription>Distribuição dos {totalAssessed} controles avaliados</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} onClick={handleClick} style={{ cursor: 'pointer' }}>
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
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
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
