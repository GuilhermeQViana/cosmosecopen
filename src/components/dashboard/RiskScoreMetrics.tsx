import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import {
  calculateRiskScore,
  getRiskScoreClassification,
  RISK_SCORE_THRESHOLDS,
} from '@/lib/risk-methodology';
import { cn } from '@/lib/utils';
import { AlertTriangle, Shield, TrendingUp, Zap } from 'lucide-react';
import { ChartSkeleton } from './ChartSkeleton';

interface RiskScoreMetricsProps {
  controls: Control[];
  assessments: Assessment[];
  isLoading?: boolean;
}

interface RiskScoreDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
  total: number;
  averageScore: number;
}

export function RiskScoreMetrics({
  controls,
  assessments,
  isLoading = false,
}: RiskScoreMetricsProps) {
  const distribution = useMemo((): RiskScoreDistribution => {
    const assessmentMap = new Map(assessments.map((a) => [a.control_id, a]));
    
    let low = 0;
    let medium = 0;
    let high = 0;
    let critical = 0;
    let totalScore = 0;
    let scored = 0;

    for (const control of controls) {
      const assessment = assessmentMap.get(control.id);
      if (!assessment) continue;

      const currentMaturity = parseInt(assessment.maturity_level);
      const targetMaturity = parseInt(assessment.target_maturity);
      const weight = control.weight || 1;

      const riskScore = calculateRiskScore(currentMaturity, targetMaturity, weight);
      const classification = getRiskScoreClassification(riskScore);

      totalScore += riskScore;
      scored++;

      switch (classification.level) {
        case 'LOW':
          low++;
          break;
        case 'MEDIUM':
          medium++;
          break;
        case 'HIGH':
          high++;
          break;
        case 'CRITICAL':
          critical++;
          break;
      }
    }

    return {
      low,
      medium,
      high,
      critical,
      total: scored,
      averageScore: scored > 0 ? Math.round((totalScore / scored) * 10) / 10 : 0,
    };
  }, [controls, assessments]);

  if (isLoading) {
    return <ChartSkeleton title={true} />;
  }

  const categories = [
    {
      key: 'critical',
      label: 'Crítico',
      count: distribution.critical,
      threshold: RISK_SCORE_THRESHOLDS.CRITICAL,
      icon: AlertTriangle,
      color: 'bg-destructive',
      textColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      key: 'high',
      label: 'Alto',
      count: distribution.high,
      threshold: RISK_SCORE_THRESHOLDS.HIGH,
      icon: Zap,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      key: 'medium',
      label: 'Médio',
      count: distribution.medium,
      threshold: RISK_SCORE_THRESHOLDS.MEDIUM,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    {
      key: 'low',
      label: 'Baixo',
      count: distribution.low,
      threshold: RISK_SCORE_THRESHOLDS.LOW,
      icon: Shield,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  const getPercentage = (count: number) => 
    distribution.total > 0 ? Math.round((count / distribution.total) * 100) : 0;

  const averageClassification = getRiskScoreClassification(distribution.averageScore);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Risk Score dos Controles</CardTitle>
            <CardDescription>Distribuição por classificação de risco</CardDescription>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn('font-mono cursor-help', averageClassification.color)}
              >
                Média: {distribution.averageScore}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Risk Score médio: {averageClassification.label}
                <br />
                Ação: {averageClassification.action}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Distribution Bar */}
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
          {categories.map((cat) => {
            const percentage = getPercentage(cat.count);
            if (percentage === 0) return null;
            return (
              <Tooltip key={cat.key}>
                <TooltipTrigger asChild>
                  <div
                    className={cn('h-full transition-all', cat.color)}
                    style={{ width: `${percentage}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {cat.label}: {cat.count} ({percentage}%)
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const percentage = getPercentage(cat.count);
            
            return (
              <div
                key={cat.key}
                className={cn(
                  'p-3 rounded-lg border transition-colors',
                  cat.count > 0 ? cat.bgColor : 'bg-muted/30',
                  cat.key === 'critical' && cat.count > 0 && 'ring-1 ring-destructive/30'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('w-4 h-4', cat.count > 0 ? cat.textColor : 'text-muted-foreground')} />
                    <span className={cn('text-sm font-medium', cat.count > 0 ? cat.textColor : 'text-muted-foreground')}>
                      {cat.label}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {cat.threshold.min}-{cat.threshold.max}
                    {cat.key === 'critical' && '+'}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    'text-2xl font-bold',
                    cat.count > 0 ? cat.textColor : 'text-muted-foreground'
                  )}>
                    {cat.count}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({percentage}%)
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className={cn('h-1 mt-2', cat.count === 0 && 'opacity-30')}
                />
              </div>
            );
          })}
        </div>

        {/* Alert for Critical */}
        {distribution.critical > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              {distribution.critical} controle{distribution.critical > 1 ? 's' : ''} requer{distribution.critical === 1 ? '' : 'em'} ação imediata
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
