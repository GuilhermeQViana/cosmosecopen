import { useState } from 'react';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import { useControls, useControlsByCategory } from '@/hooks/useControls';
import { useAssessments, useUpsertAssessment } from '@/hooks/useAssessments';
import { ControlCard } from '@/components/diagnostico/ControlCard';
import { ControlsTable } from '@/components/diagnostico/ControlsTable';
import { DiagnosticStats } from '@/components/diagnostico/DiagnosticStats';
import { StatusFilter, StatusFilterValue } from '@/components/diagnostico/StatusFilter';
import { CategoryProgress } from '@/components/diagnostico/CategoryProgress';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, FolderOpen, ClipboardCheck, LayoutGrid, Table2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type MaturityLevel = Database['public']['Enums']['maturity_level'];

type ViewMode = 'cards' | 'table';

export default function Diagnostico() {
  const { toast } = useToast();
  const { currentFramework } = useFrameworkContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [savingControlId, setSavingControlId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');

  const { data: controls = [], isLoading: loadingControls } = useControls();
  const { data: assessments = [], isLoading: loadingAssessments } = useAssessments();
  const upsertAssessment = useUpsertAssessment();

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
      toast({
        title: 'Avaliação salva',
        description: 'A avaliação do controle foi atualizada com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSavingControlId(null);
    }
  };

  const handleEditControl = (control: any, assessment: any) => {
    // Find the accordion item and expand it, or show a modal
    // For now, we'll scroll to the control
    const element = document.getElementById(`control-${control.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const isLoading = loadingControls || loadingAssessments;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-10" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      )}

      {/* Controls list */}
      {!isLoading && (
        <>
          {/* Stats */}
          <DiagnosticStats controls={controls} assessments={assessments} />

          {/* Filters Row */}
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
            <ControlsTable
              controls={filteredControls}
              assessments={assessments}
              onEditControl={handleEditControl}
            />
          )}

          {/* Cards View - Controls by category */}
          {viewMode === 'cards' && categories.length > 0 && (
            <Accordion type="multiple" defaultValue={categories.map((c) => c.name)} className="space-y-4">
              {categories.map((category) => (
                <AccordionItem
                  key={category.name}
                  value={category.name}
                  className="border rounded-lg bg-card"
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
                    <div className="grid gap-4 md:grid-cols-2">
                      {category.controls.map((control) => (
                        <div key={control.id} id={`control-${control.id}`}>
                          <ControlCard
                            control={control}
                            assessment={assessmentMap.get(control.id)}
                            onSave={handleSaveAssessment}
                            isSaving={savingControlId === control.id}
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </>
      )}
    </div>
  );
}
