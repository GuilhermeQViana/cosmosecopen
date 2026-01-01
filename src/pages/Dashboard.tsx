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
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { useMemo } from 'react';

export default function Dashboard() {
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();
  
  // Fetch real data from database
  const { data: controls = [] } = useControls();
  const { data: assessments = [] } = useAssessments();
  const { data: risks = [] } = useRisks();
  const { data: evidences = [] } = useEvidences();
  const { data: actionPlans = [] } = useActionPlans();

  // Calculate real metrics
  const metrics = useMemo(() => {
    const totalControls = controls.length;
    const assessedControls = assessments.length;
    const conformeCount = assessments.filter(a => a.status === 'conforme').length;
    const conformanceScore = assessedControls > 0 ? Math.round((conformeCount / assessedControls) * 100) : 0;
    
    const criticalRisks = risks.filter(r => (r.inherent_probability * r.inherent_impact) >= 20).length;
    const pendingActions = actionPlans.filter(a => a.status !== 'done').length;

    return [
      {
        title: 'Score de Conformidade',
        value: `${conformanceScore}%`,
        description: `${conformeCount} de ${assessedControls} controles conformes`,
        icon: Shield,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
      },
      {
        title: 'Riscos Críticos',
        value: criticalRisks.toString(),
        description: `de ${risks.length} riscos totais`,
        icon: AlertTriangle,
        color: 'text-[hsl(var(--risk-critical))]',
        bgColor: 'bg-[hsl(var(--risk-critical))]/10',
      },
      {
        title: 'Evidências',
        value: evidences.length.toString(),
        description: 'evidências cadastradas',
        icon: FileCheck,
        color: 'text-[hsl(var(--success))]',
        bgColor: 'bg-[hsl(var(--success))]/10',
      },
      {
        title: 'Ações Pendentes',
        value: pendingActions.toString(),
        description: `de ${actionPlans.length} planos totais`,
        icon: ListTodo,
        color: 'text-[hsl(var(--warning))]',
        bgColor: 'bg-[hsl(var(--warning))]/10',
      },
    ];
  }, [controls, assessments, risks, evidences, actionPlans]);

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão geral de conformidade da {organization?.name || 'organização'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentFramework && (
            <Badge variant="outline" className="text-sm px-3 py-1.5">
              {currentFramework.name}
            </Badge>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            Atualizado agora
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="card-metric">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{metric.value}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold">{kpi.value}</span>
              <span className="text-sm text-muted-foreground">/ {kpi.total}</span>
            </div>
            <Progress value={kpi.percent} className="h-1.5" />
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <MaturityTrendChart assessments={assessments} frameworkName={currentFramework?.name} />

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ComplianceRadarChart controls={controls} assessments={assessments} />
        <RiskDistributionChart risks={risks} />
        <ActionPlanStatusChart actionPlans={actionPlans} />
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ControlsMaturityChart assessments={assessments} />
        <div className="grid grid-rows-2 gap-4">
          <RecentActivity />
          <UpcomingDeadlines actionPlans={actionPlans} />
        </div>
      </div>

      {/* Top Gaps */}
      {recentGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Gaps de Controles</CardTitle>
            <CardDescription>Controles que precisam de atenção prioritária</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGaps.map((gap, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {gap.status === 'nao_conforme' ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <Clock className="w-5 h-5 text-[hsl(var(--warning))]" />
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
      )}
    </div>
  );
}
