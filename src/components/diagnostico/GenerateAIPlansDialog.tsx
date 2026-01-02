import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useGenerateActionPlans } from '@/hooks/useGenerateActionPlans';
import { toast } from 'sonner';

interface ControlForGeneration {
  controlId: string;
  assessmentId: string;
  controlCode: string;
  controlName: string;
  controlDescription: string | null;
  currentMaturity: number;
  targetMaturity: number;
}

interface GenerateAIPlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  controls: ControlForGeneration[];
}

type DialogState = 'confirm' | 'generating' | 'complete';

export function GenerateAIPlansDialog({
  open,
  onOpenChange,
  controls,
}: GenerateAIPlansDialogProps) {
  const [state, setState] = useState<DialogState>('confirm');
  const [result, setResult] = useState<{
    successCount: number;
    failedControls: Array<{ controlCode: string; error: string }>;
  } | null>(null);

  const { generateAsync, isGenerating, progress, reset } = useGenerateActionPlans();

  useEffect(() => {
    if (open) {
      setState('confirm');
      setResult(null);
      reset();
    }
  }, [open, reset]);

  const handleGenerate = async () => {
    setState('generating');

    try {
      const generationResult = await generateAsync(controls);
      
      setResult({
        successCount: generationResult.success.length,
        failedControls: generationResult.failed.map(f => ({
          controlCode: f.controlCode,
          error: f.error,
        })),
      });
      setState('complete');

      if (generationResult.success.length > 0) {
        toast.success(`${generationResult.success.length} plano(s) de ação criado(s) com IA`);
      }
      if (generationResult.failed.length > 0) {
        toast.warning(`${generationResult.failed.length} controle(s) não puderam ser processados`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar planos de ação');
      setState('confirm');
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      onOpenChange(false);
    }
  };

  const progressPercent = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar Planos de Ação com IA
          </DialogTitle>
          <DialogDescription>
            {state === 'confirm' && 'A IA irá analisar os controles não conformes e criar planos de ação personalizados.'}
            {state === 'generating' && 'Gerando planos de ação...'}
            {state === 'complete' && 'Geração concluída'}
          </DialogDescription>
        </DialogHeader>

        {/* Confirm State */}
        {state === 'confirm' && (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <strong>{controls.length}</strong> controle(s) não conforme(s) identificado(s) sem plano de ação.
                </p>
              </div>

              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {controls.map((control) => (
                    <div
                      key={control.controlId}
                      className="flex items-center justify-between p-2 bg-card border rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {control.controlCode}: {control.controlName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Maturidade: {control.currentMaturity} → {control.targetMaturity}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        Gap: {control.targetMaturity - control.currentMaturity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Gerar Planos
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Generating State */}
        {state === 'generating' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Processando controles...
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              {progress.current} de {progress.total} processado(s)
            </p>
          </div>
        )}

        {/* Complete State */}
        {state === 'complete' && result && (
          <>
            <div className="space-y-4">
              {/* Success Summary */}
              {result.successCount > 0 && (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <p className="text-sm">
                    <strong>{result.successCount}</strong> plano(s) de ação criado(s) com sucesso.
                  </p>
                </div>
              )}

              {/* Failed Summary */}
              {result.failedControls.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-destructive shrink-0" />
                    <p className="text-sm">
                      <strong>{result.failedControls.length}</strong> controle(s) não puderam ser processados.
                    </p>
                  </div>
                  <ScrollArea className="max-h-40">
                    <div className="space-y-1">
                      {result.failedControls.map((failed, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm"
                        >
                          <span className="font-medium">{failed.controlCode}</span>
                          <span className="text-muted-foreground text-xs truncate ml-2">
                            {failed.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
