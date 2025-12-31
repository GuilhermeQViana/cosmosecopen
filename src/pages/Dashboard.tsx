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
} from 'lucide-react';

export default function Dashboard() {
  const { organization } = useOrganization();

  const metrics = [
    {
      title: 'Score de Conformidade',
      value: '72%',
      change: '+5%',
      trend: 'up',
      icon: Shield,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Riscos Críticos',
      value: '3',
      change: '-2',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-risk-critical',
      bgColor: 'bg-risk-critical/10',
    },
    {
      title: 'Evidências',
      value: '48',
      change: '+12',
      trend: 'up',
      icon: FileCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Ações Pendentes',
      value: '15',
      change: '-3',
      trend: 'down',
      icon: ListTodo,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral de conformidade da {organization?.name || 'organização'}
        </p>
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
                    metric.trend === 'up' ? 'text-success' : 'text-destructive'
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conformity by Framework */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { name: 'NIST CSF 2.0', value: 68, color: 'bg-chart-1' },
          { name: 'ISO 27001:2022', value: 75, color: 'bg-chart-2' },
          { name: 'BCB/CMN 4.893', value: 71, color: 'bg-chart-3' },
        ].map((fw) => (
          <Card key={fw.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{fw.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conformidade</span>
                  <span className="font-medium">{fw.value}%</span>
                </div>
                <Progress value={fw.value} className="h-2" />
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
                    <Clock className="w-5 h-5 text-warning" />
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