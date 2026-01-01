import { useState } from 'react';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import { useControls, useControlsByCategory } from '@/hooks/useControls';
import { useAssessments, useUpsertAssessment } from '@/hooks/useAssessments';
import { ControlCard } from '@/components/diagnostico/ControlCard';
import { DiagnosticStats } from '@/components/diagnostico/DiagnosticStats';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, FolderOpen, ClipboardCheck } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Database } from '@/integrations/supabase/types';

type MaturityLevel = Database['public']['Enums']['maturity_level'];

export default function Diagnostico() {
  const { toast } = useToast();
  const { currentFramework } = useFrameworkContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [savingControlId, setSavingControlId] = useState<string | null>(null);

  // Use global framework context - no need for local state
  const { data: controls = [], isLoading: loadingControls } = useControls();
  const { data: assessments = [], isLoading: loadingAssessments } = useAssessments();
  const upsertAssessment = useUpsertAssessment();

  // Filter controls by search query
  const filteredControls = controls.filter(
    (control) =>
      control.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by category
  const categories = useControlsByCategory(filteredControls);

  // Map assessments by control ID for quick lookup
  const assessmentMap = new Map(
    assessments.map((a) => [a.control_id, a])
  );

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
        {currentFramework && (
          <Badge variant="outline" className="text-sm px-3 py-1.5">
            {currentFramework.name}
            {currentFramework.version && ` v${currentFramework.version}`}
          </Badge>
        )}
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

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar controles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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

          {/* Empty state for no search results */}
          {controls.length > 0 && filteredControls.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">
                  Nenhum controle encontrado para "{searchQuery}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Controls by category */}
          {categories.length > 0 && (
            <Accordion type="multiple" defaultValue={categories.map((c) => c.name)} className="space-y-4">
              {categories.map((category) => (
                <AccordionItem
                  key={category.name}
                  value={category.name}
                  className="border rounded-lg bg-card"
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({category.controls.length} controles)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {category.controls.map((control) => (
                        <ControlCard
                          key={control.id}
                          control={control}
                          assessment={assessmentMap.get(control.id)}
                          onSave={handleSaveAssessment}
                          isSaving={savingControlId === control.id}
                        />
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
