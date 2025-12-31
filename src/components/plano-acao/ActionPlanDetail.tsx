import { useState } from 'react';
import {
  ActionPlan,
  useActionPlanTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  STATUS_COLUMNS,
  PRIORITY_OPTIONS,
} from '@/hooks/useActionPlans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Sparkles,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Circle,
} from 'lucide-react';

interface ActionPlanDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: ActionPlan | null;
}

export function ActionPlanDetail({ open, onOpenChange, plan }: ActionPlanDetailProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { toast } = useToast();

  const { data: tasks, isLoading: loadingTasks } = useActionPlanTasks(plan?.id ?? null);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const statusConfig = STATUS_COLUMNS.find((s) => s.value === plan?.status);
  const priorityConfig = PRIORITY_OPTIONS.find((p) => p.value === plan?.priority);

  const completedTasks = tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
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
                statusConfig?.value === 'done' && 'border-green-500 text-green-600'
              )}
            >
              {statusConfig?.label}
            </Badge>
          </div>
          <SheetTitle className="text-left">{plan.title}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] pr-4">
          <div className="space-y-6">
            {/* Description */}
            {plan.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">Descrição</h4>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
            )}

            {/* Due date */}
            {plan.due_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Prazo: {format(new Date(plan.due_date), 'PPP', { locale: ptBR })}</span>
              </div>
            )}

            {/* Progress */}
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

            {/* Subtasks */}
            <div>
              <h4 className="text-sm font-medium mb-3">Subtarefas</h4>

              {/* Add task form */}
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

              {/* Task list */}
              {loadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group"
                    >
                      <button
                        onClick={() => handleToggleTask(task.id, task.completed || false)}
                        className="flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                      <span
                        className={cn(
                          'flex-1 text-sm',
                          task.completed && 'line-through text-muted-foreground'
                        )}
                      >
                        {task.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
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
