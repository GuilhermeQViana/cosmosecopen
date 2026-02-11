import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Vendor } from '@/hooks/useVendors';
import {
  useVendorOffboarding,
  useOffboardingTasks,
  useStartOffboarding,
  useUpdateOffboardingTask,
  useCompleteOffboarding,
  OFFBOARDING_REASONS,
} from '@/hooks/useVendorOffboarding';
import { useToast } from '@/hooks/use-toast';
import {
  LogOut,
  CheckCircle2,
  Shield,
  Database,
  Scale,
  DollarSign,
  Loader2,
} from 'lucide-react';

interface VendorOffboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  acessos: { label: 'Acessos', icon: <Shield className="h-4 w-4" />, color: 'text-red-400' },
  dados: { label: 'Dados', icon: <Database className="h-4 w-4" />, color: 'text-blue-400' },
  legal: { label: 'Legal', icon: <Scale className="h-4 w-4" />, color: 'text-purple-400' },
  financeiro: { label: 'Financeiro', icon: <DollarSign className="h-4 w-4" />, color: 'text-emerald-400' },
};

export function VendorOffboardingWizard({ open, onOpenChange, vendor }: VendorOffboardingWizardProps) {
  const [reason, setReason] = useState('fim_contrato');
  const [notes, setNotes] = useState('');

  const { toast } = useToast();
  const { data: offboarding, isLoading: loadingOffboarding } = useVendorOffboarding(vendor?.id);
  const { data: tasks = [] } = useOffboardingTasks(offboarding?.id);
  const startOffboarding = useStartOffboarding();
  const updateTask = useUpdateOffboardingTask();
  const completeOffboarding = useCompleteOffboarding();

  if (!vendor) return null;

  const isActive = !!offboarding && offboarding.status !== 'concluido';
  const isCompleted = offboarding?.status === 'concluido';
  const completedTasks = tasks.filter((t) => t.status === 'concluido').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const allDone = tasks.length > 0 && completedTasks === tasks.length;

  const handleStart = async () => {
    try {
      await startOffboarding.mutateAsync({ vendorId: vendor.id, reason, notes });
      toast({ title: 'Offboarding iniciado', description: 'Checklist de desligamento criado com sucesso.' });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível iniciar o offboarding.', variant: 'destructive' });
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'concluido' ? 'pendente' : 'concluido';
    try {
      await updateTask.mutateAsync({ id: taskId, status: newStatus });
    } catch {
      toast({ title: 'Erro ao atualizar tarefa', variant: 'destructive' });
    }
  };

  const handleComplete = async () => {
    if (!offboarding) return;
    try {
      await completeOffboarding.mutateAsync({ offboardingId: offboarding.id, vendorId: vendor.id });
      toast({ title: 'Offboarding concluído', description: 'O fornecedor foi movido para Inativo.' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro ao concluir offboarding', variant: 'destructive' });
    }
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-space">
            <LogOut className="h-5 w-5 text-orange-400" />
            Offboarding - {vendor.name}
          </DialogTitle>
          <DialogDescription>
            {isCompleted
              ? 'Este processo de offboarding foi concluído.'
              : isActive
              ? 'Acompanhe o progresso do desligamento do fornecedor.'
              : 'Inicie o processo de desligamento controlado do fornecedor.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loadingOffboarding ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !isActive && !isCompleted ? (
            /* Start Form */
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Motivo do Offboarding</label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFBOARDING_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Observações</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Descreva detalhes adicionais..."
                  rows={3}
                />
              </div>
              <Button
                onClick={handleStart}
                disabled={startOffboarding.isPending}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
              >
                {startOffboarding.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Iniciar Offboarding
              </Button>
            </div>
          ) : (
            /* Task Checklist */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {completedTasks} de {tasks.length} tarefas concluídas
                </div>
                {isCompleted && (
                  <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Concluído
                  </Badge>
                )}
              </div>
              <Progress value={progress} className="h-2" />

              {Object.entries(groupedTasks).map(([category, categoryTasks]) => {
                const config = CATEGORY_CONFIG[category] || { label: category, icon: null, color: '' };
                return (
                  <div key={category}>
                    <div className={`flex items-center gap-2 mb-2 ${config.color}`}>
                      {config.icon}
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <div className="space-y-1.5 ml-6">
                      {categoryTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/30 transition-colors"
                        >
                          <Checkbox
                            checked={task.status === 'concluido'}
                            onCheckedChange={() => handleToggleTask(task.id, task.status)}
                            disabled={isCompleted}
                          />
                          <span className={`text-sm flex-1 ${task.status === 'concluido' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.task_name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-3" />
                  </div>
                );
              })}

              {isActive && allDone && (
                <Button
                  onClick={handleComplete}
                  disabled={completeOffboarding.isPending}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                >
                  {completeOffboarding.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Concluir Offboarding
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
