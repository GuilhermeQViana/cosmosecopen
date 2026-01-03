import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Vendor } from '@/hooks/useVendors';
import { useVendorAssessments, useCreateVendorAssessment, VendorAssessment } from '@/hooks/useVendorAssessments';
import { VendorRiskBadge } from './VendorRiskBadge';
import { CalendarIcon, ClipboardCheck, History, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface StartAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  onAssessmentStarted: (assessment: VendorAssessment) => void;
  onContinueAssessment: (assessment: VendorAssessment) => void;
}

export function StartAssessmentDialog({
  open,
  onOpenChange,
  vendor,
  onAssessmentStarted,
  onContinueAssessment,
}: StartAssessmentDialogProps) {
  const [assessmentDate, setAssessmentDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const { data: assessments } = useVendorAssessments(vendor?.id);
  const createAssessment = useCreateVendorAssessment();

  const inProgressAssessments = assessments?.filter((a) => a.status === 'em_andamento') || [];
  const completedAssessments = assessments?.filter((a) => a.status !== 'em_andamento') || [];

  const handleCreateNew = async () => {
    if (!vendor) return;

    try {
      const result = await createAssessment.mutateAsync({
        vendor_id: vendor.id,
        assessment_date: format(assessmentDate, 'yyyy-MM-dd'),
        status: 'em_andamento',
        notes: notes || null,
        overall_score: null,
        risk_level: null,
        approved_at: null,
        approved_by: null,
        assessed_by: null,
      });
      toast({ title: 'Avaliação iniciada com sucesso' });
      onOpenChange(false);
      onAssessmentStarted(result);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível iniciar a avaliação', variant: 'destructive' });
    }
  };

  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-space flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Avaliação de Fornecedor
          </DialogTitle>
          <DialogDescription>
            {vendor.code} - {vendor.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* In Progress Assessments */}
          {inProgressAssessments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <History className="h-4 w-4 text-amber-500" />
                Avaliações em Andamento
              </h4>
              <div className="space-y-2">
                {inProgressAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Iniciada em {format(new Date(assessment.assessment_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {assessment.notes || 'Sem observações'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        onContinueAssessment(assessment);
                      }}
                    >
                      Continuar
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Assessment Form */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Nova Avaliação
            </h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Data da Avaliação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !assessmentDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {assessmentDate ? (
                        format(assessmentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecionar data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={assessmentDate}
                      onSelect={(date) => date && setAssessmentDate(date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações Iniciais</Label>
              <Textarea
                placeholder="Adicione observações sobre esta avaliação..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Recent Completed Assessments */}
          {completedAssessments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Últimas Avaliações Concluídas
              </h4>
              <ScrollArea className="h-[120px]">
                <div className="space-y-2">
                  {completedAssessments.slice(0, 5).map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div>
                        <p className="text-sm">
                          {format(new Date(assessment.assessment_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {assessment.status.replace('_', ' ')}
                        </p>
                      </div>
                      {assessment.overall_score !== null && (
                        <VendorRiskBadge
                          score={assessment.overall_score}
                          riskLevel={assessment.risk_level}
                          size="sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateNew}
            disabled={createAssessment.isPending}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {createAssessment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Iniciar Nova Avaliação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
