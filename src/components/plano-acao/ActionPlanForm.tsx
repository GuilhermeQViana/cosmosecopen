import { useState, useEffect } from 'react';
import { ActionPlan, STATUS_COLUMNS, PRIORITY_OPTIONS } from '@/hooks/useActionPlans';
import { useTeamMembers, TeamMember } from '@/hooks/useTeamMembers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Loader2, CalendarIcon, User, X } from 'lucide-react';
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

// Helper to format date as YYYY-MM-DD without timezone issues
function formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to parse YYYY-MM-DD string to Date without timezone shift
function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function ActionPlanForm({ open, onOpenChange, plan, prefillData, prefillDate, onSubmit, isLoading }: ActionPlanFormProps) {
  const { data: teamMembers, isLoading: isLoadingTeam } = useTeamMembers();
  
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

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const selectedMember = teamMembers?.find(m => m.user_id === formData.assigned_to);

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
          due_date: formatDateToLocal(dueDate),
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
          due_date: formatDateToLocal(dueDate),
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
        due_date: formatDateToLocal(prefillDate),
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
                    ? format(parseDateString(formData.due_date), 'PPP', { locale: ptBR })
                    : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.due_date ? parseDateString(formData.due_date) : undefined}
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      due_date: date ? formatDateToLocal(date) : null,
                    })
                  }
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Responsável</Label>
            <Select
              value={formData.assigned_to || 'none'}
              onValueChange={(v) => setFormData({ ...formData, assigned_to: v === 'none' ? null : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável">
                  {selectedMember ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={selectedMember.profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(selectedMember.profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{selectedMember.profile?.full_name || 'Usuário'}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Sem responsável
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Sem responsável</span>
                  </div>
                </SelectItem>
                {isLoadingTeam ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  teamMembers?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={member.profile?.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(member.profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.profile?.full_name || 'Usuário'}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
