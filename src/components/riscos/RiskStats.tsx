import { Risk, calculateRiskLevel } from '@/hooks/useRisks';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, Shield, Activity } from 'lucide-react';

interface RiskStatsProps {
  risks: Risk[];
}

export function RiskStats({ risks }: RiskStatsProps) {
  const totalRisks = risks.length;

  const criticalRisks = risks.filter((r) => {
    const level = calculateRiskLevel(r.inherent_probability, r.inherent_impact);
    return level >= 20;
  }).length;

  const highRisks = risks.filter((r) => {
    const level = calculateRiskLevel(r.inherent_probability, r.inherent_impact);
    return level >= 12 && level < 20;
  }).length;

  const mitigatedRisks = risks.filter((r) => {
    if (!r.residual_probability || !r.residual_impact) return false;
    const inherent = calculateRiskLevel(r.inherent_probability, r.inherent_impact);
    const residual = calculateRiskLevel(r.residual_probability, r.residual_impact);
    return residual < inherent;
  }).length;

  const stats = [
    {
      label: 'Total de Riscos',
      value: totalRisks,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Riscos Críticos',
      value: criticalRisks,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Riscos Altos',
      value: highRisks,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Riscos Mitigados',
      value: mitigatedRisks,
      icon: TrendingDown,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
