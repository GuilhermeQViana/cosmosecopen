import { Risk, calculateRiskLevel } from '@/hooks/useRisks';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, Activity, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const mediumRisks = risks.filter((r) => {
    const level = calculateRiskLevel(r.inherent_probability, r.inherent_impact);
    return level >= 6 && level < 12;
  }).length;

  const lowRisks = risks.filter((r) => {
    const level = calculateRiskLevel(r.inherent_probability, r.inherent_impact);
    return level < 6;
  }).length;

  const mitigatedRisks = risks.filter((r) => {
    if (!r.residual_probability || !r.residual_impact) return false;
    const inherent = calculateRiskLevel(r.inherent_probability, r.inherent_impact);
    const residual = calculateRiskLevel(r.residual_probability, r.residual_impact);
    return residual < inherent;
  }).length;

  const withTreatment = risks.filter((r) => r.treatment !== 'aceitar').length;
  const treatmentPercentage = totalRisks > 0 ? Math.round((withTreatment / totalRisks) * 100) : 0;

  const withoutResidual = risks.filter((r) => !r.residual_probability || !r.residual_impact).length;

  const averageLevel = totalRisks > 0
    ? Math.round(
        risks.reduce((acc, r) => acc + calculateRiskLevel(r.inherent_probability, r.inherent_impact), 0) / totalRisks
      )
    : 0;

  const stats = [
    {
      label: 'Total de Riscos',
      value: totalRisks,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Riscos Críticos',
      value: criticalRisks,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      label: 'Riscos Altos',
      value: highRisks,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      label: 'Riscos Mitigados',
      value: mitigatedRisks,
      icon: TrendingDown,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
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

      {/* Secondary Stats and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Average Level */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{averageLevel}</p>
                  <p className="text-xs text-muted-foreground">Nível Médio</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Percentage */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <Target className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{treatmentPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Com Tratamento</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Without Residual */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Activity className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{withoutResidual}</p>
                  <p className="text-xs text-muted-foreground">Sem Residual</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Bar */}
      {totalRisks > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">Distribuição por Nível</p>
            <div className="flex h-4 rounded-full overflow-hidden">
              {criticalRisks > 0 && (
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${(criticalRisks / totalRisks) * 100}%` }}
                  title={`Crítico: ${criticalRisks}`}
                />
              )}
              {highRisks > 0 && (
                <div
                  className="bg-orange-500 transition-all"
                  style={{ width: `${(highRisks / totalRisks) * 100}%` }}
                  title={`Alto: ${highRisks}`}
                />
              )}
              {mediumRisks > 0 && (
                <div
                  className="bg-yellow-500 transition-all"
                  style={{ width: `${(mediumRisks / totalRisks) * 100}%` }}
                  title={`Médio: ${mediumRisks}`}
                />
              )}
              {lowRisks > 0 && (
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${(lowRisks / totalRisks) * 100}%` }}
                  title={`Baixo: ${lowRisks}`}
                />
              )}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span>Crítico ({criticalRisks})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span>Alto ({highRisks})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <span>Médio ({mediumRisks})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span>Baixo ({lowRisks})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
