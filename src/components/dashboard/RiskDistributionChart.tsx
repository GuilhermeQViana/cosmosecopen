import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import type { Risk } from '@/hooks/useRisks';

interface RiskDistributionChartProps {
  risks: Risk[];
}

function getRiskLevel(probability: number, impact: number): 'critical' | 'high' | 'medium' | 'low' {
  const level = probability * impact;
  if (level >= 20) return 'critical';
  if (level >= 12) return 'high';
  if (level >= 6) return 'medium';
  return 'low';
}

export function RiskDistributionChart({ risks }: RiskDistributionChartProps) {
  const data = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };

    risks.forEach(risk => {
      const level = getRiskLevel(risk.inherent_probability, risk.inherent_impact);
      counts[level]++;
    });

    return [
      { name: 'Crítico', value: counts.critical, color: 'hsl(var(--risk-critical))' },
      { name: 'Alto', value: counts.high, color: 'hsl(var(--risk-high))' },
      { name: 'Médio', value: counts.medium, color: 'hsl(var(--risk-medium))' },
      { name: 'Baixo', value: counts.low, color: 'hsl(var(--risk-low))' },
    ].filter(d => d.value > 0);
  }, [risks]);

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
