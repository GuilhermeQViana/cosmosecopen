import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertTriangle, 
  Zap, 
  Shield, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import { calculateRiskScore, getRiskScoreClassification, RISK_SCORE_THRESHOLDS } from '@/lib/risk-methodology';
import { useBulkCreateRisksFromControls } from '@/hooks/useCreateRiskFromControl';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GenerateRisksFromControlsProps {
  controls: Control[];
  assessments: Assessment[];
}

interface CriticalControlItem {
  control: Control;
  assessment: Assessment;
  riskScore: number;
  classification: ReturnType<typeof getRiskScoreClassification>;
}

export function GenerateRisksFromControls({
  controls,
  assessments,
}: GenerateRisksFromControlsProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedControls, setSelectedControls] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);

  const { mutate: createRisks, isPending } = useBulkCreateRisksFromControls();

  const criticalControls = useMemo(() => {
    const assessmentMap = new Map(assessments.map((a) => [a.control_id, a]));
    
    const items: CriticalControlItem[] = [];
    
    for (const control of controls) {
      const assessment = assessmentMap.get(control.id);
      if (!assessment) continue;
      
      const currentMaturity = parseInt(assessment.maturity_level);
      const targetMaturity = parseInt(assessment.target_maturity);
      const weight = control.weight || 1;
      
      const riskScore = calculateRiskScore(currentMaturity, targetMaturity, weight);
      
      // Include controls with High or Critical risk score
      if (riskScore >= RISK_SCORE_THRESHOLDS.HIGH.min) {
        const classification = getRiskScoreClassification(riskScore);
        items.push({ control, assessment, riskScore, classification });
      }
    }
    
    // Sort by risk score descending
    return items.sort((a, b) => b.riskScore - a.riskScore);
  }, [controls, assessments]);

  const criticalCount = criticalControls.filter(
    c => c.riskScore >= RISK_SCORE_THRESHOLDS.CRITICAL.min
  ).length;
  
  const highCount = criticalControls.filter(
    c => c.riskScore >= RISK_SCORE_THRESHOLDS.HIGH.min && 
         c.riskScore < RISK_SCORE_THRESHOLDS.CRITICAL.min
  ).length;

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Pre-select critical controls
      const criticalIds = criticalControls
        .filter(c => c.riskScore >= RISK_SCORE_THRESHOLDS.CRITICAL.min)
        .map(c => c.control.id);
      setSelectedControls(new Set(criticalIds));
      setResult(null);
    }
  };

  const toggleControl = (controlId: string) => {
    setSelectedControls(prev => {
      const next = new Set(prev);
      if (next.has(controlId)) {
        next.delete(controlId);
      } else {
        next.add(controlId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedControls(new Set(criticalControls.map(c => c.control.id)));
  };

  const selectNone = () => {
    setSelectedControls(new Set());
  };

  const handleGenerate = () => {
    const items = criticalControls
      .filter(c => selectedControls.has(c.control.id))
      .map(c => ({ control: c.control, assessment: c.assessment }));

    if (items.length === 0) {
      toast.error('Selecione pelo menos um controle');
      return;
    }

    createRisks(
      { items },
      {
        onSuccess: (data) => {
          if (typeof data === 'object' && 'created' in data) {
            setResult({ created: data.created, skipped: data.skipped });
            if (data.created > 0) {
              toast.success(`${data.created} risco(s) criado(s) com sucesso`);
            }
            if (data.skipped > 0) {
              toast.info(`${data.skipped} controle(s) já possuíam riscos vinculados`);
            }
          }
        },
        onError: (error) => {
          toast.error('Erro ao criar riscos');
          console.error(error);
        },
      }
    );
  };

  const handleViewRisks = () => {
    setOpen(false);
    navigate('/riscos');
  };

  if (criticalControls.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            'gap-2',
            criticalCount > 0 && 'border-destructive/50 text-destructive hover:bg-destructive/10'
          )}
        >
          <Shield className="w-4 h-4" />
          Gerar Riscos
          {criticalCount > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 px-1.5">
              {criticalCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            Gerar Riscos a partir de Controles Críticos
          </DialogTitle>
          <DialogDescription>
            Selecione os controles que devem gerar riscos automaticamente no módulo de Riscos.
            Os riscos serão criados com base no Risk Score calculado.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="py-8 text-center space-y-4">
            <div className={cn(
              'mx-auto w-16 h-16 rounded-full flex items-center justify-center',
              result.created > 0 ? 'bg-green-500/20' : 'bg-muted'
            )}>
              {result.created > 0 ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium">
                {result.created > 0 
                  ? `${result.created} risco(s) criado(s) com sucesso!`
                  : 'Nenhum risco foi criado'
                }
              </p>
              {result.skipped > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {result.skipped} controle(s) já possuíam riscos vinculados
                </p>
              )}
            </div>
            <Button onClick={handleViewRisks} className="gap-2">
              Ver Riscos
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-destructive" />
                  {criticalCount} crítico(s)
                </span>
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  {highCount} alto(s)
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Selecionar todos
                </Button>
                <Button variant="ghost" size="sm" onClick={selectNone}>
                  Limpar
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[350px] border rounded-lg">
              <div className="p-2 space-y-1">
                {criticalControls.map(({ control, riskScore, classification }) => {
                  const isCritical = riskScore >= RISK_SCORE_THRESHOLDS.CRITICAL.min;
                  const isSelected = selectedControls.has(control.id);

                  return (
                    <div
                      key={control.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                        isSelected 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'hover:bg-muted border border-transparent'
                      )}
                      onClick={() => toggleControl(control.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleControl(control.id)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{control.code}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  isCritical 
                                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                                    : 'bg-orange-500/10 text-orange-600 border-orange-500/30'
                                )}
                              >
                                {isCritical && <Zap className="w-3 h-3 mr-1" />}
                                Score {riskScore}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{classification.label}: {classification.action}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {control.name}
                        </p>
                      </div>

                      <Badge variant="secondary" className="text-xs shrink-0">
                        {control.category || 'Sem categoria'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleGenerate} 
                disabled={isPending || selectedControls.size === 0}
                className="gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Gerar {selectedControls.size} Risco(s)
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
