import { useState, useCallback } from 'react';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import { useControls, useControlsByCategory } from '@/hooks/useControls';
import { useAssessments, useUpsertAssessment, useResetAssessments, useBulkUpsertAssessments } from '@/hooks/useAssessments';
import { ControlCardExpanded } from '@/components/diagnostico/ControlCardExpanded';
import { ControlsTable } from '@/components/diagnostico/ControlsTable';
import { DiagnosticStats } from '@/components/diagnostico/DiagnosticStats';
import { DiagnosticActionBar } from '@/components/diagnostico/DiagnosticActionBar';
import { StatusFilter, StatusFilterValue } from '@/components/diagnostico/StatusFilter';
import { CategoryProgress } from '@/components/diagnostico/CategoryProgress';
import { RiskMethodologyInfo } from '@/components/shared/RiskMethodologyInfo';
import { CriticalRiskAlert } from '@/components/diagnostico/CriticalRiskAlert';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton, SkeletonMetric, SkeletonCard, PageLoader } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, FolderOpen, ClipboardCheck, LayoutGrid, Table2, Calculator } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import { AnimatedItem, StaggeredList } from '@/components/ui/staggered-list';

type MaturityLevel = Database['public']['Enums']['maturity_level'];

type ViewMode = 'cards' | 'table';

// Pending change type for tracking unsaved edits
interface PendingChange {
  controlId: string;
  maturityLevel: MaturityLevel;
  observations?: string;
}

