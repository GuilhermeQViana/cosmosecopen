import { ActionPlan, STATUS_COLUMNS, PRIORITY_OPTIONS, useUpdateActionPlan } from '@/hooks/useActionPlans';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GripVertical, Calendar, Sparkles, Edit, Trash2 } from 'lucide-react';

interface ActionPlanCardProps {
  plan: ActionPlan;
  onEdit: (plan: ActionPlan) => void;
  onDelete: (plan: ActionPlan) => void;
  onOpen: (plan: ActionPlan) => void;
  isDragging?: boolean;
}

export function ActionPlanCard({ plan, onEdit, onDelete, onOpen, isDragging }: ActionPlanCardProps) {
  const priorityConfig = PRIORITY_OPTIONS.find((p) => p.value === plan.priority);

  const isOverdue = plan.due_date && new Date(plan.due_date) < new Date() && plan.status !== 'done';

  return (
    <Card
      className={cn(
        'cursor-pointer group hover:shadow-md transition-all',
        isDragging && 'opacity-50 rotate-2 shadow-lg'
      )}
      onClick={() => onOpen(plan)}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-1 cursor-grab" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {plan.ai_generated && (
                <span title="Gerado por IA">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                </span>
              )}
              <Badge className={cn('text-xs', priorityConfig?.color)}>
                {priorityConfig?.label || plan.priority}
              </Badge>
            </div>
            <h4 className="font-medium text-sm line-clamp-2">{plan.title}</h4>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      <CardContent className="p-3 pt-0">
        {plan.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {plan.description}
          </p>
        )}

        {plan.due_date && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            <Calendar className="h-3 w-3" />
            {format(new Date(plan.due_date), 'dd MMM', { locale: ptBR })}
            {isOverdue && ' (atrasado)'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
