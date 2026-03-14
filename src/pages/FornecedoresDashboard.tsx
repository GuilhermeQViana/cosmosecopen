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
  ClipboardCheck,
  Send,
  RotateCcw,
} from 'lucide-react';
import { useVendors, getRiskLevelFromScore } from '@/hooks/useVendors';
import { useVendorRequirements } from '@/hooks/useVendorRequirements';
import { useQualificationCampaigns } from '@/hooks/useQualificationCampaigns';
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
  const { data: allCampaigns = [] } = useQualificationCampaigns({});

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

  // Qualification campaign stats
  const qualStats = {
    total: allCampaigns.length,
    pending: allCampaigns.filter(c => c.status === 'pendente').length,
    inProgress: allCampaigns.filter(c => c.status === 'em_preenchimento').length,
    answered: allCampaigns.filter(c => c.status === 'respondido').length,
    approved: allCampaigns.filter(c => c.status === 'aprovado').length,
    rejected: allCampaigns.filter(c => c.status === 'reprovado').length,
    returned: allCampaigns.filter(c => c.status === 'devolvido').length,
    expired: allCampaigns.filter(c => {
      if (!c.expires_at) return false;
      return new Date(c.expires_at) < new Date() && !['aprovado', 'reprovado', 'respondido'].includes(c.status);
    }).length,
    responseRate: allCampaigns.length > 0
      ? Math.round((allCampaigns.filter(c => ['respondido', 'em_analise', 'aprovado', 'reprovado'].includes(c.status)).length / allCampaigns.length) * 100)
      : 0,
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

      {/* Qualification Metrics */}
      {allCampaigns.length > 0 && (
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Campanhas de Qualificação
            </CardTitle>
            <CardDescription>
              Acompanhamento das campanhas de qualificação de fornecedores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold font-space">{qualStats.total}</p>
                <p className="text-xs text-muted-foreground">Total de campanhas</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold font-space text-amber-500">
                  {qualStats.pending + qualStats.inProgress}
                </p>
                <p className="text-xs text-muted-foreground">Aguardando resposta</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold font-space text-blue-500">{qualStats.answered}</p>
                <p className="text-xs text-muted-foreground">Respondidas (revisar)</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold font-space text-green-500">{qualStats.approved}</p>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold font-space">{qualStats.responseRate}%</p>
                </div>
                <p className="text-xs text-muted-foreground">Taxa de resposta</p>
              </div>
            </div>

            {/* Alerts row */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
              {qualStats.expired > 0 && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {qualStats.expired} expirada{qualStats.expired > 1 ? 's' : ''}
                </Badge>
              )}
              {qualStats.returned > 0 && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  {qualStats.returned} devolvida{qualStats.returned > 1 ? 's' : ''}
                </Badge>
              )}
              {qualStats.rejected > 0 && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  {qualStats.rejected} reprovada{qualStats.rejected > 1 ? 's' : ''}
                </Badge>
              )}
              {qualStats.answered > 0 && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  <Send className="h-3 w-3 mr-1" />
                  {qualStats.answered} pendente{qualStats.answered > 1 ? 's' : ''} de revisão
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pipeline Funnel */}
      <VendorPipelineFunnel />

      {/* New Phase 4 Widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        <VendorIncidentsSummary />
        <VendorSLAComplianceCard />
        <VendorDueDiligenceSummary />
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
