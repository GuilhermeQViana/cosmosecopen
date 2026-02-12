import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Vendor } from '@/hooks/useVendors';
import {
  useVendorActionPlans,
  useCreateVendorActionPlan,
  useUpdateVendorActionPlan,
  useDeleteVendorActionPlan,
  VendorActionPlan,
  VENDOR_ACTION_STATUS,
  VENDOR_ACTION_PRIORITY,
} from '@/hooks/useVendorActionPlans';
import { useVendorRequirements } from '@/hooks/useVendorRequirements';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import {
  ListTodo,
  Plus,
  CalendarIcon,
  Loader2,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Sparkles,
} from 'lucide-react';

interface VendorActionPlanManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  assessmentId?: string | null;
}

interface ActionPlanFormData {
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: Date | null;
  assigned_to: string;
  requirement_id: string;
}

const defaultFormData: ActionPlanFormData = {
  title: '',
  description: '',
  priority: 'media',
  status: 'backlog',
  due_date: null,
  assigned_to: '',
  requirement_id: '',
};

export function VendorActionPlanManager({
  open,
  onOpenChange,
  vendor,
  assessmentId,
}: VendorActionPlanManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<VendorActionPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<VendorActionPlan | null>(null);
  const [formData, setFormData] = useState<ActionPlanFormData>(defaultFormData);
  const [aiGenerating, setAiGenerating] = useState(false);

  const { toast } = useToast();
  const { data: actionPlans, isLoading } = useVendorActionPlans(vendor?.id);
  const { data: requirements } = useVendorRequirements();
  const { data: teamMembers } = useTeamMembers();
  const createPlan = useCreateVendorActionPlan();
  const updatePlan = useUpdateVendorActionPlan();
  const deletePlanMutation = useDeleteVendorActionPlan();

  const openCreateForm = () => {
    setEditingPlan(null);
    setFormData({
      ...defaultFormData,
      status: 'backlog',
    });
    setFormOpen(true);
  };

  const openEditForm = (plan: VendorActionPlan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description || '',
      priority: plan.priority,
      status: plan.status,
      due_date: plan.due_date ? new Date(plan.due_date) : null,
      assigned_to: plan.assigned_to || '',
      requirement_id: plan.requirement_id || '',
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!vendor || !formData.title.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório', variant: 'destructive' });
      return;
    }

    try {
      const planData = {
        vendor_id: vendor.id,
        assessment_id: assessmentId || null,
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority as VendorActionPlan['priority'],
        status: formData.status as VendorActionPlan['status'],
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
        assigned_to: formData.assigned_to || null,
        requirement_id: formData.requirement_id || null,
        completed_at: null,
      };

      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.id, ...planData });
        toast({ title: 'Plano de ação atualizado' });
      } else {
        await createPlan.mutateAsync(planData);
        toast({ title: 'Plano de ação criado' });
      }

      setFormOpen(false);
      setFormData(defaultFormData);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível salvar o plano', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletePlan) return;

    try {
      await deletePlanMutation.mutateAsync(deletePlan.id);
      toast({ title: 'Plano de ação excluído' });
      setDeletePlan(null);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir o plano', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (plan: VendorActionPlan, status: string) => {
    try {
      await updatePlan.mutateAsync({
        id: plan.id,
        status: status as VendorActionPlan['status'],
      });
      toast({ title: 'Status atualizado' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o status', variant: 'destructive' });
    }
  };

  const getStatusConfig = (status: string) => {
    return VENDOR_ACTION_STATUS.find((s) => s.value === status) || VENDOR_ACTION_STATUS[0];
  };

  const getPriorityConfig = (priority: string) => {
    return VENDOR_ACTION_PRIORITY.find((p) => p.value === priority) || VENDOR_ACTION_PRIORITY[2];
  };

  const isOverdue = (plan: VendorActionPlan) => {
    if (!plan.due_date || plan.status === 'done') return false;
    return new Date(plan.due_date) < new Date();
  };

  if (!vendor) return null;

  const pendingPlans = actionPlans?.filter((p) => p.status !== 'done') || [];
  const completedPlans = actionPlans?.filter((p) => p.status === 'done') || [];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="font-space flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              Planos de Ação
            </SheetTitle>
            <SheetDescription>
              {vendor.code} - {vendor.name}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{pendingPlans.length} pendentes</Badge>
                <Badge variant="secondary">{completedPlans.length} concluídos</Badge>
              </div>
              <Button onClick={openCreateForm} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-14rem)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : actionPlans && actionPlans.length > 0 ? (
                <div className="space-y-3 pr-4">
                  {actionPlans.map((plan) => {
                    const statusConfig = getStatusConfig(plan.status);
                    const priorityConfig = getPriorityConfig(plan.priority);
                    const overdue = isOverdue(plan);

                    return (
                      <Card
                        key={plan.id}
                        className={cn(
                          'transition-colors',
                          plan.status === 'done' && 'opacity-60',
                          overdue && 'border-destructive/50'
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2">
                                {plan.status === 'done' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                ) : overdue ? (
                                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                                ) : (
                                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                )}
                                <span className="font-medium text-sm truncate">{plan.title}</span>
                              </div>

                              {plan.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {plan.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 flex-wrap">
                                <Select
                                  value={plan.status}
                                  onValueChange={(value) => handleStatusChange(plan, value)}
                                >
                                  <SelectTrigger className="h-7 w-[130px] text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                                      <span>{statusConfig.label}</span>
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {VENDOR_ACTION_STATUS.map((s) => (
                                      <SelectItem key={s.value} value={s.value}>
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${s.color}`} />
                                          <span>{s.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Badge
                                  variant="outline"
                                  className={cn('text-xs', priorityConfig.color.replace('bg-', 'text-'))}
                                >
                                  {priorityConfig.label}
                                </Badge>

                                {plan.requirement && (
                                  <Badge variant="secondary" className="text-xs">
                                    {plan.requirement.code}
                                  </Badge>
                                )}

                                {plan.due_date && (
                                  <span className={cn('text-xs', overdue && 'text-destructive')}>
                                    {format(new Date(plan.due_date), 'dd/MM/yyyy')}
                                  </span>
                                )}

                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => openEditForm(plan)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeletePlan(plan)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ListTodo className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Nenhum Plano de Ação</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie planos de ação para acompanhar melhorias deste fornecedor
                  </p>
                  <Button onClick={openCreateForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Plano
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-space">
              {editingPlan ? 'Editar Plano de Ação' : 'Novo Plano de Ação'}
            </DialogTitle>
            <DialogDescription>
              {vendor.code} - {vendor.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Descreva a ação necessária..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes adicionais..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_ACTION_PRIORITY.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_ACTION_STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal mt-1',
                      !formData.due_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date
                      ? format(formData.due_date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date || undefined}
                    onSelect={(date) => setFormData({ ...formData, due_date: date || null })}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Responsável</Label>
              <Select
                value={formData.assigned_to || "none"}
                onValueChange={(value) => setFormData({ ...formData, assigned_to: value === "none" ? "" : value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecionar responsável..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.profile?.full_name || 'Usuário'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Requisito Relacionado</Label>
              <Select
                value={formData.requirement_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, requirement_id: value === "none" ? "" : value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecionar requisito..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {requirements?.map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.code} - {req.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPlan.isPending || updatePlan.isPending}
            >
              {(createPlan.isPending || updatePlan.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editingPlan ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePlan} onOpenChange={(open) => !open && setDeletePlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Plano de Ação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletePlan?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