export default function Diagnostico() {
  const { currentFramework } = useFrameworkContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [savingControlId, setSavingControlId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const { data: controls = [], isLoading: loadingControls } = useControls();
  const { data: assessments = [], isLoading: loadingAssessments } = useAssessments();
  const upsertAssessment = useUpsertAssessment();
  const resetAssessments = useResetAssessments();
  const bulkUpsert = useBulkUpsertAssessments();

  // Map assessments by control ID for quick lookup
  const assessmentMap = new Map(
    assessments.map((a) => [a.control_id, a])
  );

  // Calculate filter counts
  const filterCounts = {
    all: controls.length,
    conforme: assessments.filter((a) => a.status === 'conforme').length,
    parcial: assessments.filter((a) => a.status === 'parcial').length,
    naoConforme: assessments.filter((a) => a.status === 'nao_conforme').length,
    pending: controls.filter((c) => !assessmentMap.has(c.id)).length,
  };

  // Filter controls by search query
  let filteredControls = controls.filter(
    (control) =>
      control.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter by status
  if (statusFilter !== 'all') {
    if (statusFilter === 'pending') {
      filteredControls = filteredControls.filter((c) => !assessmentMap.has(c.id));
    } else {
      filteredControls = filteredControls.filter((c) => {
        const assessment = assessmentMap.get(c.id);
        return assessment?.status === statusFilter;
      });
    }
  }

  // Group by category
  const categories = useControlsByCategory(filteredControls);

  const handleSaveAssessment = async ({
    controlId,
    maturityLevel,
    observations,
  }: {
    controlId: string;
    maturityLevel: MaturityLevel;
    observations?: string;
  }) => {
    setSavingControlId(controlId);
    try {
      await upsertAssessment.mutateAsync({
        controlId,
        maturityLevel,
        observations,
      });
      toast.success('Avaliação salva com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar avaliação');
    } finally {
      setSavingControlId(null);
    }
  };

  const handleEditControl = (control: any, assessment: any) => {
    const element = document.getElementById(`control-${control.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Bulk save all pending changes
  const handleBulkSave = useCallback(async () => {
    if (pendingChanges.size === 0) return;

    setIsBulkSaving(true);
    try {
      const changes = Array.from(pendingChanges.values()).map((c) => ({
        control_id: c.controlId,
        maturity_level: c.maturityLevel,
        observations: c.observations,
      }));

      await bulkUpsert.mutateAsync(changes);
      setPendingChanges(new Map());
      toast.success(`${changes.length} avaliações salvas com sucesso`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar avaliações');
    } finally {
      setIsBulkSaving(false);
    }
  }, [pendingChanges, bulkUpsert]);

  // Reset all assessments
  const handleReset = useCallback(async () => {
    try {
      await resetAssessments.mutateAsync();
      setPendingChanges(new Map());
      toast.success('Todas as avaliações foram resetadas');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao resetar avaliações');
    }
  }, [resetAssessments]);

  // Generate random assessments
  const handleGenerateRandom = useCallback(async () => {
    if (controls.length === 0) return;

    const maturityLevels: MaturityLevel[] = ['0', '1', '2', '3', '4', '5'];
    const randomData = controls.map((control) => ({
      control_id: control.id,
      maturity_level: maturityLevels[Math.floor(Math.random() * maturityLevels.length)],
    }));

    setIsBulkSaving(true);
    try {
      await bulkUpsert.mutateAsync(randomData);
      setPendingChanges(new Map());
      toast.success(`${controls.length} avaliações geradas aleatoriamente`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar dados aleatórios');
    } finally {
      setIsBulkSaving(false);
    }
  }, [controls, bulkUpsert]);

  // Restore from snapshot
  const handleRestoreSnapshot = useCallback(async (snapshotData: unknown[]) => {
    if (!Array.isArray(snapshotData)) return;

    type ConformityStatus = Database['public']['Enums']['conformity_status'];

    const validData = snapshotData.map((item: any) => ({
      control_id: item.control_id as string,
      maturity_level: item.maturity_level as MaturityLevel,
      target_maturity: item.target_maturity as MaturityLevel | undefined,
      status: item.status as ConformityStatus | undefined,
      observations: item.observations as string | null | undefined,
    }));

    setIsBulkSaving(true);
    try {
      await bulkUpsert.mutateAsync(validData);
      setPendingChanges(new Map());
      toast.success('Versão restaurada com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao restaurar versão');
    } finally {
      setIsBulkSaving(false);
    }
  }, [bulkUpsert]);

  const isLoading = loadingControls || loadingAssessments;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Cosmic background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-chart-2/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <AnimatedItem animation="fade-up" delay={0}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-7 h-7 text-primary" />
              Diagnóstico de Controles
            </h1>
            <p className="text-muted-foreground mt-1">
              Avalie o nível de maturidade dos controles de segurança
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentFramework && (
              <Badge variant="outline" className="text-sm px-3 py-1.5">
                {currentFramework.name}
                {currentFramework.version && ` v${currentFramework.version}`}
              </Badge>
            )}
            {/* Risk Methodology Info */}
            <RiskMethodologyInfo
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  <span className="hidden sm:inline">Metodologia</span>
                </Button>
              }
            />
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('cards')}
                className={cn(
                  'rounded-r-none h-8',
                  viewMode === 'cards' && 'bg-muted'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('table')}
                className={cn(
                  'rounded-l-none h-8',
                  viewMode === 'table' && 'bg-muted'
                )}
              >
                <Table2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </AnimatedItem>

      {/* Cosmic Loading state */}
      {isLoading && (
        <div className="space-y-6">
          {/* Stats skeletons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonMetric key={i} />
            ))}
          </div>
          {/* Filter skeleton */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="shimmer" className="h-9 w-24 rounded-full" />
              ))}
            </div>
            <Skeleton variant="shimmer" className="h-10 w-80" />
          </div>
          {/* Cards skeletons */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton variant="cosmic" className="h-5 w-5 rounded" />
                  <Skeleton variant="shimmer" className="h-5 w-48" />
                  <Skeleton variant="shimmer" className="h-4 w-24" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((j) => (
                    <SkeletonCard key={j} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls list */}
      {!isLoading && (
        <>
          {/* Action Bar */}
          <AnimatedItem animation="fade-up" delay={50}>
            <DiagnosticActionBar
              onSave={handleBulkSave}
              onReset={handleReset}
              onGenerateRandom={handleGenerateRandom}
              onRestoreSnapshot={handleRestoreSnapshot}
              isSaving={isBulkSaving}
              hasChanges={pendingChanges.size > 0}
            />
          </AnimatedItem>

          {/* Critical Risk Alert */}
          <AnimatedItem animation="fade-up" delay={100}>
            <CriticalRiskAlert 
              controls={controls} 
              assessments={assessments}
              onFilterCritical={() => setStatusFilter('nao_conforme')}
            />
          </AnimatedItem>

          {/* Stats */}
          <AnimatedItem animation="fade-up" delay={150}>
            <DiagnosticStats controls={controls} assessments={assessments} />
          </AnimatedItem>

          {/* Filters Row */}
          <AnimatedItem animation="fade-up" delay={200}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Status Filter */}
              <StatusFilter
                value={statusFilter}
                onChange={setStatusFilter}
                counts={filterCounts}
              />

              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar controles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </AnimatedItem>

          {/* Empty state for no controls */}
          {controls.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum controle encontrado
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Este framework ainda não possui controles cadastrados.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty state for no search/filter results */}
          {controls.length > 0 && filteredControls.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">
                  Nenhum controle encontrado com os filtros aplicados
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Limpar filtros
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Table View */}
          {viewMode === 'table' && filteredControls.length > 0 && (
            <AnimatedItem animation="fade-up" delay={250}>
              <ControlsTable
                controls={filteredControls}
                assessments={assessments}
                onEditControl={handleEditControl}
              />
            </AnimatedItem>
          )}

          {/* Cards View - Controls by category */}
          {viewMode === 'cards' && categories.length > 0 && (
            <StaggeredList staggerDelay={75} initialDelay={250} animation="fade-up" className="space-y-4">
              <Accordion type="multiple" defaultValue={categories.map((c) => c.name)} className="space-y-4">
                {categories.map((category, categoryIndex) => (
                  <AccordionItem
                    key={category.name}
                    value={category.name}
                    className="border rounded-lg bg-card/80 backdrop-blur-sm"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        <FolderOpen className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({category.controls.length} controles)
                        </span>
                        <CategoryProgress
                          category={category.name}
                          controls={controls}
                          assessments={assessments}
                        />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <StaggeredList staggerDelay={50} animation="scale-in" className="grid gap-4 md:grid-cols-2">
                        {category.controls.map((control) => (
                          <div key={control.id} id={`control-${control.id}`}>
                            <ControlCardExpanded
                              control={control}
                              assessment={assessmentMap.get(control.id)}
                              onSave={handleSaveAssessment}
                              isSaving={savingControlId === control.id}
                            />
                          </div>
                        ))}
                      </StaggeredList>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </StaggeredList>
          )}
        </>
      )}
    </div>
  );
}
