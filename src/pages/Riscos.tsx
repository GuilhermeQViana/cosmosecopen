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
  calculateRiskLevel,
} from '@/hooks/useRisks';
import { RiskMatrix } from '@/components/riscos/RiskMatrix';
import { RiskCard } from '@/components/riscos/RiskCard';
import { RiskForm, RiskFormData } from '@/components/riscos/RiskForm';
import { RiskStats } from '@/components/riscos/RiskStats';
import { LinkControlsDialog } from '@/components/riscos/LinkControlsDialog';
import { RiskDetailSheet } from '@/components/riscos/RiskDetailSheet';
import { CriticalRisksAlert } from '@/components/riscos/CriticalRisksAlert';
import { RiskMethodologyInfo } from '@/components/shared/RiskMethodologyInfo';
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
import { Plus, Search, LayoutGrid, List, AlertTriangle, Download, HelpCircle } from 'lucide-react';

const LEVEL_FILTERS = [
  { value: 'all', label: 'Todos os níveis' },
  { value: 'critical', label: 'Crítico (20-25)' },
  { value: 'high', label: 'Alto (12-19)' },
  { value: 'medium', label: 'Médio (6-11)' },
  { value: 'low', label: 'Baixo (1-5)' },
];

export default function Riscos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentFramework } = useFrameworkContext();
  const [view, setView] = useState<'grid' | 'matrix'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [treatmentFilter, setTreatmentFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [showResidual, setShowResidual] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [deleteRisk, setDeleteRisk] = useState<Risk | null>(null);
  const [linkControlsRisk, setLinkControlsRisk] = useState<Risk | null>(null);
  const [detailRisk, setDetailRisk] = useState<Risk | null>(null);
  
  const [prefillData, setPrefillData] = useState<{
    controlCode?: string;
    controlName?: string;
  } | null>(null);

  const { toast } = useToast();
  const { data: risks, isLoading } = useRisks();
  const createRisk = useCreateRisk();
  const updateRisk = useUpdateRisk();
  const deleteRiskMutation = useDeleteRisk();

  useEffect(() => {
    const fromControl = searchParams.get('fromControl');
    const controlCode = searchParams.get('controlCode');
    const controlName = searchParams.get('controlName');

    if (fromControl && controlCode) {
      setPrefillData({ controlCode, controlName: controlName || '' });
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredRisks = risks?.filter((risk) => {
    const matchesSearch =
      risk.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || risk.category === categoryFilter;
    const matchesTreatment = treatmentFilter === 'all' || risk.treatment === treatmentFilter;
    
    const level = calculateRiskLevel(risk.inherent_probability, risk.inherent_impact);
    let matchesLevel = true;
    if (levelFilter === 'critical') matchesLevel = level >= 20;
    else if (levelFilter === 'high') matchesLevel = level >= 12 && level < 20;
    else if (levelFilter === 'medium') matchesLevel = level >= 6 && level < 12;
    else if (levelFilter === 'low') matchesLevel = level < 6;
    
    return matchesSearch && matchesCategory && matchesTreatment && matchesLevel;
  }) || [];

  const handleOpenForm = (risk?: Risk) => {
    setSelectedRisk(risk || null);
    if (!risk) setPrefillData(null);
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
      toast({ title: 'Erro', description: 'Não foi possível salvar o risco', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteRisk) return;
    try {
      await deleteRiskMutation.mutateAsync(deleteRisk.id);
      toast({ title: 'Risco excluído com sucesso' });
      setDeleteRisk(null);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir o risco', variant: 'destructive' });
    }
  };

  const handleExportCSV = () => {
    const dataToExport = filteredRisks;
    const headers = ['Código', 'Título', 'Descrição', 'Categoria', 'Prob. Inerente', 'Impacto Inerente', 'Nível Inerente', 'Prob. Residual', 'Impacto Residual', 'Nível Residual', 'Tratamento', 'Plano de Tratamento', 'Criado em'];
    const rows = dataToExport.map(r => [
      r.code,
      r.title,
      r.description || '',
      r.category || '',
      r.inherent_probability,
      r.inherent_impact,
      calculateRiskLevel(r.inherent_probability, r.inherent_impact),
      r.residual_probability || '',
      r.residual_impact || '',
      r.residual_probability && r.residual_impact ? calculateRiskLevel(r.residual_probability, r.residual_impact) : '',
      r.treatment,
      r.treatment_plan || '',
      new Date(r.created_at).toLocaleDateString('pt-BR'),
    ]);
    
    const csvContent = [headers.join(';'), ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `riscos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Exportação concluída', description: `${dataToExport.length} riscos exportados` });
  };

  const handleFilterCritical = () => setLevelFilter('critical');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            Registro de Riscos
          </h1>
          <p className="text-muted-foreground">Gerencie os riscos de segurança da organização</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {currentFramework && (
            <Badge variant="outline" className="text-sm px-3 py-1.5">{currentFramework.name}</Badge>
          )}
          <RiskMethodologyInfo />
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filteredRisks.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Risco
          </Button>
        </div>
      </div>

      {/* Critical Alert */}
      {risks && risks.length > 0 && (
        <CriticalRisksAlert risks={risks} onFilterCritical={handleFilterCritical} />
      )}

      {/* Stats */}
      {risks && <RiskStats risks={risks} />}

      {/* View Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'matrix')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="grid" className="gap-2"><LayoutGrid className="h-4 w-4" />Lista</TabsTrigger>
            <TabsTrigger value="matrix" className="gap-2"><List className="h-4 w-4" />Matriz</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar risco..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[180px]" />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Nível" /></SelectTrigger>
              <SelectContent>
                {LEVEL_FILTERS.map((f) => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {RISK_CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Tratamento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {TREATMENT_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="grid" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (<Skeleton key={i} className="h-48" />))}
            </div>
          ) : filteredRisks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhum risco encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || categoryFilter !== 'all' || treatmentFilter !== 'all' || levelFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando o primeiro risco da organização'}
                </p>
                {!searchQuery && categoryFilter === 'all' && treatmentFilter === 'all' && levelFilter === 'all' && (
                  <Button onClick={() => handleOpenForm()}><Plus className="h-4 w-4 mr-2" />Novo Risco</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRisks.map((risk) => (
                <RiskCard key={risk.id} risk={risk} onEdit={handleOpenForm} onDelete={setDeleteRisk} onLinkControls={setLinkControlsRisk} onViewDetails={setDetailRisk} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matrix" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Matriz de Riscos 5x5</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowResidual(!showResidual)}>
                  {showResidual ? 'Ver Inerente' : 'Ver Residual'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[400px]" /> : <RiskMatrix risks={filteredRisks} onRiskClick={setDetailRisk} showResidual={showResidual} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RiskForm open={formOpen} onOpenChange={handleCloseForm} risk={selectedRisk} prefillData={prefillData} onSubmit={handleSubmit} isLoading={createRisk.isPending || updateRisk.isPending} />
      <LinkControlsDialog open={!!linkControlsRisk} onOpenChange={(open) => !open && setLinkControlsRisk(null)} risk={linkControlsRisk} />
      <RiskDetailSheet open={!!detailRisk} onOpenChange={(open) => !open && setDetailRisk(null)} risk={detailRisk} />

      <AlertDialog open={!!deleteRisk} onOpenChange={(open) => !open && setDeleteRisk(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Risco</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o risco "{deleteRisk?.code} - {deleteRisk?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
