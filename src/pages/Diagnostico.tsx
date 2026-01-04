import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import { useControls, useControlsByCategory } from '@/hooks/useControls';
import { useAssessments, useUpsertAssessment, useResetAssessments, useBulkUpsertAssessments } from '@/hooks/useAssessments';
import { ControlCardExpanded } from '@/components/diagnostico/ControlCardExpanded';
import { ControlsTable } from '@/components/diagnostico/ControlsTable';
import { DiagnosticStats } from '@/components/diagnostico/DiagnosticStats';
import { DiagnosticActionBar } from '@/components/diagnostico/DiagnosticActionBar';
import { StatusFilter, StatusFilterValue } from '@/components/diagnostico/StatusFilter';
import { AdvancedFiltersPanel, AdvancedFilters } from '@/components/diagnostico/AdvancedFiltersPanel';
import { SortDropdown, useSortPreference } from '@/components/diagnostico/SortDropdown';
import { CategoryProgress } from '@/components/diagnostico/CategoryProgress';
import { CategoryDashboard } from '@/components/diagnostico/CategoryDashboard';
import { RiskMethodologyInfo } from '@/components/shared/RiskMethodologyInfo';
import { CriticalRiskAlert } from '@/components/diagnostico/CriticalRiskAlert';
import { GenerateAIPlansDialog } from '@/components/diagnostico/GenerateAIPlansDialog';
import { BulkEditToolbar, BulkEditDialog } from '@/components/diagnostico/BulkEditControls';
import { useDragAndDrop, DragHandle, DraggableControlList, ResetOrderButton } from '@/components/diagnostico/DraggableControlList';
import { useNonConformingControls } from '@/hooks/useGenerateActionPlans';
import { useAdvancedControlFilters } from '@/hooks/useControlFilterData';
import { useSortedControls } from '@/hooks/useSortedControls';
import {
  useEvidenceCountsByAssessment,
  useActionPlanCountsByAssessment,
  useCommentCountsByAssessment,
  useProblematicControls,
} from '@/hooks/useControlIndicators';
import { useDiagnosticKeyboardNav } from '@/hooks/useDiagnosticKeyboardNav';
import { calculateRiskScore } from '@/lib/risk-methodology';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton, SkeletonMetric, SkeletonCard, PageLoader } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, FolderOpen, ClipboardCheck, LayoutGrid, Table2, Calculator, BarChart3 } from 'lucide-react';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [savingControlId, setSavingControlId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    riskScore: [],
    weight: [],
    hasEvidence: null,
    hasActionPlan: null,
  });
  const [sortOption, setSortOption] = useSortPreference();
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [selectedControlIds, setSelectedControlIds] = useState<Set<string>>(new Set());
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [aiPlansDialogOpen, setAiPlansDialogOpen] = useState(false);
  const [expandedCategoryDashboard, setExpandedCategoryDashboard] = useState<string | null>(null);
  const [controlsForAIGeneration, setControlsForAIGeneration] = useState<Array<{
    controlId: string;
    assessmentId: string;
    controlCode: string;
    controlName: string;
    controlDescription: string | null;
    currentMaturity: number;
    targetMaturity: number;
  }>>([]);

  const { findNonConformingWithoutPlans } = useNonConformingControls();

  const { data: controls = [], isLoading: loadingControls } = useControls();
  const { data: assessments = [], isLoading: loadingAssessments } = useAssessments();
  const upsertAssessment = useUpsertAssessment();
  const resetAssessments = useResetAssessments();
  const bulkUpsert = useBulkUpsertAssessments();

  // Indicator counts
  const { data: evidenceCounts = {} } = useEvidenceCountsByAssessment();
  const actionPlanCounts = useActionPlanCountsByAssessment();
  const { data: commentCounts = {} } = useCommentCountsByAssessment();
  const problematicControlIds = useProblematicControls(assessments);

  // Handle URL parameter for direct control navigation
  useEffect(() => {
    const controlCode = searchParams.get('control');
    if (controlCode && controls.length > 0) {
      // Find the control by code
      const targetControl = controls.find(c => c.code === controlCode);
      if (targetControl) {
        // Clear the URL parameter
        setSearchParams({});
        
        // Set search to find the control
        setSearchQuery(controlCode);
        
        // Scroll to the control after a short delay to allow rendering
        setTimeout(() => {
          const element = document.getElementById(`control-${targetControl.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a highlight effect
            element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
            }, 3000);
          }
        }, 300);
      }
    }
  }, [searchParams, controls, setSearchParams]);

  // Map assessments by control ID for quick lookup
  const assessmentMap = useMemo(() => 
    new Map(assessments.map((a) => [a.control_id, a])),
    [assessments]
  );

  // Apply advanced filters
  const { filteredControls: advancedFilteredControls, filterMetrics } = useAdvancedControlFilters(
    controls,
    assessments,
    advancedFilters
  );

  // Calculate filter counts
  const filterCounts = {
    all: controls.length,
    conforme: assessments.filter((a) => a.status === 'conforme').length,
    parcial: assessments.filter((a) => a.status === 'parcial').length,
    naoConforme: assessments.filter((a) => a.status === 'nao_conforme').length,
    pending: controls.filter((c) => !assessmentMap.has(c.id)).length,
  };

  // Filter controls by search query (on top of advanced filters)
  let filteredControls = advancedFilteredControls.filter(
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

  // Apply sorting
  const sortedControls = useSortedControls(filteredControls, assessments, sortOption);

  // Group by category
  const categories = useControlsByCategory(sortedControls);

  // Drag and drop for reordering
  const {
    hasCustomOrder,
    handleReorder,
    handleReset: handleResetOrder,
    getOrderedIds,
  } = useDragAndDrop(
    sortedControls.map(c => c.id),
    'diagnostic-control-order'
  );

  // Get category data with risk scores for dashboard
  const getCategoryControlData = useCallback((categoryControls: typeof controls) => {
    return categoryControls.map(control => {
      const assessment = assessmentMap.get(control.id);
      const maturityLevel = assessment ? parseInt(assessment.maturity_level) : 0;
      const targetMaturity = assessment ? parseInt(assessment.target_maturity) : 3;
      const weight = control.weight || 1;
      const riskScore = calculateRiskScore(maturityLevel, targetMaturity, weight);

      return {
        id: control.id,
        code: control.code,
        name: control.name,
        weight,
        maturity_level: assessment?.maturity_level || '0',
        target_maturity: assessment?.target_maturity || '3',
        status: assessment?.status || 'nao_conforme',
        riskScore,
      };
    });
  }, [assessmentMap]);

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
      
      // After saving, check for non-conforming controls that need AI plans
      await checkForAIGeneration();
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

  // Check for non-conforming controls and trigger AI dialog
  const checkForAIGeneration = useCallback(async () => {
    console.log('[AI Plans] Checking for controls that need AI plans...');
    const eligibleControls = await findNonConformingWithoutPlans();
    console.log('[AI Plans] Eligible controls:', eligibleControls.length);
    if (eligibleControls.length > 0) {
      setControlsForAIGeneration(eligibleControls);
      setAiPlansDialogOpen(true);
    }
  }, [findNonConformingWithoutPlans]);

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
      
      // After saving, check for non-conforming controls
      // Now fetches fresh data directly from database
      await checkForAIGeneration();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar avaliações');
    } finally {
      setIsBulkSaving(false);
    }
  }, [pendingChanges, bulkUpsert, checkForAIGeneration]);

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

  // Bulk selection handlers
  const handleToggleSelection = useCallback((controlId: string, selected: boolean) => {
    setSelectedControlIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(controlId);
      } else {
        newSet.delete(controlId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedControlIds(new Set(sortedControls.map(c => c.id)));
  }, [sortedControls]);

  const handleDeselectAll = useCallback(() => {
    setSelectedControlIds(new Set());
  }, []);

  const handleBulkEditApply = useCallback(async (data: {
    maturityLevel?: MaturityLevel;
    observations?: string;
    appendObservations?: boolean;
  }) => {
    if (selectedControlIds.size === 0) return;

    const selectedControls = controls.filter(c => selectedControlIds.has(c.id));
    const changes = selectedControls.map(control => {
      const existingAssessment = assessmentMap.get(control.id);
      let newObservations = data.observations;
      
      if (data.observations && data.appendObservations && existingAssessment?.observations) {
        newObservations = `${existingAssessment.observations}\n\n${data.observations}`;
      }

      return {
        control_id: control.id,
        maturity_level: data.maturityLevel || existingAssessment?.maturity_level || '0' as MaturityLevel,
        observations: newObservations || existingAssessment?.observations || undefined,
      };
    });

    setIsBulkSaving(true);
    try {
      await bulkUpsert.mutateAsync(changes);
      toast.success(`${changes.length} controles atualizados com sucesso`);
      setSelectedControlIds(new Set());
      setBulkEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aplicar alterações em lote');
    } finally {
      setIsBulkSaving(false);
    }
  }, [selectedControlIds, controls, assessmentMap, bulkUpsert]);

  // Keyboard navigation
  const searchInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      (window as any).__diagnosticSearchInput = node;
    }
  }, []);

  const { focusedControlId } = useDiagnosticKeyboardNav({
    controlIds: sortedControls.map(c => c.id),
    onNavigate: (controlId) => {
      const element = document.getElementById(`control-${controlId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    onExpandToggle: (controlId) => {
      // Trigger click on the control card to expand/collapse
      const element = document.getElementById(`control-${controlId}`);
      const button = element?.querySelector('button[aria-expanded], button:has(svg)');
      if (button) {
        (button as HTMLButtonElement).click();
      }
    },
    onMaturityChange: (controlId, level) => {
      // Update maturity for the focused control
      const control = controls.find(c => c.id === controlId);
      if (control) {
        handleSaveAssessment({
          controlId,
          maturityLevel: level.toString() as MaturityLevel,
        });
      }
    },
    onSave: (controlId) => {
      // Trigger save for the focused control
      toast.info('Pressione o botão Salvar no card do controle');
    },
    onNextPending: () => {
      // Find next pending control
      const pendingControl = sortedControls.find(c => !assessmentMap.has(c.id));
      if (pendingControl) {
        const element = document.getElementById(`control-${pendingControl.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          toast.info(`Navegando para: ${pendingControl.code}`);
        }
      } else {
        toast.info('Não há controles pendentes');
      }
    },
    onFocusSearch: () => {
      const searchInput = (window as any).__diagnosticSearchInput;
      if (searchInput) {
        searchInput.focus();
      }
    },
    enabled: viewMode === 'cards',
  });

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
              onGenerateAIPlans={checkForAIGeneration}
              isSaving={isBulkSaving}
              hasChanges={pendingChanges.size > 0}
              hasNonConforming={assessments.some(a => a.status === 'nao_conforme' || a.status === 'parcial')}
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
            <div className="space-y-3">
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
                    ref={searchInputRef}
                    placeholder="Buscar controles... (pressione /)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Advanced Filters and Sort */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <AdvancedFiltersPanel
                  filters={advancedFilters}
                  onChange={setAdvancedFilters}
                  evidenceCounts={filterMetrics.evidenceCounts}
                  actionPlanCounts={filterMetrics.actionPlanCounts}
                />
                <SortDropdown value={sortOption} onChange={setSortOption} />
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
                    setAdvancedFilters({
                      riskScore: [],
                      weight: [],
                      hasEvidence: null,
                      hasActionPlan: null,
                    });
                  }}
                >
                  Limpar filtros
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Table View */}
          {viewMode === 'table' && sortedControls.length > 0 && (
            <AnimatedItem animation="fade-up" delay={250}>
              <ControlsTable
                controls={sortedControls}
                assessments={assessments}
                onEditControl={handleEditControl}
              />
            </AnimatedItem>
          )}

          {/* Cards View - Controls by category */}
          {viewMode === 'cards' && categories.length > 0 && (
            <StaggeredList staggerDelay={75} initialDelay={250} animation="fade-up" className="space-y-4">
              {/* Reset Order Button */}
              {hasCustomOrder && (
                <div className="flex justify-end">
                  <ResetOrderButton hasCustomOrder={hasCustomOrder} onReset={handleResetOrder} />
                </div>
              )}
              <Accordion type="multiple" defaultValue={categories.map((c) => c.name)} className="space-y-4">
                {categories.map((category, categoryIndex) => {
                  const categoryControlData = getCategoryControlData(category.controls);
                  const orderedControlIds = getOrderedIds(category.controls.map(c => c.id));
                  const orderedControls = orderedControlIds
                    .map(id => category.controls.find(c => c.id === id))
                    .filter(Boolean) as typeof category.controls;

                  return (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto mr-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedCategoryDashboard(
                                expandedCategoryDashboard === category.name ? null : category.name
                              );
                            }}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {/* Category Dashboard */}
                        {expandedCategoryDashboard === category.name && (
                          <div className="mb-4">
                            <CategoryDashboard
                              categoryName={category.name}
                              controls={categoryControlData}
                              onControlClick={(controlId) => {
                                const element = document.getElementById(`control-${controlId}`);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }}
                            />
                          </div>
                        )}
                        <StaggeredList staggerDelay={50} animation="scale-in" className="grid gap-4 md:grid-cols-2">
                          {orderedControls.map((control) => (
                            <div key={control.id} id={`control-${control.id}`} className="flex gap-2">
                              <DragHandle
                                controlId={control.id}
                                dragHandlers={DraggableControlList({
                                  controlIds: orderedControlIds,
                                  onReorder: handleReorder,
                                  onReset: handleResetOrder,
                                  hasCustomOrder,
                                })}
                                className="mt-4"
                              />
                              <div className="flex-1">
                                <ControlCardExpanded
                                  control={control}
                                  assessment={assessmentMap.get(control.id)}
                                  onSave={handleSaveAssessment}
                                  isSaving={savingControlId === control.id}
                                  evidenceCount={evidenceCounts[assessmentMap.get(control.id)?.id || ''] || 0}
                                  actionPlanCount={actionPlanCounts[assessmentMap.get(control.id)?.id || ''] || 0}
                                  commentCount={commentCounts[assessmentMap.get(control.id)?.id || ''] || 0}
                                  isProblematic={problematicControlIds.has(control.id)}
                                  showSelection={true}
                                  isSelected={selectedControlIds.has(control.id)}
                                  onSelectionChange={(selected) => handleToggleSelection(control.id, selected)}
                                />
                              </div>
                            </div>
                          ))}
                        </StaggeredList>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </StaggeredList>
          )}
        </>
      )}

      {/* Bulk Edit Toolbar */}
      <BulkEditToolbar
        selectedCount={selectedControlIds.size}
        totalCount={sortedControls.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkEdit={() => setBulkEditDialogOpen(true)}
        isAllSelected={selectedControlIds.size === sortedControls.length && sortedControls.length > 0}
      />

      {/* Bulk Edit Dialog */}
      <BulkEditDialog
        open={bulkEditDialogOpen}
        onOpenChange={setBulkEditDialogOpen}
        selectedCount={selectedControlIds.size}
        onApply={handleBulkEditApply}
        isApplying={isBulkSaving}
      />

      {/* AI Plans Generation Dialog */}
      <GenerateAIPlansDialog
        open={aiPlansDialogOpen}
        onOpenChange={setAiPlansDialogOpen}
        controls={controlsForAIGeneration}
      />
    </div>
  );
}
