import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  AlertTriangle,
  FileCheck,
  ListTodo,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
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

export default function Dashboard() {
  const { organization } = useOrganization();

  const metrics = [
    {
      title: 'Score de Conformidade',
      value: '72%',
      change: '+5%',
      trend: 'up',
      description: 'vs. mês anterior',
      icon: Shield,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Riscos Críticos',
      value: '3',
      change: '-2',
      trend: 'down',
      description: 'redução este mês',
      icon: AlertTriangle,
      color: 'text-[hsl(var(--risk-critical))]',
      bgColor: 'bg-[hsl(var(--risk-critical))]/10',
    },
    {
      title: 'Evidências',
      value: '48',
      change: '+12',
      trend: 'up',
      description: 'novas este mês',
      icon: FileCheck,
      color: 'text-[hsl(var(--success))]',
      bgColor: 'bg-[hsl(var(--success))]/10',
    },
    {
      title: 'Ações Pendentes',
      value: '15',
      change: '-3',
      trend: 'down',
      description: 'fechadas esta semana',
      icon: ListTodo,
      color: 'text-[hsl(var(--warning))]',
      bgColor: 'bg-[hsl(var(--warning))]/10',
    },
  ];

  const kpis = [
    { label: 'Controles Avaliados', value: '217', total: '217', percent: 100 },
    { label: 'Controles Conformes', value: '142', total: '217', percent: 65 },
    { label: 'Gaps Identificados', value: '75', total: '217', percent: 35 },
    { label: 'Planos em Andamento', value: '23', total: '50', percent: 46 },
  ];

  const recentGaps = [
    { control: 'GV.OC-01', name: 'Contexto organizacional documentado', status: 'nao_conforme', framework: 'NIST' },
    { control: 'A.5.1', name: 'Políticas de segurança da informação', status: 'parcial', framework: 'ISO' },
    { control: 'Art. 3º', name: 'Política de segurança cibernética', status: 'parcial', framework: 'BCB' },
    { control: 'GV.RM-02', name: 'Estratégia de gestão de riscos', status: 'nao_conforme', framework: 'NIST' },
    { control: 'A.8.3', name: 'Restrição de acesso à informação', status: 'parcial', framework: 'ISO' },
  ];

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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          Atualizado há 5 minutos
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
                <span
                  className={`text-sm flex items-center gap-1 ${
                    metric.trend === 'up' && metric.title !== 'Riscos Críticos'
                      ? 'text-[hsl(var(--success))]'
                      : metric.trend === 'down' && metric.title === 'Riscos Críticos'
                      ? 'text-[hsl(var(--success))]'
                      : metric.trend === 'down'
                      ? 'text-[hsl(var(--success))]'
                      : 'text-destructive'
                  }`}
                >
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {metric.change}
                </span>
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
      <MaturityTrendChart />

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ComplianceRadarChart />
        <RiskDistributionChart />
        <ActionPlanStatusChart />
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ControlsMaturityChart />
        <div className="grid grid-rows-2 gap-4">
          <RecentActivity />
          <UpcomingDeadlines />
        </div>
      </div>

      {/* Conformity by Framework */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { name: 'NIST CSF 2.0', value: 68, controls: 75, color: 'bg-[hsl(var(--chart-1))]' },
          { name: 'ISO 27001:2022', value: 75, controls: 93, color: 'bg-[hsl(var(--chart-2))]' },
          { name: 'BCB/CMN 4.893', value: 71, controls: 49, color: 'bg-[hsl(var(--chart-3))]' },
        ].map((fw) => (
          <Card key={fw.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{fw.name}</CardTitle>
                <Badge variant="outline">{fw.controls} controles</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conformidade</span>
                  <span className="font-bold text-lg">{fw.value}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${fw.color} transition-all duration-500`}
                    style={{ width: `${fw.value}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Meta: 85%</span>
                  <span>Gap: {85 - fw.value}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Gaps */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Gaps de Controles</CardTitle>
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
    </div>
  );
}
