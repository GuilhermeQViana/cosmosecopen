import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  ShieldAlert,
  FileText,
  TrendingUp,
  Calendar,
  Settings,
} from 'lucide-react';
import { useVendors, getRiskLevelFromScore } from '@/hooks/useVendors';
import { useVendorRequirements } from '@/hooks/useVendorRequirements';
import { addDays, isBefore, isAfter } from 'date-fns';
import { VendorComplianceRadar } from '@/components/fornecedores/VendorComplianceRadar';
import { VendorRiskHeatMap } from '@/components/fornecedores/VendorRiskHeatMap';
import { VendorTrendChart } from '@/components/fornecedores/VendorTrendChart';
import { VendorAlerts } from '@/components/fornecedores/VendorAlerts';
import { VendorComparison } from '@/components/fornecedores/VendorComparison';
import { VendorPipelineFunnel } from '@/components/fornecedores/VendorPipelineFunnel';
import { VendorIncidentsSummary } from '@/components/fornecedores/VendorIncidentsSummary';
import { VendorSLAComplianceCard } from '@/components/fornecedores/VendorSLAComplianceCard';
import { VendorDueDiligenceSummary } from '@/components/fornecedores/VendorDueDiligenceSummary';

export default function FornecedoresDashboard() {
  const navigate = useNavigate();
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: requirements = [] } = useVendorRequirements();

  // Calculate stats
  const stats = {
    total: vendors.length,
    active: vendors.filter((v) => v.status === 'ativo').length,
    critical: vendors.filter((v) => v.criticality === 'critica').length,
    highRisk: vendors.filter((v) => {
      const level = getRiskLevelFromScore(v.last_assessment?.overall_score ?? null);
      return level === 'critico' || level === 'alto';
    }).length,
    pendingAssessment: vendors.filter((v) => !v.last_assessment).length,
    expiringContracts: vendors.filter((v) => {
      if (!v.contract_end) return false;
      const endDate = new Date(v.contract_end);
      const thirtyDaysFromNow = addDays(new Date(), 30);
      return isBefore(endDate, thirtyDaysFromNow) && isAfter(endDate, new Date());
    }).length,
  };

  // Calculate average score
  const vendorsWithScore = vendors.filter(v => v.last_assessment?.overall_score !== null);
  const averageScore = vendorsWithScore.length > 0
    ? Math.round(vendorsWithScore.reduce((sum, v) => sum + (v.last_assessment?.overall_score ?? 0), 0) / vendorsWithScore.length)
    : 0;

  const statCards = [
    {
      title: 'Total de Fornecedores',
      value: stats.total,
      icon: Building,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Fornecedores Ativos',
      value: stats.active,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Score Médio',
      value: `${averageScore}%`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Risco Alto/Crítico',
      value: stats.highRisk,
      icon: ShieldAlert,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Sem Avaliação',
      value: stats.pendingAssessment,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Contratos Vencendo',
      value: stats.expiringContracts,
      icon: Calendar,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-space">
            Dashboard VRM
          </h1>
          <p className="text-muted-foreground">
            Visão geral da gestão de riscos de fornecedores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/vrm/requisitos')}>
            <Settings className="w-4 h-4 mr-2" />
            Requisitos
          </Button>
          <Button onClick={() => navigate('/vrm/fornecedores')} variant="outline">
            Ver Fornecedores
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button onClick={() => navigate('/vrm/fornecedores')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-space">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <VendorComplianceRadar showAllVendors />
        <VendorRiskHeatMap />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <VendorTrendChart />
        <VendorAlerts />
      </div>

      {/* Comparison Chart */}
      <VendorComparison />

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Principais atividades do módulo VRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => navigate('/vrm/fornecedores')}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Cadastrar Fornecedor</p>
                  <p className="text-xs text-muted-foreground">Adicionar novo fornecedor</p>
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => navigate('/vrm/fornecedores')}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Iniciar Avaliação</p>
                  <p className="text-xs text-muted-foreground">Avaliar conformidade</p>
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => navigate('/vrm/requisitos')}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Settings className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Gerenciar Requisitos</p>
                  <p className="text-xs text-muted-foreground">{requirements.length} requisitos ativos</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
