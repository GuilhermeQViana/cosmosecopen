import { useMemo, useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import { useAssessments } from '@/hooks/useAssessments';
import { useControls } from '@/hooks/useControls';
import { useRisks } from '@/hooks/useRisks';
import { useEvidences } from '@/hooks/useEvidences';
import { useActionPlans } from '@/hooks/useActionPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StaggeredGrid, AnimatedItem } from '@/components/ui/staggered-list';
import {
  Shield,
  AlertTriangle,
  FileCheck,
  ListTodo,
  XCircle,
  Clock,
  Target,
  Activity,
} from 'lucide-react';
import { ComplianceRadarChart } from '@/components/dashboard/ComplianceRadarChart';
import { MaturityTrendChart } from '@/components/dashboard/MaturityTrendChart';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { ActionPlanStatusChart } from '@/components/dashboard/ActionPlanStatusChart';
import { ControlsMaturityChart } from '@/components/dashboard/ControlsMaturityChart';
import { RiskScoreMetrics } from '@/components/dashboard/RiskScoreMetrics';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { AttentionSection } from '@/components/dashboard/AttentionSection';
import { NextStepsWidget } from '@/components/dashboard/NextStepsWidget';
import { PeriodFilter, Period, getPeriodDates, getPreviousPeriodDates } from '@/components/dashboard/PeriodFilter';
import { MetricComparison } from '@/components/dashboard/MetricComparison';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';

export default function Dashboard() {
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();
  const [period, setPeriod] = useState<Period>('30d');
  
  // Fetch real data from database
  const { data: controls = [], isLoading: controlsLoading } = useControls();
  const { data: assessments = [], isLoading: assessmentsLoading } = useAssessments();
  const { data: risks = [], isLoading: risksLoading } = useRisks();
  const { data: evidences = [] } = useEvidences();
  const { data: actionPlans = [], isLoading: actionPlansLoading } = useActionPlans();

  const isChartsLoading = controlsLoading || assessmentsLoading || risksLoading || actionPlansLoading;

  // Filter data by period for comparison
  const { currentPeriodData, previousPeriodData } = useMemo(() => {
    const { start: currentStart } = getPeriodDates(period);
    const { start: prevStart, end: prevEnd } = getPreviousPeriodDates(period);

    const currentAssessments = assessments.filter(
      (a) => new Date(a.updated_at) >= currentStart
    );
    const previousAssessments = assessments.filter(
      (a) => {
        const date = new Date(a.updated_at);
        return date >= prevStart && date < prevEnd;
      }
    );

    const currentRisks = risks.filter(
      (r) => new Date(r.created_at) >= currentStart
    );
    const previousRisks = risks.filter(
      (r) => {
        const date = new Date(r.created_at);
        return date >= prevStart && date < prevEnd;
      }
    );

    const currentPlans = actionPlans.filter(
      (p) => new Date(p.created_at) >= currentStart
    );
    const previousPlans = actionPlans.filter(
      (p) => {
        const date = new Date(p.created_at);
        return date >= prevStart && date < prevEnd;
      }
    );

    return {
      currentPeriodData: {
        assessments: currentAssessments,
        risks: currentRisks,
        plans: currentPlans,
      },
      previousPeriodData: {
        assessments: previousAssessments,
        risks: previousRisks,
        plans: previousPlans,
      },
    };
  }, [assessments, risks, actionPlans, period]);

  // Calculate real metrics with comparisons
  const metrics = useMemo(() => {
    const totalControls = controls.length;
    const assessedControls = assessments.length;
    const conformeCount = assessments.filter(a => a.status === 'conforme').length;
    const conformanceScore = assessedControls > 0 ? Math.round((conformeCount / assessedControls) * 100) : 0;
    
    const criticalRisks = risks.filter(r => (r.inherent_probability * r.inherent_impact) >= 20).length;
    const pendingActions = actionPlans.filter(a => a.status !== 'done').length;

    // Previous period metrics for comparison
    const prevAssessedControls = previousPeriodData.assessments.length;
    const prevConformeCount = previousPeriodData.assessments.filter(a => a.status === 'conforme').length;
    const prevConformanceScore = prevAssessedControls > 0 ? Math.round((prevConformeCount / prevAssessedControls) * 100) : 0;
    
    const prevCriticalRisks = previousPeriodData.risks.filter(r => (r.inherent_probability * r.inherent_impact) >= 20).length;
    const prevPendingActions = previousPeriodData.plans.filter(a => a.status !== 'done').length;

    return [
      {
        title: 'Score de Conformidade',
        value: `${conformanceScore}%`,
        numericValue: conformanceScore,
        previousValue: prevConformanceScore,
        description: `${conformeCount} de ${assessedControls} controles conformes`,
        icon: Shield,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        higherIsBetter: true,
      },
      {
        title: 'Riscos Críticos',
        value: criticalRisks.toString(),
        numericValue: criticalRisks,
        previousValue: prevCriticalRisks,
        description: `de ${risks.length} riscos totais`,
        icon: AlertTriangle,
        color: 'text-[hsl(var(--risk-critical))]',
        bgColor: 'bg-[hsl(var(--risk-critical))]/10',
        higherIsBetter: false,
      },
      {
        title: 'Evidências',
        value: evidences.length.toString(),
        numericValue: evidences.length,
        previousValue: 0,
        description: 'evidências cadastradas',
        icon: FileCheck,
        color: 'text-[hsl(var(--success))]',
        bgColor: 'bg-[hsl(var(--success))]/10',
        higherIsBetter: true,
      },
      {
        title: 'Ações Pendentes',
        value: pendingActions.toString(),
        numericValue: pendingActions,
        previousValue: prevPendingActions,
        description: `de ${actionPlans.length} planos totais`,
        icon: ListTodo,
        color: 'text-[hsl(var(--warning))]',
        bgColor: 'bg-[hsl(var(--warning))]/10',
        higherIsBetter: false,
      },
    ];
  }, [controls, assessments, risks, evidences, actionPlans, previousPeriodData]);

  // Calculate real KPIs
  const kpis = useMemo(() => {
    const totalControls = controls.length;
    const assessedControls = assessments.length;
    const conformeCount = assessments.filter(a => a.status === 'conforme').length;
    const gapsCount = assessments.filter(a => a.status === 'nao_conforme' || a.status === 'parcial').length;
    const inProgressPlans = actionPlans.filter(a => a.status === 'in_progress').length;
    const totalPlans = actionPlans.length;

    return [
      { 
        label: 'Controles Avaliados', 
        value: assessedControls.toString(), 
        total: totalControls.toString(), 
        percent: totalControls > 0 ? Math.round((assessedControls / totalControls) * 100) : 0 
      },
      { 
        label: 'Controles Conformes', 
        value: conformeCount.toString(), 
        total: assessedControls.toString(), 
        percent: assessedControls > 0 ? Math.round((conformeCount / assessedControls) * 100) : 0 
      },
      { 
        label: 'Gaps Identificados', 
        value: gapsCount.toString(), 
        total: assessedControls.toString(), 
        percent: assessedControls > 0 ? Math.round((gapsCount / assessedControls) * 100) : 0 
      },
      { 
        label: 'Planos em Andamento', 
        value: inProgressPlans.toString(), 
        total: totalPlans.toString(), 
        percent: totalPlans > 0 ? Math.round((inProgressPlans / totalPlans) * 100) : 0 
      },
    ];
  }, [controls, assessments, actionPlans]);

  // Get top gaps from assessments
  const recentGaps = useMemo(() => {
    const gapAssessments = assessments
      .filter(a => a.status === 'nao_conforme' || a.status === 'parcial')
      .slice(0, 5);
    
    return gapAssessments.map(a => {
      const control = controls.find(c => c.id === a.control_id);
      return {
        control: control?.code || 'N/A',
        name: control?.name || 'Controle não encontrado',
        status: a.status,
        framework: currentFramework?.name || 'N/A',
      };
    });
  }, [assessments, controls, currentFramework]);

  return (
    <div className="space-y-6 relative">
      {/* Subtle cosmic background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <AnimatedItem animation="fade-up" delay={0} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-space">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão geral de conformidade da {organization?.name || 'organização'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodFilter value={period} onChange={setPeriod} />
          {currentFramework && (
            <Badge variant="outline" className="text-sm px-3 py-1.5 bg-primary/5 border-primary/20">
              {currentFramework.name}
            </Badge>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 animate-pulse text-primary" />
            Atualizado agora
          </div>
        </div>
      </AnimatedItem>

      {/* Onboarding Checklist for new users */}
      <AnimatedItem animation="fade-up" delay={50}>
        <OnboardingChecklist />
      </AnimatedItem>

      {/* Attention Section */}
      <AnimatedItem animation="fade-up" delay={100}>
        <AttentionSection
          controls={controls}
          assessments={assessments}
          risks={risks}
          actionPlans={actionPlans}
          isLoading={isChartsLoading}
        />
      </AnimatedItem>

      {/* Metrics Grid */}
      <StaggeredGrid columns={4} staggerDelay={80} animation="scale-in">
        {metrics.map((metric) => (
          <Card key={metric.title} className="card-metric group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor} group-hover:scale-110 transition-transform`}>
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-space">{metric.value}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              {metric.previousValue > 0 && (
                <div className="mt-2">
                  <MetricComparison
                    current={metric.numericValue}
                    previous={metric.previousValue}
                    higherIsBetter={metric.higherIsBetter}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </StaggeredGrid>

      {/* KPIs */}
      <StaggeredGrid columns={4} staggerDelay={60} animation="fade-up">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4 group hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <Target className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold font-space">{kpi.value}</span>
              <span className="text-sm text-muted-foreground">/ {kpi.total}</span>
            </div>
            <Progress value={kpi.percent} className="h-1.5" />
          </Card>
        ))}
      </StaggeredGrid>

      {/* Charts Row 1 */}
      <AnimatedItem animation="fade-up" delay={200}>
        <MaturityTrendChart 
          assessments={assessments} 
          frameworkName={currentFramework?.name} 
          isLoading={assessmentsLoading}
        />
      </AnimatedItem>

      {/* Charts Row 2 */}
      <StaggeredGrid columns={3} staggerDelay={100} animation="fade-up">
        <ComplianceRadarChart controls={controls} assessments={assessments} isLoading={isChartsLoading} />
        <RiskDistributionChart risks={risks} isLoading={risksLoading} />
        <ActionPlanStatusChart actionPlans={actionPlans} isLoading={actionPlansLoading} />
      </StaggeredGrid>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatedItem animation="fade-up" delay={250}>
          <RiskScoreMetrics controls={controls} assessments={assessments} isLoading={isChartsLoading} />
        </AnimatedItem>
        <AnimatedItem animation="fade-up" delay={300}>
          <ControlsMaturityChart assessments={assessments} isLoading={assessmentsLoading} />
        </AnimatedItem>
      </div>

      {/* Charts Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AnimatedItem animation="fade-up" delay={350}>
          <NextStepsWidget
            controls={controls}
            assessments={assessments}
            risks={risks}
            actionPlans={actionPlans}
            evidences={evidences}
            isLoading={isChartsLoading}
          />
        </AnimatedItem>
        <div className="lg:col-span-2 space-y-4">
          <AnimatedItem animation="fade-up" delay={400}>
            <RecentActivity />
          </AnimatedItem>
          <AnimatedItem animation="fade-up" delay={450}>
            <UpcomingDeadlines actionPlans={actionPlans} isLoading={actionPlansLoading} />
          </AnimatedItem>
        </div>
      </div>

      {/* Top Gaps */}
      {recentGaps.length > 0 && (
        <AnimatedItem animation="fade-up" delay={500}>
          <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-space">Top Gaps de Controles</CardTitle>
              <CardDescription>Controles que precisam de atenção prioritária</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGaps.map((gap, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {gap.status === 'nao_conforme' ? (
                        <XCircle className="w-5 h-5 text-destructive group-hover:scale-110 transition-transform" />
                      ) : (
                        <Clock className="w-5 h-5 text-[hsl(var(--warning))] group-hover:scale-110 transition-transform" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{gap.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{gap.control}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {gap.framework}
                      </Badge>
                      <Badge
                        className={
                          gap.status === 'nao_conforme'
                            ? 'badge-nao-conforme'
                            : 'badge-parcial'
                        }
                      >
                        {gap.status === 'nao_conforme' ? 'Não Conforme' : 'Parcial'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedItem>
      )}
    </div>
  );
}
