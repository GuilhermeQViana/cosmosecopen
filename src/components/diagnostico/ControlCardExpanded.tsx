import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { MaturitySlider } from './MaturitySlider';
import { RiskScoreBadge } from './RiskScoreBadge';
import { ControlEvidencesList } from './ControlEvidencesList';
import { ControlActionPlans } from './ControlActionPlans';
import { AssessmentComments } from './AssessmentComments';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Save,
  Loader2,
  AlertTriangle,
  Zap,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type MaturityLevel = Database['public']['Enums']['maturity_level'];

interface ControlCardExpandedProps {
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

const CRITICALITY_CONFIG: Record<string, { label: string; className: string }> = {
  baixo: {
    label: 'Baixo',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  medio: {
    label: 'Médio',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  },
  alto: {
    label: 'Alto',
    className: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  },
  critico: {
    label: 'Crítico',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

const MATURITY_DESCRIPTIONS: Record<number, { label: string; description: string }> = {
  0: { label: 'Inexistente', description: 'Nenhum processo definido ou implementado' },
  1: { label: 'Inicial', description: 'Processos ad-hoc e não documentados' },
  2: { label: 'Repetível', description: 'Processos definidos mas não padronizados' },
  3: { label: 'Definido', description: 'Processos documentados e padronizados' },
  4: { label: 'Gerenciado', description: 'Processos medidos e controlados' },
  5: { label: 'Otimizado', description: 'Melhoria contínua e otimização' },
};

export function ControlCardExpanded({
  control,
  assessment,
  onSave,
  isSaving = false,
}: ControlCardExpandedProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [maturityLevel, setMaturityLevel] = useState<number>(
    assessment ? parseInt(assessment.maturity_level) : 0
  );
  const [observations, setObservations] = useState(
    assessment?.observations || ''
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Sync with assessment updates
  useEffect(() => {
    if (assessment) {
      setMaturityLevel(parseInt(assessment.maturity_level));
      setObservations(assessment.observations || '');
    }
  }, [assessment]);

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

  const status = assessment?.status || 'nao_conforme';
  const statusConfig = STATUS_CONFIG[status];
  const isCritical = control.criticality === 'critico';
  const criticalityConfig = control.criticality ? CRITICALITY_CONFIG[control.criticality] : null;
  const targetMaturity = assessment ? parseInt(assessment.target_maturity) : 3;
  const maturityInfo = MATURITY_DESCRIPTIONS[maturityLevel];

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        expanded && 'ring-1 ring-primary/20 shadow-lg',
        isCritical && 'border-destructive/30'
      )}
    >
      {/* Header */}
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badges Row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <code className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                {control.code}
              </code>
              {control.weight && control.weight > 1 && (
                <Badge variant="outline" className="text-xs">
                  Peso: {control.weight}
                </Badge>
              )}
              {criticalityConfig && (
                <Badge
                  variant="outline"
                  className={cn('text-xs', criticalityConfig.className)}
                >
                  {isCritical && <Zap className="w-3 h-3 mr-1" />}
                  {criticalityConfig.label}
                </Badge>
              )}
              <Badge variant="outline" className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-medium text-sm text-foreground leading-tight flex items-center gap-2">
              {isCritical && (
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
              )}
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

      <CardContent className="p-4 pt-2 space-y-4">
        {/* Details Section (always visible if has content) */}
        {(control.category || control.weight_reason || control.implementation_example || control.evidence_example) && expanded && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
            {control.category && (
              <div>
                <span className="font-medium text-foreground">Categoria:</span>{' '}
                <span className="text-muted-foreground">{control.category}</span>
              </div>
            )}
            {control.weight_reason && (
              <div>
                <span className="font-medium text-foreground">Motivo do Peso:</span>{' '}
                <span className="text-muted-foreground">{control.weight_reason}</span>
              </div>
            )}
            {control.implementation_example && (
              <div>
                <span className="font-medium text-foreground">Exemplo de Implementação:</span>{' '}
                <span className="text-muted-foreground">{control.implementation_example}</span>
              </div>
            )}
            {control.evidence_example && (
              <div>
                <span className="font-medium text-foreground">Exemplo de Evidência:</span>{' '}
                <span className="text-muted-foreground">{control.evidence_example}</span>
              </div>
            )}
          </div>
        )}

        {/* Maturity Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Nível de Maturidade</span>
            {control.weight && control.weight > 1 && (
              <Badge variant="secondary" className="text-xs">
                Peso: Alto ({control.weight})
              </Badge>
            )}
          </div>
          
          <MaturitySlider
            value={maturityLevel}
            target={targetMaturity}
            onChange={handleMaturityChange}
            showLabels={expanded}
          />
        </div>

        {/* Maturity Info Box & Risk Score */}
        {expanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Info className="w-4 h-4" />
                {maturityInfo.label}
              </div>
              <p className="text-xs text-muted-foreground">
                {maturityInfo.description}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border flex items-center justify-center">
              <RiskScoreBadge
                maturityLevel={maturityLevel}
                targetMaturity={targetMaturity}
                weight={control.weight}
                criticality={control.criticality}
              />
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-4 animate-fade-in">
            {/* Description */}
            {control.description && (
              <p className="text-sm text-muted-foreground">
                {control.description}
              </p>
            )}

            {/* Observations */}
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

            <Separator />

            {/* Evidences Section */}
            <ControlEvidencesList
              assessmentId={assessment?.id}
              controlCode={control.code}
            />

            <Separator />

            {/* Action Plans Section */}
            <ControlActionPlans
              assessmentId={assessment?.id}
              controlCode={control.code}
              controlName={control.name}
            />

            <Separator />

            {/* Comments Section */}
            <AssessmentComments assessmentId={assessment?.id} />

            {/* Save Button */}
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
