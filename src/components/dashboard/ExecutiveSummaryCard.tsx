import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartSkeleton } from './ChartSkeleton';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Assessment } from '@/hooks/useAssessments';
import type { Risk } from '@/hooks/useRisks';
import type { ActionPlan } from '@/hooks/useActionPlans';

interface ExecutiveSummaryCardProps {
  assessments: Assessment[];
  risks: Risk[];
  actionPlans: ActionPlan[];
  controls: { id: string }[];
  isLoading?: boolean;
}

export function ExecutiveSummaryCard({ 
  assessments, 
  risks, 
  actionPlans, 
  controls,
  isLoading 
}: ExecutiveSummaryCardProps) {
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    // Security Posture Score
    const conformeCount = assessments.filter(a => a.status === 'conforme').length;
    const complianceScore = assessments.length > 0 
      ? (conformeCount / assessments.length) * 100 
      : 0;

    const criticalRisks = risks.filter(r => (r.inherent_probability * r.inherent_impact) >= 20);
    const riskPenalty = risks.length > 0 
      ? ((criticalRisks.length * 2) / (risks.length * 2)) * 100 
      : 0;
    const riskScore = Math.max(0, 100 - riskPenalty);

    const coverageScore = controls.length > 0 
      ? (assessments.length / controls.length) * 100 
      : 0;

    const postureScore = Math.round(
      (complianceScore * 0.40) + 
      (riskScore * 0.35) + 
      (coverageScore * 0.25)
    );

    // Compliance %
    const compliancePercent = assessments.length > 0 
      ? Math.round((conformeCount / assessments.length) * 100)
      : 0;

    // Overdue plans
    const now = new Date();
    const overduePlans = actionPlans.filter(p => {
      if (p.status === 'done' || !p.due_date) return false;
      return new Date(p.due_date) < now;
    });

    // Determine overall status
    let status: 'healthy' | 'attention' | 'critical' = 'healthy';
    let statusLabel = 'Saudável';
    let statusColor = 'hsl(var(--success))';
    
    if (criticalRisks.length > 0 || overduePlans.length > 3 || postureScore < 40) {
      status = 'critical';
      statusLabel = 'Crítico';
      statusColor = 'hsl(var(--risk-critical))';
    } else if (postureScore < 60 || overduePlans.length > 0) {
      status = 'attention';
      statusLabel = 'Atenção';
      statusColor = 'hsl(var(--warning))';
    }

    return {
      postureScore,
      criticalRisksCount: criticalRisks.length,
      compliancePercent,
      overduePlansCount: overduePlans.length,
      status,
      statusLabel,
      statusColor,
    };
  }, [assessments, risks, actionPlans, controls]);

  if (isLoading) {
    return <ChartSkeleton type="custom" height={100} />;
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${metrics.statusColor}20` }}
            >
              <Shield className="h-8 w-8" style={{ color: metrics.statusColor }} />
            </div>
            <div>
              <Badge 
                className="mb-1"
                style={{ 
                  backgroundColor: `${metrics.statusColor}20`,
                  color: metrics.statusColor,
                  borderColor: `${metrics.statusColor}50`,
                }}
              >
                {metrics.statusLabel}
              </Badge>
              <h2 className="text-2xl font-bold font-space">Resumo Executivo</h2>
              <p className="text-sm text-muted-foreground">Visão consolidada da postura de segurança</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Posture Score */}
            <div className="text-center">
              <div className="text-3xl font-bold font-space" style={{ color: metrics.statusColor }}>
                {metrics.postureScore}
              </div>
              <p className="text-xs text-muted-foreground">Security Score</p>
            </div>

            {/* Critical Risks */}
            <div className="text-center">
              <div className={`text-3xl font-bold font-space ${
                metrics.criticalRisksCount > 0 ? 'text-[hsl(var(--risk-critical))]' : 'text-[hsl(var(--success))]'
              }`}>
                {metrics.criticalRisksCount}
              </div>
              <p className="text-xs text-muted-foreground">Riscos Críticos</p>
            </div>

            {/* Compliance */}
            <div className="text-center">
              <div className={`text-3xl font-bold font-space ${
                metrics.compliancePercent >= 80 ? 'text-[hsl(var(--success))]' : 
                metrics.compliancePercent >= 50 ? 'text-[hsl(var(--warning))]' : 
                'text-[hsl(var(--risk-high))]'
              }`}>
                {metrics.compliancePercent}%
              </div>
              <p className="text-xs text-muted-foreground">Conformidade</p>
            </div>

            {/* Overdue Plans */}
            <div className="text-center">
              <div className={`text-3xl font-bold font-space ${
                metrics.overduePlansCount > 0 ? 'text-[hsl(var(--risk-high))]' : 'text-[hsl(var(--success))]'
              }`}>
                {metrics.overduePlansCount}
              </div>
              <p className="text-xs text-muted-foreground">Planos Atrasados</p>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={() => navigate('/relatorios')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Gerar Relatório
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
