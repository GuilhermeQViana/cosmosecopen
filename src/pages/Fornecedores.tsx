import { useState } from 'react';
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
  useNextVendorCode,
  Vendor,
  VENDOR_CATEGORIES,
  VENDOR_CRITICALITY,
  VENDOR_STATUS,
  getRiskLevelFromScore,
} from '@/hooks/useVendors';
import { VendorCard } from '@/components/fornecedores/VendorCard';
import { VendorForm, VendorFormData } from '@/components/fornecedores/VendorForm';
import { VendorStats } from '@/components/fornecedores/VendorStats';
import { VendorDetailSheet } from '@/components/fornecedores/VendorDetailSheet';
import { StartAssessmentDialog } from '@/components/fornecedores/StartAssessmentDialog';
import { VendorAssessmentForm } from '@/components/fornecedores/VendorAssessmentForm';
import { VendorAssessment } from '@/hooks/useVendorAssessments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { StaggeredGrid, AnimatedItem } from '@/components/ui/staggered-list';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Building2, Download, LayoutGrid, Columns3 } from 'lucide-react';
import { VendorPipeline } from '@/components/fornecedores/VendorPipeline';
import { DueDiligenceDialog } from '@/components/fornecedores/DueDiligenceDialog';

const RISK_LEVEL_FILTERS = [
  { value: 'all', label: 'Todos os níveis' },
  { value: 'critico', label: 'Crítico' },
  { value: 'alto', label: 'Alto' },
  { value: 'medio', label: 'Médio' },
  { value: 'baixo', label: 'Baixo' },
  { value: 'nao_avaliado', label: 'Não Avaliado' },
];

