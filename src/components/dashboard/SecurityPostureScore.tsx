import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartSkeleton } from './ChartSkeleton';
import { TrendingUp, TrendingDown, Minus, Shield, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Assessment } from '@/hooks/useAssessments';
import type { Risk } from '@/hooks/useRisks';

interface SecurityPostureScoreProps {
  assessments: Assessment[];
  risks: Risk[];
  controls: { id: string }[];
  previousScore?: number;
  isLoading?: boolean;
}

export function SecurityPostureScore({ 
  assessments, 
  risks, 
  controls,
  previousScore,
  isLoading 
}: SecurityPostureScoreProps) {
  if (isLoading) {
    return <ChartSkeleton type="custom" height={280} />;
  }

  const { score, breakdown, status, statusColor } = useMemo(() => {
    // Calculate compliance score (40% weight)
    const conformeCount = assessments.filter(a => a.status === 'conforme').length;
    const complianceScore = assessments.length > 0 
      ? (conformeCount / assessments.length) * 100 
      : 0;

    // Calculate risk score (35% weight) - inverse of critical risk percentage
    const criticalRisks = risks.filter(r => (r.inherent_probability * r.inherent_impact) >= 20).length;
    const highRisks = risks.filter(r => {
      const level = r.inherent_probability * r.inherent_impact;
      return level >= 12 && level < 20;
    }).length;
    const riskPenalty = risks.length > 0 
      ? ((criticalRisks * 2 + highRisks) / (risks.length * 2)) * 100 
      : 0;
    const riskScore = Math.max(0, 100 - riskPenalty);

    // Calculate coverage score (25% weight)
    const coverageScore = controls.length > 0 
      ? (assessments.length / controls.length) * 100 
      : 0;

    // Weighted total
    const totalScore = Math.round(
      (complianceScore * 0.40) + 
      (riskScore * 0.35) + 
      (coverageScore * 0.25)
    );

    // Determine status
    let statusLabel = 'Crítico';
    let color = 'hsl(var(--risk-critical))';
    if (totalScore >= 80) {
      statusLabel = 'Saudável';
      color = 'hsl(var(--success))';
    } else if (totalScore >= 60) {
      statusLabel = 'Atenção';
      color = 'hsl(var(--warning))';
    } else if (totalScore >= 40) {
      statusLabel = 'Risco';
      color = 'hsl(var(--risk-high))';
    }

    return {
      score: totalScore,
      breakdown: {
        compliance: Math.round(complianceScore),
        risk: Math.round(riskScore),
        coverage: Math.round(coverageScore),
      },
      status: statusLabel,
      statusColor: color,
    };
  }, [assessments, risks, controls]);

  const trend = useMemo(() => {
    if (!previousScore) return null;
    const diff = score - previousScore;
    if (diff > 0) return { direction: 'up' as const, value: diff };
    if (diff < 0) return { direction: 'down' as const, value: Math.abs(diff) };
    return { direction: 'stable' as const, value: 0 };
  }, [score, previousScore]);

  // Calculate stroke dasharray for circular progress
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Security Posture Score
            </CardTitle>
            <CardDescription>Índice consolidado de segurança</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Score calculado com base em: Conformidade (40%), Exposição a Riscos (35%) e Cobertura de Avaliação (25%).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-8">
          {/* Circular Gauge */}
          <div className="relative">
            <svg width="180" height="180" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="90"
                cy="90"
                r="80"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="90"
                cy="90"
                r="80"
                fill="none"
                stroke={statusColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold font-space" style={{ color: statusColor }}>
                {score}
              </span>
              <span className="text-sm text-muted-foreground">de 100</span>
              {trend && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  trend.direction === 'up' ? 'text-[hsl(var(--success))]' : 
                  trend.direction === 'down' ? 'text-[hsl(var(--risk-high))]' : 
                  'text-muted-foreground'
                }`}>
                  {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
                  {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
                  {trend.direction === 'stable' && <Minus className="h-3 w-3" />}
                  <span>{trend.value > 0 ? `${trend.value}pts` : 'Estável'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-4">
            <div 
              className="px-3 py-2 rounded-lg text-center font-medium text-sm"
              style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
            >
              {status}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Conformidade</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${breakdown.compliance}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs w-8">{breakdown.compliance}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Gestão de Riscos</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(var(--success))] transition-all duration-500"
                      style={{ width: `${breakdown.risk}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs w-8">{breakdown.risk}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Cobertura</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(var(--chart-3))] transition-all duration-500"
                      style={{ width: `${breakdown.coverage}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs w-8">{breakdown.coverage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
