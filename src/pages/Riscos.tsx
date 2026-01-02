import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import {
  useRisks,
  useCreateRisk,
  useUpdateRisk,
  useDeleteRisk,
  Risk,
  RISK_CATEGORIES,
  TREATMENT_OPTIONS,
} from '@/hooks/useRisks';
import { RiskMatrix } from '@/components/riscos/RiskMatrix';
import { RiskCard } from '@/components/riscos/RiskCard';
import { RiskForm, RiskFormData } from '@/components/riscos/RiskForm';
import { RiskStats } from '@/components/riscos/RiskStats';
import { LinkControlsDialog } from '@/components/riscos/LinkControlsDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Search, LayoutGrid, List, AlertTriangle } from 'lucide-react';

export default function Riscos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentFramework } = useFrameworkContext();
  const [view, setView] = useState<'grid' | 'matrix'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [treatmentFilter, setTreatmentFilter] = useState<string>('all');
  const [showResidual, setShowResidual] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [deleteRisk, setDeleteRisk] = useState<Risk | null>(null);
  const [linkControlsRisk, setLinkControlsRisk] = useState<Risk | null>(null);
  
  // Pre-fill data from URL params (coming from ControlCard)
  const [prefillData, setPrefillData] = useState<{
    controlCode?: string;
    controlName?: string;
  } | null>(null);

  const { toast } = useToast();
  const { data: risks, isLoading } = useRisks();
  const createRisk = useCreateRisk();
  const updateRisk = useUpdateRisk();
  const deleteRiskMutation = useDeleteRisk();

  // Handle URL params on mount
  useEffect(() => {
    const fromControl = searchParams.get('fromControl');
    const controlCode = searchParams.get('controlCode');
    const controlName = searchParams.get('controlName');

    if (fromControl && controlCode) {
      setPrefillData({ controlCode, controlName: controlName || '' });
      setFormOpen(true);
      // Clear URL params after processing
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredRisks = risks?.filter((risk) => {
    const matchesSearch =
      risk.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || risk.category === categoryFilter;
    const matchesTreatment = treatmentFilter === 'all' || risk.treatment === treatmentFilter;
    return matchesSearch && matchesCategory && matchesTreatment;
  }) || [];

  const handleOpenForm = (risk?: Risk) => {
    setSelectedRisk(risk || null);
    if (!risk) {
      setPrefillData(null); // Clear prefill when opening for new without context
    }
    setFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    if (!open) {
      setPrefillData(null);
      setSelectedRisk(null);
    }
    setFormOpen(open);
  };

  const handleSubmit = async (data: RiskFormData) => {
    try {
      if (selectedRisk) {
        await updateRisk.mutateAsync({ id: selectedRisk.id, ...data });
        toast({ title: 'Risco atualizado com sucesso' });
      } else {
        await createRisk.mutateAsync(data);
        toast({ title: 'Risco criado com sucesso' });
      }
      setFormOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o risco',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteRisk) return;
    try {
      await deleteRiskMutation.mutateAsync(deleteRisk.id);
      toast({ title: 'Risco excluído com sucesso' });
      setDeleteRisk(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o risco',
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
            <AlertTriangle className="h-6 w-6 text-primary" />
            Registro de Riscos
          </h1>
          <p className="text-muted-foreground">
            Gerencie os riscos de segurança da organização
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentFramework && (
            <Badge variant="outline" className="text-sm px-3 py-1.5">
              {currentFramework.name}
            </Badge>
          )}
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Risco
          </Button>
        </div>
      </div>

      {/* Stats */}
      {risks && <RiskStats risks={risks} />}

      {/* View Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'matrix')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="grid" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="matrix" className="gap-2">
              <List className="h-4 w-4" />
              Matriz
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar risco..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {RISK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Tratamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {TREATMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid View */}
        <TabsContent value="grid" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredRisks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhum risco encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || categoryFilter !== 'all' || treatmentFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece cadastrando o primeiro risco da organização'}
                </p>
                {!searchQuery && categoryFilter === 'all' && treatmentFilter === 'all' && (
                  <Button onClick={() => handleOpenForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Risco
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRisks.map((risk) => (
                <RiskCard
                  key={risk.id}
                  risk={risk}
                  onEdit={handleOpenForm}
                  onDelete={setDeleteRisk}
                  onLinkControls={setLinkControlsRisk}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Matrix View */}
        <TabsContent value="matrix" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Matriz de Riscos 5x5</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResidual(!showResidual)}
                >
                  {showResidual ? 'Ver Inerente' : 'Ver Residual'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px]" />
              ) : (
                <RiskMatrix
                  risks={filteredRisks}
                  onRiskClick={handleOpenForm}
                  showResidual={showResidual}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <RiskForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        risk={selectedRisk}
        prefillData={prefillData}
        onSubmit={handleSubmit}
        isLoading={createRisk.isPending || updateRisk.isPending}
      />

      {/* Link Controls Dialog */}
      <LinkControlsDialog
        open={!!linkControlsRisk}
        onOpenChange={(open) => !open && setLinkControlsRisk(null)}
        risk={linkControlsRisk}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRisk} onOpenChange={(open) => !open && setDeleteRisk(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Risco</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o risco "{deleteRisk?.code} - {deleteRisk?.title}"?
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
