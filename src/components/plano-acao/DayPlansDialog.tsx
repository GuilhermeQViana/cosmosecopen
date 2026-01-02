import { ActionPlan, PRIORITY_OPTIONS, STATUS_COLUMNS } from '@/hooks/useActionPlans';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Clock } from 'lucide-react';

interface DayPlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  plans: ActionPlan[];
  onPlanClick: (plan: ActionPlan) => void;
}

export function DayPlansDialog({ open, onOpenChange, date, plans, onPlanClick }: DayPlansDialogProps) {
  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-space">
            <CalendarDays className="h-5 w-5 text-primary" />
            {format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 pr-4">
            {plans.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum plano de ação para este dia.
              </p>
            ) : (
              plans.map((plan) => {
                const priorityConfig = PRIORITY_OPTIONS.find(p => p.value === plan.priority);
                const statusConfig = STATUS_COLUMNS.find(s => s.value === plan.status);

                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      onPlanClick(plan);
                      onOpenChange(false);
                    }}
                    className="p-3 rounded-lg border border-border/50 bg-card/80 hover:bg-accent/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                        {plan.title}
                      </h4>
                      <Badge variant="outline" className={cn('text-xs shrink-0', priorityConfig?.color)}>
                        {priorityConfig?.label}
                      </Badge>
                    </div>
                    
                    {plan.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {plan.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={cn('text-xs', statusConfig?.color, 'text-white')}
                      >
                        {statusConfig?.label}
                      </Badge>
                      {plan.due_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(plan.due_date + 'T12:00:00'), 'HH:mm', { locale: ptBR }) !== '12:00' 
                            ? format(new Date(plan.due_date), 'HH:mm', { locale: ptBR })
                            : 'Sem horário'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <p className="text-xs text-muted-foreground text-center">
          {plans.length} {plans.length === 1 ? 'plano' : 'planos'} de ação
        </p>
      </DialogContent>
    </Dialog>
  );
}
