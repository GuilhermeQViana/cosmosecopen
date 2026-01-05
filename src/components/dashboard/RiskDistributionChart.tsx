import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './ChartSkeleton';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Risk } from '@/hooks/useRisks';

interface RiskDistributionChartProps {
  risks: Risk[];
  isLoading?: boolean;
}

function getRiskLevel(probability: number, impact: number): 'critical' | 'high' | 'medium' | 'low' {
  const level = probability * impact;
  if (level >= 20) return 'critical';
  if (level >= 12) return 'high';
  if (level >= 6) return 'medium';
  return 'low';
}

const LEVEL_LABELS: Record<string, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
};

export function RiskDistributionChart({ risks, isLoading }: RiskDistributionChartProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <ChartSkeleton type="pie" height={250} />;
  }

  const data = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };

    risks.forEach(risk => {
      const level = getRiskLevel(risk.inherent_probability, risk.inherent_impact);
      counts[level]++;
    });

    return [
      { name: 'Crítico', value: counts.critical, color: 'hsl(var(--risk-critical))', level: 'critical' },
      { name: 'Alto', value: counts.high, color: 'hsl(var(--risk-high))', level: 'high' },
      { name: 'Médio', value: counts.medium, color: 'hsl(var(--risk-medium))', level: 'medium' },
      { name: 'Baixo', value: counts.low, color: 'hsl(var(--risk-low))', level: 'low' },
    ].filter(d => d.value > 0);
  }, [risks]);

  const handleClick = (data: any) => {
    if (data?.level) {
      navigate(`/riscos?level=${data.level}`);
    }
  };

  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição de Riscos</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-sm text-muted-foreground text-center">
            Nenhum risco cadastrado.<br />
            Acesse a página de Riscos para adicionar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload;
    const percentage = risks.length > 0 ? Math.round((item.value / risks.length) * 100) : 0;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
          <span className="font-medium">{item.name}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {item.value} riscos ({percentage}%)
        </div>
        <p className="text-xs text-primary mt-2">Clique para filtrar</p>
      </div>
    );
  };

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
              onClick={handleClick}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="transition-all duration-200 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
