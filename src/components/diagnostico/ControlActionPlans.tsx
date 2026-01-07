import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssessmentActionPlans } from '@/hooks/useAssessmentActionPlans';
import { 
  ListTodo, 
  ExternalLink, 
  Plus, 
  Calendar, 
  ChevronRight,
  ClipboardList,
  Clock
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ControlActionPlansProps {
  assessmentId: string | undefined;
  controlCode: string;
  controlName: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  backlog: { label: 'Backlog', className: 'bg-muted text-muted-foreground' },
  todo: { label: 'A Fazer', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  in_progress: { label: 'Em Progresso', className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  review: { label: 'Em Revisão', className: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  done: { label: 'Concluído', className: 'bg-green-500/10 text-green-600 border-green-500/30' },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  critica: { label: 'Crítica', className: 'text-red-600' },
  alta: { label: 'Alta', className: 'text-orange-600' },
  media: { label: 'Média', className: 'text-yellow-600' },
  baixa: { label: 'Baixa', className: 'text-green-600' },
};

export function ControlActionPlans({
  assessmentId,
  controlCode,
  controlName,
}: ControlActionPlansProps) {
  const navigate = useNavigate();
  const { data: actionPlans = [], isLoading } = useAssessmentActionPlans(assessmentId);

  const handleCreateActionPlan = () => {
    const params = new URLSearchParams({
      fromAssessment: assessmentId || '',
      controlCode,
      controlName,
    });
    navigate(`/plano-acao?${params.toString()}`);
  };

  const handleViewPlan = (planId: string) => {
    navigate(`/plano-acao?viewPlan=${planId}`);
  };

  const handleViewAllPlans = () => {
    navigate('/plano-acao');
  };

  const pendingCount = actionPlans.filter((ap) => ap.status !== 'done').length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-primary" />
          Planos de Ação
          {actionPlans.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {actionPlans.length}
            </Badge>
          )}
          {pendingCount > 0 && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30">
              {pendingCount} pendente(s)
            </Badge>
          )}
        </h4>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleCreateActionPlan} 
          className="h-7 gap-1"
        >
          <Plus className="w-3 h-3" />
          Criar Plano
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && actionPlans.length === 0 && (
        <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mb-3">
            Nenhum plano de ação para este controle
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCreateActionPlan}
            className="gap-1"
          >
            <Plus className="w-3 h-3" />
            Criar Plano de Ação
          </Button>
        </div>
      )}

      {/* Plans List */}
      {!isLoading && actionPlans.length > 0 && (
        <ScrollArea className="max-h-[280px]">
          <div className="space-y-2 pr-2">
            {actionPlans.map((plan) => {
              const statusConfig = STATUS_CONFIG[plan.status] || STATUS_CONFIG.backlog;
              const priorityConfig = PRIORITY_CONFIG[plan.priority] || PRIORITY_CONFIG.media;
              const dueDate = plan.due_date ? new Date(plan.due_date) : null;
              const isOverdue = dueDate && isPast(dueDate) && plan.status !== 'done';
              const isDueToday = dueDate && isToday(dueDate);

              return (
                <div
                  key={plan.id}
                  onClick={() => handleViewPlan(plan.id)}
                  className={cn(
                    'p-3 rounded-lg border bg-card cursor-pointer transition-all duration-150',
                    'hover:bg-accent/50 hover:border-primary/50 hover:shadow-sm',
                    'active:scale-[0.99]',
                    isOverdue && 'border-destructive/50 bg-destructive/5'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{plan.title}</p>
                      
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={cn('text-[10px] h-5', statusConfig.className)}
                        >
                          {statusConfig.label}
                        </Badge>
                        
                        <span className={cn('text-[10px] font-medium', priorityConfig.className)}>
                          {priorityConfig.label}
                        </span>
                        
                        {dueDate && (
                          <span className={cn(
                            'text-[10px] flex items-center gap-1',
                            isOverdue ? 'text-destructive font-medium' : 
                            isDueToday ? 'text-amber-600 font-medium' : 
                            'text-muted-foreground'
                          )}>
                            {isOverdue ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <Calendar className="w-3 h-3" />
                            )}
                            {format(dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* View All Link */}
      {actionPlans.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAllPlans}
          className="w-full text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          Ver todos na página de Planos
          <ExternalLink className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
