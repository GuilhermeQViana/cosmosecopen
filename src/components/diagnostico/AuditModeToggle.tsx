import { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import { MATURITY_LEVELS, calculateRiskScore, getRiskScoreClassification } from '@/lib/risk-methodology';
import {
  Eye,
  Download,
  FileSpreadsheet,
  Printer,
  Shield,
  Calendar,
  User,
  Building2,
  Loader2,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AuditModeToggleProps {
  controls: Control[];
  assessments: Assessment[];
  isAuditMode: boolean;
  onToggleAuditMode: (enabled: boolean) => void;
}

const STATUS_ICONS = {
  conforme: CheckCircle2,
  parcial: MinusCircle,
  nao_conforme: XCircle,
  nao_aplicavel: MinusCircle,
};

const STATUS_COLORS = {
  conforme: 'text-green-500',
  parcial: 'text-yellow-500',
  nao_conforme: 'text-red-500',
  nao_aplicavel: 'text-muted-foreground',
};

export function AuditModeToggle({
  controls,
  assessments,
  isAuditMode,
  onToggleAuditMode,
}: AuditModeToggleProps) {
  const { organization } = useOrganization();
  const { currentFramework } = useFrameworkContext();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const assessmentMap = new Map(assessments.map(a => [a.control_id, a]));

  // Calculate summary stats
  const stats = {
    total: controls.length,
    conforme: assessments.filter(a => a.status === 'conforme').length,
    parcial: assessments.filter(a => a.status === 'parcial').length,
    naoConforme: assessments.filter(a => a.status === 'nao_conforme').length,
    pending: controls.length - assessments.length,
    averageMaturity: assessments.length > 0
      ? (assessments.reduce((sum, a) => sum + parseInt(a.maturity_level), 0) / assessments.length).toFixed(1)
      : '0.0',
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const headers = [
        'Código',
        'Nome',
        'Categoria',
        'Status',
        'Maturidade Atual',
        'Maturidade Alvo',
        'Risk Score',
        'Peso',
        'Observações',
        'Avaliado em',
      ];

      const rows = controls.map(control => {
        const assessment = assessmentMap.get(control.id);
        const maturity = assessment ? parseInt(assessment.maturity_level) : 0;
        const target = assessment ? parseInt(assessment.target_maturity) : 3;
        const riskScore = calculateRiskScore(maturity, target, control.weight || 1);

        return [
          control.code,
          control.name,
          control.category || '',
          assessment?.status || 'Pendente',
          maturity.toString(),
          target.toString(),
          riskScore.toString(),
          (control.weight || 1).toString(),
          assessment?.observations?.replace(/"/g, '""') || '',
          assessment?.assessed_at ? format(new Date(assessment.assessed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '',
        ];
      });

      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';')),
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagnostico_${currentFramework?.code || 'framework'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Preparando impressão...');
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {/* Audit Mode Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="audit-mode"
            checked={isAuditMode}
            onCheckedChange={onToggleAuditMode}
          />
          <Label htmlFor="audit-mode" className="text-sm cursor-pointer flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            Modo Auditoria
          </Label>
        </div>

        {/* View Report Button */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Relatório</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ver relatório de auditoria</TooltipContent>
            </Tooltip>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Relatório de Auditoria
              </SheetTitle>
              <SheetDescription>
                Visão consolidada do diagnóstico de controles
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
              <div className="space-y-6">
                {/* Header Info */}
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Organização:</span>
                      <span className="text-muted-foreground">{organization?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Framework:</span>
                      <span className="text-muted-foreground">
                        {currentFramework?.name}
                        {currentFramework?.version && ` v${currentFramework.version}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Data:</span>
                      <span className="text-muted-foreground">
                        {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.conforme}</div>
                      <div className="text-xs text-muted-foreground">Conformes</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-500/5 border-yellow-500/20">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">{stats.parcial}</div>
                      <div className="text-xs text-muted-foreground">Parciais</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-500/5 border-red-500/20">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.naoConforme}</div>
                      <div className="text-xs text-muted-foreground">Não Conformes</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-muted-foreground">{stats.pending}</div>
                      <div className="text-xs text-muted-foreground">Pendentes</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Average Maturity */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Maturidade Média</span>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {stats.averageMaturity} / 5
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Control Details List */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Detalhamento por Controle</h4>
                  {controls.map(control => {
                    const assessment = assessmentMap.get(control.id);
                    const status = assessment?.status || 'nao_conforme';
                    const StatusIcon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || MinusCircle;
                    const maturity = assessment ? parseInt(assessment.maturity_level) : 0;
                    const maturityLabel = MATURITY_LEVELS[maturity as keyof typeof MATURITY_LEVELS]?.label || 'N/A';

                    return (
                      <div
                        key={control.id}
                        className="flex items-center justify-between p-2 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-2">
                          <StatusIcon className={cn('w-4 h-4', STATUS_COLORS[status as keyof typeof STATUS_COLORS])} />
                          <code className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {control.code}
                          </code>
                          <span className="text-sm truncate max-w-[180px]">{control.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {maturityLabel}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>

            {/* Export Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" className="flex-1 gap-2" onClick={handleExportCSV} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                Exportar CSV
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Audit Mode Banner */}
      {isAuditMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <Badge variant="secondary" className="px-4 py-2 shadow-lg bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Eye className="w-4 h-4 mr-2" />
            Modo Auditoria Ativo - Somente Leitura
          </Badge>
        </div>
      )}
    </>
  );
}
