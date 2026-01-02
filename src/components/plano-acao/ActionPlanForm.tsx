import { useState, useEffect } from 'react';
import { ActionPlan, STATUS_COLUMNS, PRIORITY_OPTIONS } from '@/hooks/useActionPlans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, CalendarIcon } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];

interface PrefillData {
  assessmentId?: string;
  controlCode?: string;
  controlName?: string;
  riskId?: string;
  riskCode?: string;
  riskTitle?: string;
}

interface ActionPlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: ActionPlan | null;
  prefillData?: PrefillData | null;
  prefillDate?: Date | null;
  onSubmit: (data: ActionPlanFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface ActionPlanFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assessment_id: string | null;
  risk_id: string | null;
  ai_generated: boolean | null;
  assigned_to: string | null;
}

export function ActionPlanForm({ open, onOpenChange, plan, prefillData, prefillDate, onSubmit, isLoading }: ActionPlanFormProps) {
  const [formData, setFormData] = useState<ActionPlanFormData>({
    title: '',
    description: '',
    status: 'backlog',
    priority: 'media',
    due_date: null,
    assessment_id: null,
    risk_id: null,
    ai_generated: false,
    assigned_to: null,
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        title: plan.title,
        description: plan.description || '',
        status: plan.status,
        priority: plan.priority,
        due_date: plan.due_date,
        assessment_id: plan.assessment_id,
        risk_id: plan.risk_id,
        ai_generated: plan.ai_generated,
        assigned_to: plan.assigned_to,
      });
    } else if (prefillData) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // Default 30 days from now
      
      // Check if prefilling from risk or control
      if (prefillData.riskId) {
        // Pre-fill from risk data
        setFormData({
          title: `Tratar risco ${prefillData.riskCode || ''}`,
          description: prefillData.riskTitle 
            ? `Plano de ação para tratamento do risco: ${prefillData.riskCode} - ${prefillData.riskTitle}`
            : '',
          status: 'todo',
          priority: 'alta',
          due_date: dueDate.toISOString().split('T')[0],
          assessment_id: null,
          risk_id: prefillData.riskId,
          ai_generated: false,
          assigned_to: null,
        });
      } else {
        // Pre-fill from assessment/control data
        setFormData({
          title: `Remediar controle ${prefillData.controlCode || 'não conforme'}`,
          description: prefillData.controlName 
            ? `Plano de ação para remediar o controle não conforme: ${prefillData.controlCode} - ${prefillData.controlName}`
            : '',
          status: 'todo',
          priority: 'alta',
          due_date: dueDate.toISOString().split('T')[0],
          assessment_id: prefillData.assessmentId || null,
          risk_id: null,
          ai_generated: false,
          assigned_to: null,
        });
      }
    } else if (prefillDate) {
      // Pre-fill from calendar date click
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'media',
        due_date: prefillDate.toISOString().split('T')[0],
        assessment_id: null,
        risk_id: null,
        ai_generated: false,
        assigned_to: null,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'backlog',
        priority: 'media',
        due_date: null,
        assessment_id: null,
        risk_id: null,
        ai_generated: false,
        assigned_to: null,
      });
    }
  }, [plan, prefillData, prefillDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Editar Plano de Ação' : 'Novo Plano de Ação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Descreva a ação..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes da ação..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as TaskStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_COLUMNS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', status.color)} />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prazo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.due_date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date
                    ? format(new Date(formData.due_date), 'PPP', { locale: ptBR })
                    : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.due_date ? new Date(formData.due_date) : undefined}
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      due_date: date ? date.toISOString().split('T')[0] : null,
                    })
                  }
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {plan ? 'Salvar Alterações' : 'Criar Plano'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
