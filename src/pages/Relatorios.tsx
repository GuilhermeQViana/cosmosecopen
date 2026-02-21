import { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useFrameworks } from '@/hooks/useFrameworks';
import { useControls } from '@/hooks/useControls';
import { useRisks } from '@/hooks/useRisks';
import { useActionPlans } from '@/hooks/useActionPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Calendar,
  Shield,
  AlertTriangle,
  FileCheck,
  ListTodo,
  Printer,
  FileSpreadsheet,
  File,
  TrendingUp,
  BarChart3,
  Loader2,
  Clock,
  XCircle,
} from 'lucide-react';

const reportTypes = [
  {
    id: 'compliance',
    title: 'Relatório de Conformidade',
    description: 'Visão geral do status de conformidade por framework',
    icon: Shield,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'risks',
    title: 'Relatório de Riscos',
    description: 'Análise completa dos riscos identificados',
    icon: AlertTriangle,
    color: 'text-[hsl(var(--risk-high))]',
    bgColor: 'bg-[hsl(var(--risk-high))]/10',
  },
  {
    id: 'evidence',
    title: 'Relatório de Evidências',
    description: 'Inventário de evidências por controle',
    icon: FileCheck,
    color: 'text-[hsl(var(--success))]',
    bgColor: 'bg-[hsl(var(--success))]/10',
  },
  {
    id: 'actions',
    title: 'Relatório de Planos de Ação',
    description: 'Status e progresso dos planos de ação',
    icon: ListTodo,
    color: 'text-[hsl(var(--warning))]',
    bgColor: 'bg-[hsl(var(--warning))]/10',
  },
  {
    id: 'executive',
    title: 'Relatório Executivo',
    description: 'Resumo executivo para alta gestão',
    icon: BarChart3,
    color: 'text-[hsl(var(--chart-5))]',
    bgColor: 'bg-[hsl(var(--chart-5))]/10',
  },
  {
    id: 'gap',
    title: 'Relatório de Gap Analysis',
    description: 'Análise detalhada de gaps por framework',
    icon: TrendingUp,
    color: 'text-[hsl(var(--chart-6))]',
    bgColor: 'bg-[hsl(var(--chart-6))]/10',
  },
];

export default function Relatorios() {
  const { organization } = useOrganization();
  const { data: frameworks = [] } = useFrameworks();
  const { data: controls = [] } = useControls();
  const { data: risks = [] } = useRisks();
  const { data: actionPlans = [] } = useActionPlans();
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerateReport = async (reportId: string) => {
    if (!organization?.id) {
      toast.error('Organização não encontrada');
      return;
    }

    setGenerating(reportId);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          type: reportId,
          organizationId: organization.id,
          frameworkId: selectedFramework !== 'all' ? selectedFramework : undefined,
          period: selectedPeriod,
        },
      });

      if (error) throw error;

      // Create HTML blob and trigger download
      const blob = new Blob([data.html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${reportId}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Relatório gerado com sucesso!', {
        description: 'O download foi iniciado. Abra o arquivo HTML no navegador para visualizar ou imprimir como PDF.',
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório', {
        description: error.message,
      });
    } finally {
      setGenerating(null);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.info('Enviando para impressão...');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere e exporte relatórios de conformidade da {organization?.name || 'organização'}
          </p>
        </div>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Página
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Framework:</span>
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Frameworks</SelectItem>
                  {frameworks.map((fw) => (
                    <SelectItem key={fw.id} value={fw.id}>{fw.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Período:</span>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Mês Atual</SelectItem>
                  <SelectItem value="quarter">Trimestre Atual</SelectItem>
                  <SelectItem value="year">Ano Atual</SelectItem>
                  <SelectItem value="all">Todo o Período</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Gerar Relatórios</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="preview">Prévia</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${report.bgColor}`}>
                      <report.icon className={`h-5 w-5 ${report.color}`} />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleGenerateReport(report.id)}
                        disabled={generating === report.id}
                      >
                        <File className="h-4 w-4 text-[hsl(var(--risk-critical))]" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleGenerateReport(report.id)}
                        disabled={generating === report.id}
                      >
                        <FileSpreadsheet className="h-4 w-4 text-[hsl(var(--success))]" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription className="text-xs">{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generating === report.id}
                  >
                    {generating === report.id ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Gerar Relatório
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Gerados</CardTitle>
              <CardDescription>Histórico de relatórios exportados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="font-medium text-muted-foreground">Nenhum relatório gerado ainda</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Use a aba "Gerar Relatórios" para criar seu primeiro relatório.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <ReportPreview
            organization={organization}
            controls={controls}
            risks={risks}
            actionPlans={actionPlans}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportPreview({ organization, controls, risks, actionPlans }: {
  organization: any;
  controls: any[];
  risks: any[];
  actionPlans: any[];
}) {
  const totalControls = controls.length;
  const conformeCount = controls.filter(c => c.status === 'conforme' || c.status === 'parcialmente_conforme').length;
  const score = totalControls > 0 ? Math.round((conformeCount / totalControls) * 100) : 0;

  const criticalRisks = risks.filter(r => (r.inherent_probability * r.inherent_impact) >= 20);
  const highRisks = risks.filter(r => {
    const level = r.inherent_probability * r.inherent_impact;
    return level >= 12 && level < 20;
  });

  const pendingActions = actionPlans.filter(a => a.status !== 'done');
  const inProgressActions = actionPlans.filter(a => a.status === 'in_progress');

  const getRiskLevelLabel = (r: any) => {
    const level = r.inherent_probability * r.inherent_impact;
    if (level >= 20) return 'Crítico';
    if (level >= 12) return 'Alto';
    if (level >= 6) return 'Médio';
    return 'Baixo';
  };

  const now = new Date();
  const monthYear = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Card className="print:shadow-none">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Relatório de Conformidade</CardTitle>
            <CardDescription>
              {organization?.name} • {monthYear}
            </CardDescription>
          </div>
          <Badge>Prévia</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Executive Summary */}
        <div>
          <h3 className="font-semibold mb-3">Resumo Executivo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{score}%</p>
              <p className="text-xs text-muted-foreground">Score Geral</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-[hsl(var(--success))]">{totalControls}</p>
              <p className="text-xs text-muted-foreground">Controles</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-[hsl(var(--warning))]">{risks.length}</p>
              <p className="text-xs text-muted-foreground">Riscos</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-destructive">{pendingActions.length}</p>
              <p className="text-xs text-muted-foreground">Ações Pendentes</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Top Risks */}
        <div>
          <h3 className="font-semibold mb-3">Principais Riscos</h3>
          {risks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum risco cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {risks.slice(0, 5).map((risk) => (
                <div key={risk.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-sm">{risk.title}</span>
                  <div className="flex gap-2">
                    <Badge className={
                      getRiskLevelLabel(risk) === 'Crítico' ? 'badge-risk-critical' :
                      getRiskLevelLabel(risk) === 'Alto' ? 'badge-risk-high' : 'badge-risk-medium'
                    }>
                      {getRiskLevelLabel(risk)}
                    </Badge>
                    <Badge variant="outline">{risk.treatment === 'mitigar' ? 'Em tratamento' : risk.treatment}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Action Items */}
        <div>
          <h3 className="font-semibold mb-3">Planos de Ação Prioritários</h3>
          {actionPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum plano de ação cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {actionPlans.slice(0, 5).map((action) => (
                <div key={action.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    {action.status === 'in_progress' ? (
                      <Clock className="h-4 w-4 text-[hsl(var(--warning))]" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">{action.title}</span>
                  </div>
                  {action.due_date && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(action.due_date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
