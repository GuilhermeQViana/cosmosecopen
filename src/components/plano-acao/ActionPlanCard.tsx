import { ActionPlan, STATUS_COLUMNS, PRIORITY_OPTIONS, useUpdateActionPlan, useActionPlanTasks } from '@/hooks/useActionPlans';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GripVertical, Calendar, Sparkles, Edit, Trash2, ChevronDown, CheckSquare, Clock, AlertCircle } from 'lucide-react';

// Helper to parse YYYY-MM-DD string to Date without timezone shift
function parseDateSafe(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
import { useToast } from '@/hooks/use-toast';

interface ActionPlanCardProps {
  plan: ActionPlan;
  onEdit: (plan: ActionPlan) => void;
  onDelete: (plan: ActionPlan) => void;
  onOpen: (plan: ActionPlan) => void;
  isDragging?: boolean;
}

export function ActionPlanCard({ plan, onEdit, onDelete, onOpen, isDragging }: ActionPlanCardProps) {
  const priorityConfig = PRIORITY_OPTIONS.find((p) => p.value === plan.priority);
  const updatePlan = useUpdateActionPlan();
  const { toast } = useToast();
  const { data: tasks } = useActionPlanTasks(plan.id);
  const { data: teamMembers } = useTeamMembers();

  const assignedMember = teamMembers?.find(m => m.user_id === plan.assigned_to);

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const today = startOfDay(new Date());
  const isOverdue = plan.due_date && parseDateSafe(plan.due_date) < today && plan.status !== 'done';
  
  // Check if deadline is approaching (within 7 days)
  const daysUntilDue = plan.due_date ? differenceInDays(parseDateSafe(plan.due_date), today) : null;
  const isApproaching = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7 && plan.status !== 'done';

  // Calculate subtasks progress
  const completedTasks = tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const hasSubtasks = totalTasks > 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleStatusChange = async (newStatus: typeof STATUS_COLUMNS[number]['value']) => {
    try {
      await updatePlan.mutateAsync({ id: plan.id, status: newStatus });
      toast({ 
        title: 'Status atualizado',
        description: `Movido para "${STATUS_COLUMNS.find(s => s.value === newStatus)?.label}"` 
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer group hover:shadow-md transition-all border-border/50 bg-card/80 backdrop-blur-sm',
        isDragging && 'opacity-50 rotate-2 shadow-lg',
        isOverdue && 'border-destructive/30',
        isApproaching && !isOverdue && 'border-[hsl(var(--warning))]/30'
      )}
      onClick={() => onOpen(plan)}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-1 cursor-grab flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {plan.ai_generated && (
                <span title="Gerado por IA">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                </span>
              )}
              <Badge className={cn('text-xs', priorityConfig?.color)}>
                {priorityConfig?.label || plan.priority}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Atrasado
                </Badge>
              )}
              {isApproaching && !isOverdue && (
                <Badge variant="outline" className="text-xs gap-1 border-[hsl(var(--warning))] text-[hsl(var(--warning))]">
                  <Clock className="h-3 w-3" />
                  {daysUntilDue === 0 ? 'Hoje' : `${daysUntilDue}d`}
                </Badge>
              )}
            </div>
            <h4 className="font-medium text-sm line-clamp-2">{plan.title}</h4>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {/* Quick Status Change */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-popover border-border">
                <DropdownMenuLabel className="text-xs">Mover para</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_COLUMNS.map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(status.value);
                    }}
                    className={cn(
                      'text-xs cursor-pointer',
                      plan.status === status.value && 'bg-muted'
                    )}
                    disabled={plan.status === status.value}
                  >
                    <div className={cn('w-2 h-2 rounded-full mr-2', status.color)} />
                    {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(plan);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(plan);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        {plan.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {plan.description}
          </p>
        )}

        {/* Subtasks Progress */}
        {hasSubtasks && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckSquare className="h-3 w-3" />
              <span>{completedTasks}/{totalTasks} subtarefas</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          {plan.due_date && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue ? 'text-destructive' : isApproaching ? 'text-[hsl(var(--warning))]' : 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(parseDateSafe(plan.due_date), 'dd MMM', { locale: ptBR })}
            </div>
          )}
          
          {assignedMember && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6 border border-border">
                    <AvatarImage src={assignedMember.profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {getInitials(assignedMember.profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{assignedMember.profile?.full_name || 'Responsável'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
