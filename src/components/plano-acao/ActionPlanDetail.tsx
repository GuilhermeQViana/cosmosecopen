import { useState } from 'react';
import {
  ActionPlan,
  ActionPlanTask,
  useActionPlanTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  STATUS_COLUMNS,
  PRIORITY_OPTIONS,
} from '@/hooks/useActionPlans';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Sparkles,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  Clock,
  User,
} from 'lucide-react';

interface ActionPlanDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: ActionPlan | null;
  onEdit?: (plan: ActionPlan) => void;
  onDelete?: (plan: ActionPlan) => void;
}

interface EditableTaskItemProps {
  task: ActionPlanTask;
  planId: string;
  onToggle: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
}

function EditableTaskItem({ task, planId, onToggle, onDelete }: EditableTaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const updateTask = useUpdateTask();

  const handleSaveEdit = async () => {
    if (editTitle.trim() && editTitle !== task.title) {
      await updateTask.mutateAsync({ 
        id: task.id, 
        planId, 
        title: editTitle.trim() 
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group">
      <button
        onClick={() => onToggle(task.id, task.completed || false)}
        className="flex-shrink-0"
      >
        {task.completed ? (
          <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isEditing ? (
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveEdit();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          autoFocus
          className="flex-1 h-7 text-sm"
        />
      ) : (
        <span
          onDoubleClick={() => !task.completed && setIsEditing(true)}
          className={cn(
            'flex-1 text-sm cursor-pointer',
            task.completed && 'line-through text-muted-foreground'
          )}
          title="Clique duas vezes para editar"
        >
          {task.title}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(task.id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function ActionPlanDetail({ open, onOpenChange, plan, onEdit, onDelete }: ActionPlanDetailProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { toast } = useToast();

  const { data: tasks, isLoading: loadingTasks } = useActionPlanTasks(plan?.id ?? null);
  const { data: teamMembers } = useTeamMembers();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const assignedMember = teamMembers?.find(m => m.user_id === plan?.assigned_to);

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const statusConfig = STATUS_COLUMNS.find((s) => s.value === plan?.status);
  const priorityConfig = PRIORITY_OPTIONS.find((p) => p.value === plan?.priority);

  const completedTasks = tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate days until due date
  const getDueDateInfo = () => {
    if (!plan?.due_date || plan.status === 'done') return null;
    const daysUntil = differenceInDays(new Date(plan.due_date), new Date());
    if (daysUntil < 0) return { text: `${Math.abs(daysUntil)} dias atrasado`, isOverdue: true };
    if (daysUntil === 0) return { text: 'Vence hoje', isWarning: true };
    if (daysUntil <= 7) return { text: `${daysUntil} dias restantes`, isWarning: true };
    return { text: `${daysUntil} dias restantes`, isNormal: true };
  };

  const dueDateInfo = getDueDateInfo();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || !newTaskTitle.trim()) return;

    try {
      await createTask.mutateAsync({ planId: plan.id, title: newTaskTitle.trim() });
      setNewTaskTitle('');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a tarefa',
        variant: 'destructive',
      });
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!plan) return;
    try {
      await updateTask.mutateAsync({ id: taskId, planId: plan.id, completed: !completed });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tarefa',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!plan) return;
    try {
      await deleteTask.mutateAsync({ id: taskId, planId: plan.id });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a tarefa',
        variant: 'destructive',
      });
    }
  };

  if (!plan) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg border-border/50 bg-card/95 backdrop-blur-xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {plan.ai_generated && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  IA
                </Badge>
              )}
              <Badge className={cn(priorityConfig?.color)}>
                {priorityConfig?.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  statusConfig?.value === 'done' && 'border-[hsl(var(--success))] text-[hsl(var(--success))]'
                )}
              >
                {statusConfig?.label}
              </Badge>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(plan);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    onOpenChange(false);
                    onDelete(plan);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <SheetTitle className="text-left font-space">{plan.title}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] pr-4">
          <div className="space-y-6">
            {plan.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">Descrição</h4>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
            )}

            {plan.due_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Prazo: {format(new Date(plan.due_date), 'PPP', { locale: ptBR })}</span>
                {dueDateInfo && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'ml-2',
                      dueDateInfo.isOverdue && 'border-destructive text-destructive',
                      dueDateInfo.isWarning && 'border-[hsl(var(--warning))] text-[hsl(var(--warning))]',
                      dueDateInfo.isNormal && 'border-muted-foreground text-muted-foreground'
                    )}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {dueDateInfo.text}
                  </Badge>
                )}
              </div>
            )}

            {/* Assigned Member */}
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Responsável:</span>
              {assignedMember ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border border-border">
                    <AvatarImage src={assignedMember.profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {getInitials(assignedMember.profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{assignedMember.profile?.full_name || 'Usuário'}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Não atribuído</span>
              )}
            </div>

            {totalTasks > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">Progresso</span>
                  <span className="text-muted-foreground">
                    {completedTasks}/{totalTasks} ({progress}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-3">Subtarefas</h4>

              <form onSubmit={handleAddTask} className="flex gap-2 mb-3">
                <Input
                  placeholder="Adicionar subtarefa..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newTaskTitle.trim() || createTask.isPending}
                >
                  {createTask.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {loadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <EditableTaskItem
                      key={task.id}
                      task={task}
                      planId={plan.id}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma subtarefa cadastrada
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
