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
  Calendar
} from 'lucide-react';
import { useVendors, getRiskLevelFromScore } from '@/hooks/useVendors';
import { useVendorRequirements } from '@/hooks/useVendorRequirements';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  // Get vendors needing attention
  const vendorsNeedingAttention = vendors.filter((v) => {
    const riskLevel = getRiskLevelFromScore(v.last_assessment?.overall_score ?? null);
    const isHighRisk = riskLevel === 'critico' || riskLevel === 'alto';
    const needsAssessment = !v.last_assessment;
    const contractExpiring = v.contract_end && 
      isBefore(new Date(v.contract_end), addDays(new Date(), 30)) && 
      isAfter(new Date(v.contract_end), new Date());
    return isHighRisk || needsAssessment || contractExpiring;
  }).slice(0, 5);

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
      title: 'Criticidade Alta/Crítica',
      value: stats.critical,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
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
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vendors Needing Attention */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Atenção Necessária
            </CardTitle>
            <CardDescription>
              Fornecedores que requerem ação imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vendorsNeedingAttention.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                <p>Nenhum fornecedor requer atenção no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vendorsNeedingAttention.map((vendor) => {
                  const riskLevel = getRiskLevelFromScore(vendor.last_assessment?.overall_score ?? null);
                  const needsAssessment = !vendor.last_assessment;
                  
                  return (
                    <div
                      key={vendor.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate('/vrm/fornecedores')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-xs text-muted-foreground">{vendor.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {needsAssessment && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                            Sem avaliação
                          </Badge>
                        )}
                        {(riskLevel === 'critico' || riskLevel === 'alto') && (
                          <Badge variant="destructive" className="text-xs">
                            Risco {riskLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

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
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => navigate('/vrm/fornecedores')}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Cadastrar Fornecedor</p>
                  <p className="text-xs text-muted-foreground">Adicionar novo fornecedor ao sistema</p>
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => navigate('/vrm/fornecedores')}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Iniciar Avaliação</p>
                  <p className="text-xs text-muted-foreground">Avaliar conformidade de um fornecedor</p>
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => navigate('/vrm/fornecedores')}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Ver Pendências</p>
                  <p className="text-xs text-muted-foreground">{stats.pendingAssessment} fornecedores sem avaliação</p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Requirements Summary */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Requisitos de Avaliação</CardTitle>
          <CardDescription>
            {requirements.length} requisitos configurados para avaliação de fornecedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Segurança da Informação', 'Cyber Security', 'Privacidade', 'Continuidade'].map((domain, index) => (
              <div key={domain} className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold font-space text-primary">
                  {Math.floor(requirements.length / 4) + (index < requirements.length % 4 ? 1 : 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{domain}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
