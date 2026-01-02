import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MaturitySlider } from './MaturitySlider';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import { 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Save, 
  Loader2,
  AlertTriangle,
  ListTodo,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type MaturityLevel = Database['public']['Enums']['maturity_level'];

interface ControlCardProps {
  control: Control;
  assessment?: Assessment;
  onSave: (data: {
    controlId: string;
    maturityLevel: MaturityLevel;
    observations?: string;
  }) => Promise<void>;
  isSaving?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  conforme: {
    label: 'Conforme',
    className: 'badge-conforme',
  },
  parcial: {
    label: 'Parcial',
    className: 'badge-parcial',
  },
  nao_conforme: {
    label: 'Não Conforme',
    className: 'badge-nao-conforme',
  },
  nao_aplicavel: {
    label: 'N/A',
    className: 'bg-muted text-muted-foreground',
  },
};

export function ControlCard({
  control,
  assessment,
  onSave,
  isSaving = false,
}: ControlCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [maturityLevel, setMaturityLevel] = useState<number>(
    assessment ? parseInt(assessment.maturity_level) : 0
  );
  const [observations, setObservations] = useState(
    assessment?.observations || ''
  );
  const [hasChanges, setHasChanges] = useState(false);

  const handleMaturityChange = (value: number) => {
    setMaturityLevel(value);
    setHasChanges(true);
  };

  const handleObservationsChange = (value: string) => {
    setObservations(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave({
      controlId: control.id,
      maturityLevel: maturityLevel.toString() as MaturityLevel,
      observations: observations || undefined,
    });
    setHasChanges(false);
  };

  const handleCreateRisk = () => {
    // Navigate to risks page with pre-filled data from this control
    const params = new URLSearchParams({
      fromControl: control.id,
      controlCode: control.code,
      controlName: control.name,
    });
    navigate(`/riscos?${params.toString()}`);
  };

  const handleCreateActionPlan = () => {
    // Navigate to action plans page with pre-filled data from this assessment
    const params = new URLSearchParams({
      fromAssessment: assessment?.id || '',
      controlCode: control.code,
      controlName: control.name,
    });
    navigate(`/plano-acao?${params.toString()}`);
  };

  const status = assessment?.status || 'nao_conforme';
  const statusConfig = STATUS_CONFIG[status];
  const isNonConforming = status === 'nao_conforme' || status === 'parcial';

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        expanded && 'ring-1 ring-primary/20 shadow-md'
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-primary">
                {control.code}
              </code>
              <Badge variant="outline" className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>
            <h3 className="font-medium text-sm text-foreground leading-tight">
              {control.name}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <MaturitySlider
          value={maturityLevel}
          target={assessment ? parseInt(assessment.target_maturity) : 3}
          onChange={handleMaturityChange}
          showLabels={expanded}
        />

        {expanded && (
          <div className="mt-4 space-y-4 animate-fade-in">
            {control.description && (
              <p className="text-sm text-muted-foreground">
                {control.description}
              </p>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageSquare className="w-4 h-4" />
                Observações
              </label>
              <Textarea
                value={observations}
                onChange={(e) => handleObservationsChange(e.target.value)}
                placeholder="Adicione observações sobre o controle..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Contextual Actions for Non-Conforming Controls */}
            {isNonConforming && assessment && (
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  Ações Recomendadas
                </div>
                <p className="text-xs text-muted-foreground">
                  Este controle foi avaliado como {status === 'nao_conforme' ? 'não conforme' : 'parcialmente conforme'}. 
                  Considere criar um risco associado ou um plano de ação para remediar.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreateRisk}
                        className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Criar Risco
                        <ArrowRight className="w-3 h-3 ml-auto opacity-50" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Registrar um risco associado a este controle não conforme
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreateActionPlan}
                        className="flex-1 border-[hsl(var(--warning))]/30 text-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))]/10"
                      >
                        <ListTodo className="w-4 h-4 mr-2" />
                        Criar Plano de Ação
                        <ArrowRight className="w-3 h-3 ml-auto opacity-50" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Criar um plano de ação para remediar este controle
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Avaliação
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
