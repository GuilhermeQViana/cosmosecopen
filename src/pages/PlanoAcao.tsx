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
import { AnimatedItem } from '@/components/ui/staggered-list';
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
import { Plus, Kanban, Calendar, ListTodo, Sparkles } from 'lucide-react';

export default function PlanoAcao() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'kanban' | 'calendar'>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const [detailPlan, setDetailPlan] = useState<ActionPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<ActionPlan | null>(null);

  // Pre-fill data from URL params (coming from ControlCard or RiskCard)
  const [prefillData, setPrefillData] = useState<{
    assessmentId?: string;
    controlCode?: string;
    controlName?: string;
    riskId?: string;
    riskCode?: string;
    riskTitle?: string;
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
    const fromRisk = searchParams.get('fromRisk');
    const riskCode = searchParams.get('riskCode');
    const riskTitle = searchParams.get('riskTitle');

    if (fromRisk || fromAssessment || controlCode) {
      setPrefillData({
        assessmentId: fromAssessment || undefined,
        controlCode: controlCode || undefined,
        controlName: controlName || undefined,
        riskId: fromRisk || undefined,
        riskCode: riskCode || undefined,
        riskTitle: riskTitle || undefined,
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
    <div className="space-y-6 relative">
      {/* Subtle cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-20 w-[350px] h-[350px] bg-[hsl(var(--success))]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <AnimatedItem animation="fade-up" delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 font-space">
              <div className="p-2 rounded-lg bg-primary/10">
                <ListTodo className="h-6 w-6 text-primary" />
              </div>
              Plano de Ação
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as ações de remediação e melhoria
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/30 group">
            <Sparkles className="h-4 w-4 mr-2 group-hover:animate-pulse" />
            Nova Ação
          </Button>
        </div>
      </AnimatedItem>

      {/* Stats */}
      {plans && (
        <AnimatedItem animation="fade-up" delay={100}>
          <ActionPlanStats plans={plans} />
        </AnimatedItem>
      )}

      {/* View Tabs */}
      <AnimatedItem animation="fade-up" delay={150}>
        <Tabs value={view} onValueChange={(v) => setView(v as 'kanban' | 'calendar')}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="kanban" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Kanban className="h-4 w-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="h-4 w-4" />
                Calendário
              </TabsTrigger>
            </TabsList>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px] bg-background/50">
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
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-72 h-[500px] flex-shrink-0" />
                ))}
              </div>
            ) : filteredPlans.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <ListTodo className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 font-space">Nenhuma ação cadastrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando seu primeiro plano de ação
                  </p>
                  <Button onClick={() => handleOpenForm()} className="bg-gradient-to-r from-primary to-primary/80">
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
      </AnimatedItem>

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
        <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-space">Excluir Plano de Ação</AlertDialogTitle>
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