export default function Fornecedores() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'pipeline'>('grid');

  const [formOpen, setFormOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [deleteVendor, setDeleteVendor] = useState<Vendor | null>(null);
  const [detailVendor, setDetailVendor] = useState<Vendor | null>(null);
  const [assessmentVendor, setAssessmentVendor] = useState<Vendor | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<VendorAssessment | null>(null);
  const [assessmentFormVendor, setAssessmentFormVendor] = useState<Vendor | null>(null);
  const [ddVendor, setDdVendor] = useState<Vendor | null>(null);

  const { toast } = useToast();
  const { data: vendors, isLoading } = useVendors();
  const { data: nextCode } = useNextVendorCode();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendorMutation = useDeleteVendor();

  const filteredVendors = vendors?.filter((vendor) => {
    const matchesSearch =
      vendor.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    const matchesCriticality = criticalityFilter === 'all' || vendor.criticality === criticalityFilter;
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;

    const riskLevel = getRiskLevelFromScore(vendor.last_assessment?.overall_score ?? null);
    const matchesRisk = riskFilter === 'all' || riskLevel === riskFilter;

    return matchesSearch && matchesCategory && matchesCriticality && matchesStatus && matchesRisk;
  }) || [];

  const handleOpenForm = (vendor?: Vendor) => {
    setSelectedVendor(vendor || null);
    setFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    if (!open) {
      setSelectedVendor(null);
    }
    setFormOpen(open);
  };

  const handleSubmit = async (data: VendorFormData) => {
    try {
      if (selectedVendor) {
        await updateVendor.mutateAsync({ id: selectedVendor.id, ...data });
        toast({ title: 'Fornecedor atualizado com sucesso' });
      } else {
        await createVendor.mutateAsync({
          code: data.code,
          name: data.name,
          description: data.description || null,
          category: data.category || null,
          criticality: data.criticality,
          status: data.status,
          contact_name: data.contact_name || null,
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          contract_start: data.contract_start || null,
          contract_end: data.contract_end || null,
          lifecycle_stage: (data as any).lifecycle_stage || 'prospecto',
          data_classification: (data as any).data_classification || null,
          service_type: (data as any).service_type || null,
          contract_value: (data as any).contract_value || null,
          contract_currency: (data as any).contract_currency || 'BRL',
        });
        toast({ title: 'Fornecedor criado com sucesso' });
      }
      setFormOpen(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível salvar o fornecedor', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteVendor) return;
    try {
      await deleteVendorMutation.mutateAsync(deleteVendor.id);
      toast({ title: 'Fornecedor excluído com sucesso' });
      setDeleteVendor(null);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir o fornecedor', variant: 'destructive' });
    }
  };

  const handleStartAssessment = (vendor: Vendor) => {
    setAssessmentVendor(vendor);
  };

  const handleAssessmentStarted = (assessment: VendorAssessment) => {
    setAssessmentFormVendor(assessmentVendor);
    setActiveAssessment(assessment);
  };

  const handleContinueAssessment = (assessment: VendorAssessment) => {
    setAssessmentFormVendor(assessmentVendor);
    setActiveAssessment(assessment);
  };

  const handleExportCSV = () => {
    const dataToExport = filteredVendors;
    const headers = [
      'Código',
      'Nome',
      'Descrição',
      'Categoria',
      'Criticidade',
      'Status',
      'Contato',
      'Email',
      'Telefone',
      'Início Contrato',
      'Fim Contrato',
      'Último Score',
      'Nível de Risco',
    ];
    const rows = dataToExport.map((v) => [
      v.code,
      v.name,
      v.description || '',
      v.category || '',
      v.criticality,
      v.status,
      v.contact_name || '',
      v.contact_email || '',
      v.contact_phone || '',
      v.contract_start || '',
      v.contract_end || '',
      v.last_assessment?.overall_score?.toString() || '',
      v.last_assessment?.risk_level || 'Não avaliado',
    ]);

    const csvContent = [headers.join(';'), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fornecedores_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Exportação concluída', description: `${dataToExport.length} fornecedores exportados` });
  };

  return (
    <div className="space-y-6 relative">
      {/* Subtle cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <AnimatedItem animation="fade-up" delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 font-space">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              Gestão de Fornecedores
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie e avalie fornecedores em Segurança, Cyber, Privacidade e BCN
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredVendors.length === 0}
              className="hover:bg-primary/10 hover:border-primary/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button
              onClick={() => handleOpenForm()}
              className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          </div>
        </div>
      </AnimatedItem>

      {/* Stats */}
      {vendors && vendors.length > 0 && (
        <AnimatedItem animation="fade-up" delay={50}>
          <VendorStats vendors={vendors} />
        </AnimatedItem>
      )}

      {/* Filters */}
      <AnimatedItem animation="fade-up" delay={100}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar fornecedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px] bg-background/50 focus:bg-background"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] bg-background/50">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {VENDOR_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
            <SelectTrigger className="w-[130px] bg-background/50">
              <SelectValue placeholder="Criticidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {VENDOR_CRITICALITY.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-background/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {VENDOR_STATUS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[150px] bg-background/50">
              <SelectValue placeholder="Nível de Risco" />
            </SelectTrigger>
            <SelectContent>
              {RISK_LEVEL_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AnimatedItem>

      {/* Vendors Grid */}
      <AnimatedItem animation="fade-up" delay={150}>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2 font-space">Nenhum fornecedor encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || categoryFilter !== 'all' || criticalityFilter !== 'all' || statusFilter !== 'all' || riskFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece cadastrando o primeiro fornecedor da organização'}
              </p>
              {!searchQuery && categoryFilter === 'all' && criticalityFilter === 'all' && statusFilter === 'all' && riskFilter === 'all' && (
                <Button onClick={() => handleOpenForm()} className="bg-gradient-to-r from-primary to-primary/80">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Fornecedor
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <StaggeredGrid columns={3} staggerDelay={60} animation="scale-in">
            {filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onEdit={handleOpenForm}
                onDelete={setDeleteVendor}
                onViewDetails={setDetailVendor}
                onStartAssessment={handleStartAssessment}
              />
            ))}
          </StaggeredGrid>
        )}
      </AnimatedItem>

      {/* Form Dialog */}
      <VendorForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        vendor={selectedVendor}
        defaultCode={nextCode || ''}
        onSubmit={handleSubmit}
        isLoading={createVendor.isPending || updateVendor.isPending}
      />

      {/* Detail Sheet */}
      <VendorDetailSheet
        open={!!detailVendor}
        onOpenChange={(open) => !open && setDetailVendor(null)}
        vendor={detailVendor}
        onEdit={(v) => {
          setDetailVendor(null);
          handleOpenForm(v);
        }}
        onStartAssessment={handleStartAssessment}
      />

      {/* Start Assessment Dialog */}
      <StartAssessmentDialog
        open={!!assessmentVendor}
        onOpenChange={(open) => !open && setAssessmentVendor(null)}
        vendor={assessmentVendor}
        onAssessmentStarted={handleAssessmentStarted}
        onContinueAssessment={handleContinueAssessment}
      />

      {/* Assessment Form */}
      <VendorAssessmentForm
        open={!!assessmentFormVendor && !!activeAssessment}
        onOpenChange={(open) => {
          if (!open) {
            setAssessmentFormVendor(null);
            setActiveAssessment(null);
          }
        }}
        vendor={assessmentFormVendor}
        assessment={activeAssessment}
        onComplete={() => {
          setAssessmentFormVendor(null);
          setActiveAssessment(null);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteVendor} onOpenChange={(open) => !open && setDeleteVendor(null)}>
        <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-space">Excluir Fornecedor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor "{deleteVendor?.code} - {deleteVendor?.name}"? 
              Esta ação não pode ser desfeita e todas as avaliações relacionadas serão removidas.
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
