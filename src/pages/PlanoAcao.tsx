import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useActionPlans,
  useCreateActionPlan,
  useUpdateActionPlan,
  useDeleteActionPlan,
  ActionPlan,
  PRIORITY_OPTIONS,
} from '@/hooks/useActionPlans';
import { KanbanBoard } from '@/components/plano-acao/KanbanBoard';
import { CalendarView } from '@/components/plano-acao/CalendarView';
import { ActionPlanForm, ActionPlanFormData } from '@/components/plano-acao/ActionPlanForm';
import { ActionPlanDetail } from '@/components/plano-acao/ActionPlanDetail';
import { ActionPlanStats } from '@/components/plano-acao/ActionPlanStats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { Plus, Kanban, Calendar, ListTodo } from 'lucide-react';

export default function PlanoAcao() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'kanban' | 'calendar'>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const [detailPlan, setDetailPlan] = useState<ActionPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<ActionPlan | null>(null);

  // Pre-fill data from URL params (coming from ControlCard)
  const [prefillData, setPrefillData] = useState<{
    assessmentId?: string;
    controlCode?: string;
    controlName?: string;
  } | null>(null);

  const { toast } = useToast();
  const { data: plans, isLoading } = useActionPlans();
  const createPlan = useCreateActionPlan();
  const updatePlan = useUpdateActionPlan();
  const deletePlanMutation = useDeleteActionPlan();

  // Handle URL params on mount
  useEffect(() => {
    const fromAssessment = searchParams.get('fromAssessment');
    const controlCode = searchParams.get('controlCode');
    const controlName = searchParams.get('controlName');

    if (fromAssessment || controlCode) {
      setPrefillData({
        assessmentId: fromAssessment || undefined,
        controlCode: controlCode || undefined,
        controlName: controlName || undefined,
      });
      setFormOpen(true);
      // Clear URL params after processing
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredPlans = plans?.filter((plan) => {
    return priorityFilter === 'all' || plan.priority === priorityFilter;
  }) || [];

  const handleOpenForm = (plan?: ActionPlan) => {
    setSelectedPlan(plan || null);
    if (!plan) {
      setPrefillData(null); // Clear prefill when opening for new without context
    }
    setFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    if (!open) {
      setPrefillData(null);
      setSelectedPlan(null);
    }
    setFormOpen(open);
  };

  const handleSubmit = async (data: ActionPlanFormData) => {
    try {
      if (selectedPlan) {
        await updatePlan.mutateAsync({ id: selectedPlan.id, ...data });
        toast({ title: 'Plano de ação atualizado' });
      } else {
        await createPlan.mutateAsync(data);
        toast({ title: 'Plano de ação criado' });
      }
      setFormOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o plano de ação',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletePlan) return;
    try {
      await deletePlanMutation.mutateAsync(deletePlan.id);
      toast({ title: 'Plano de ação excluído' });
      setDeletePlan(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o plano',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-primary" />
            Plano de Ação
          </h1>
          <p className="text-muted-foreground">
            Gerencie as ações de remediação e melhoria
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ação
        </Button>
      </div>

      {/* Stats */}
      {plans && <ActionPlanStats plans={plans} />}

      {/* View Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'kanban' | 'calendar')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="kanban" className="gap-2">
              <Kanban className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kanban View */}
        <TabsContent value="kanban" className="mt-6">
          {isLoading ? (
            <div className="flex gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-72 h-[500px]" />
              ))}
            </div>
          ) : filteredPlans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ListTodo className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhuma ação cadastrada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando seu primeiro plano de ação
                </p>
                <Button onClick={() => handleOpenForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ação
                </Button>
              </CardContent>
            </Card>
          ) : (
            <KanbanBoard
              plans={filteredPlans}
              onEdit={handleOpenForm}
              onDelete={setDeletePlan}
              onOpen={setDetailPlan}
            />
          )}
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-6">
          {isLoading ? (
            <Skeleton className="h-[600px]" />
          ) : (
            <CalendarView plans={filteredPlans} onOpen={setDetailPlan} />
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <ActionPlanForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        plan={selectedPlan}
        prefillData={prefillData}
        onSubmit={handleSubmit}
        isLoading={createPlan.isPending || updatePlan.isPending}
      />

      {/* Detail Sheet */}
      <ActionPlanDetail
        open={!!detailPlan}
        onOpenChange={(open) => !open && setDetailPlan(null)}
        plan={detailPlan}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePlan} onOpenChange={(open) => !open && setDeletePlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Plano de Ação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletePlan?.title}"?
              Esta ação não pode ser desfeita.
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
    </div>
  );
}
