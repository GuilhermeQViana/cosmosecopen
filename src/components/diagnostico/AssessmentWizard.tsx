import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MaturitySlider } from './MaturitySlider';
import { RiskScoreBadge } from './RiskScoreBadge';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import { MATURITY_LEVELS, getControlWeightInfo } from '@/lib/risk-methodology';
import {
  Wand2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  Info,
  Scale,
  Target,
  Lightbulb,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type MaturityLevel = Database['public']['Enums']['maturity_level'];

interface AssessmentWizardProps {
  controls: Control[];
  assessments: Assessment[];
  onSave: (data: {
    controlId: string;
    maturityLevel: MaturityLevel;
    observations?: string;
  }) => Promise<void>;
  onComplete?: () => void;
}

interface WizardState {
  currentIndex: number;
  maturityLevel: number;
  observations: string;
  skipped: Set<string>;
  completed: Set<string>;
}

export function AssessmentWizard({
  controls,
  assessments,
  onSave,
  onComplete,
}: AssessmentWizardProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [state, setState] = useState<WizardState>({
    currentIndex: 0,
    maturityLevel: 0,
    observations: '',
    skipped: new Set(),
    completed: new Set(),
  });

  // Get pending controls (not yet assessed)
  const pendingControls = useMemo(() => {
    const assessedIds = new Set(assessments.map(a => a.control_id));
    return controls.filter(c => !assessedIds.has(c.id) && !state.completed.has(c.id));
  }, [controls, assessments, state.completed]);

  const currentControl = pendingControls[state.currentIndex];
  const progress = state.completed.size / (pendingControls.length + state.completed.size) * 100;

  // Reset wizard state when opening
  useEffect(() => {
    if (open) {
      setState({
        currentIndex: 0,
        maturityLevel: 0,
        observations: '',
        skipped: new Set(),
        completed: new Set(),
      });
    }
  }, [open]);

  // Load current control data
  useEffect(() => {
    if (currentControl) {
      const existingAssessment = assessments.find(a => a.control_id === currentControl.id);
      setState(prev => ({
        ...prev,
        maturityLevel: existingAssessment ? parseInt(existingAssessment.maturity_level) : 0,
        observations: existingAssessment?.observations || '',
      }));
    }
  }, [currentControl, assessments]);

  const handleSave = useCallback(async () => {
    if (!currentControl) return;

    setIsSaving(true);
    try {
      await onSave({
        controlId: currentControl.id,
        maturityLevel: state.maturityLevel.toString() as MaturityLevel,
        observations: state.observations || undefined,
      });

      setState(prev => {
        const newCompleted = new Set(prev.completed);
        newCompleted.add(currentControl.id);

        // Check if wizard is complete
        const remainingPending = pendingControls.length - 1;
        if (remainingPending === 0) {
          setTimeout(() => {
            setOpen(false);
            onComplete?.();
          }, 500);
        }

        return {
          ...prev,
          completed: newCompleted,
          currentIndex: Math.min(prev.currentIndex, remainingPending - 1),
          maturityLevel: 0,
          observations: '',
        };
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentControl, state.maturityLevel, state.observations, onSave, pendingControls.length, onComplete]);

  const handleSkip = useCallback(() => {
    if (!currentControl) return;

    setState(prev => {
      const newSkipped = new Set(prev.skipped);
      newSkipped.add(currentControl.id);
      return {
        ...prev,
        skipped: newSkipped,
        currentIndex: Math.min(prev.currentIndex + 1, pendingControls.length - 1),
        maturityLevel: 0,
        observations: '',
      };
    });
  }, [currentControl, pendingControls.length]);

  const handleNext = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, pendingControls.length - 1),
      maturityLevel: 0,
      observations: '',
    }));
  }, [pendingControls.length]);

  const handlePrevious = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
      maturityLevel: 0,
      observations: '',
    }));
  }, []);

  const targetMaturity = 3; // Default target
  const maturityInfo = currentControl
    ? MATURITY_LEVELS[state.maturityLevel as keyof typeof MATURITY_LEVELS]
    : null;
  const weightInfo = currentControl ? getControlWeightInfo(currentControl.weight || 1) : null;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            disabled={pendingControls.length === 0}
            className="gap-2"
          >
            <Wand2 className="w-4 h-4" />
            Wizard
            {pendingControls.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingControls.length}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {pendingControls.length === 0
            ? 'Todos os controles foram avaliados'
            : `Iniciar avaliação guiada de ${pendingControls.length} controles pendentes`}
        </TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Avaliação Guiada
            </DialogTitle>
            <DialogDescription>
              Avalie os controles passo a passo de forma guiada
            </DialogDescription>
          </DialogHeader>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progresso: {state.completed.size} de {pendingControls.length + state.completed.size} controles
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {pendingControls.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">Avaliação Completa!</h3>
              <p className="text-muted-foreground text-center mt-2">
                Todos os controles foram avaliados com sucesso.
              </p>
              <Button onClick={() => setOpen(false)} className="mt-4">
                Fechar
              </Button>
            </div>
          ) : currentControl ? (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {/* Control Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                            {currentControl.code}
                          </code>
                          {(currentControl.weight || 1) > 1 && weightInfo && (
                            <Badge variant="outline" className={cn('text-xs', weightInfo.color)}>
                              <Scale className="w-3 h-3 mr-1" />
                              Peso {currentControl.weight}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base">{currentControl.name}</CardTitle>
                      </div>
                      <Badge variant="secondary">
                        {state.currentIndex + 1} / {pendingControls.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentControl.description && (
                      <p className="text-sm text-muted-foreground">{currentControl.description}</p>
                    )}

                    {/* Implementation Example */}
                    {currentControl.implementation_example && (
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                          <Lightbulb className="w-4 h-4" />
                          Exemplo de Implementação
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {currentControl.implementation_example}
                        </p>
                      </div>
                    )}

                    {/* Evidence Example */}
                    {currentControl.evidence_example && (
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                          <Target className="w-4 h-4" />
                          Evidência Esperada
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {currentControl.evidence_example}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Maturity Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Nível de Maturidade</h4>
                    <RiskScoreBadge
                      maturityLevel={state.maturityLevel}
                      targetMaturity={targetMaturity}
                      weight={currentControl.weight || 1}
                    />
                  </div>

                  <MaturitySlider
                    value={state.maturityLevel}
                    target={targetMaturity}
                    onChange={(v) => setState(prev => ({ ...prev, maturityLevel: v }))}
                    showLabels
                    showEvidence
                  />

                  {maturityInfo && (
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Info className="w-4 h-4" />
                        {maturityInfo.label}
                      </div>
                      <p className="text-xs text-muted-foreground">{maturityInfo.description}</p>
                    </div>
                  )}
                </div>

                {/* Observations */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações (opcional)</label>
                  <Textarea
                    value={state.observations}
                    onChange={(e) => setState(prev => ({ ...prev, observations: e.target.value }))}
                    placeholder="Adicione observações sobre a avaliação..."
                    rows={3}
                  />
                </div>
              </div>
            </ScrollArea>
          ) : null}

          {/* Navigation */}
          {pendingControls.length > 0 && currentControl && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={state.currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  <SkipForward className="w-4 h-4 mr-1" />
                  Pular
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  <X className="w-4 h-4 mr-1" />
                  Fechar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : state.currentIndex < pendingControls.length - 1 ? (
                    <>
                      Salvar e Próximo
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Finalizar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
