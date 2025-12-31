import { useState } from 'react';
import { ActionPlan, STATUS_COLUMNS, useUpdateActionPlan } from '@/hooks/useActionPlans';
import { ActionPlanCard } from './ActionPlanCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status'];

interface KanbanBoardProps {
  plans: ActionPlan[];
  onEdit: (plan: ActionPlan) => void;
  onDelete: (plan: ActionPlan) => void;
  onOpen: (plan: ActionPlan) => void;
}

export function KanbanBoard({ plans, onEdit, onDelete, onOpen }: KanbanBoardProps) {
  const [draggedPlan, setDraggedPlan] = useState<ActionPlan | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const { toast } = useToast();
  const updatePlan = useUpdateActionPlan();

  const handleDragStart = (e: React.DragEvent, plan: ActionPlan) => {
    setDraggedPlan(plan);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedPlan(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedPlan || draggedPlan.status === status) {
      setDraggedPlan(null);
      setDragOverColumn(null);
      return;
    }

    try {
      await updatePlan.mutateAsync({ id: draggedPlan.id, status });
      toast({ title: `Movido para "${STATUS_COLUMNS.find(c => c.value === status)?.label}"` });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível mover o card',
        variant: 'destructive',
      });
    }

    setDraggedPlan(null);
    setDragOverColumn(null);
  };

  const getPlansForStatus = (status: TaskStatus) => {
    return plans.filter((plan) => plan.status === status);
  };

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        {STATUS_COLUMNS.map((column) => {
          const columnPlans = getPlansForStatus(column.value);
          const isOver = dragOverColumn === column.value;

          return (
            <div
              key={column.value}
              className={cn(
                'flex flex-col w-72 min-h-[500px] rounded-lg border bg-muted/30 transition-colors',
                isOver && 'border-primary bg-primary/5'
              )}
              onDragOver={(e) => handleDragOver(e, column.value)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, column.value)}
            >
              {/* Column Header */}
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', column.color)} />
                  <span className="font-medium text-sm">{column.label}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {columnPlans.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {columnPlans.map((plan) => (
                  <div
                    key={plan.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, plan)}
                    onDragEnd={handleDragEnd}
                  >
                    <ActionPlanCard
                      plan={plan}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onOpen={onOpen}
                      isDragging={draggedPlan?.id === plan.id}
                    />
                  </div>
                ))}

                {columnPlans.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Arraste cards aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
