import { forwardRef, useMemo } from 'react';
import { Risk, calculateRiskLevel, getRiskLevelColor, getRiskLevelLabel, TREATMENT_OPTIONS } from '@/hooks/useRisks';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface RiskMatrixProps {
  risks: Risk[];
  onRiskClick?: (risk: Risk) => void;
  showResidual?: boolean;
}

const PROBABILITY_LABELS = ['Muito Baixa', 'Baixa', 'Média', 'Alta', 'Muito Alta'];
const IMPACT_LABELS = ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];

// Forward ref button component to fix the ref warning
const MatrixCellButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { count: number }
>(({ count, className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn('w-full h-full flex items-center justify-center', className)}
    {...props}
  >
    <div className="bg-background/90 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-foreground shadow-lg transition-transform duration-200 hover:scale-110">
      {count}
    </div>
  </button>
));
MatrixCellButton.displayName = 'MatrixCellButton';

export function RiskMatrix({ risks, onRiskClick, showResidual = false }: RiskMatrixProps) {
  const getMatrixCellColor = (prob: number, impact: number): string => {
    const level = prob * impact;
    if (level >= 20) return 'bg-red-500/80';
    if (level >= 12) return 'bg-orange-500/80';
    if (level >= 6) return 'bg-yellow-500/80';
    if (level >= 3) return 'bg-lime-500/80';
    return 'bg-green-500/80';
  };

  // Memoize risk positions to animate changes
  const riskPositions = useMemo(() => {
    const positions = new Map<string, { prob: number; impact: number }>();
    risks.forEach((risk) => {
      const p = showResidual ? (risk.residual_probability ?? risk.inherent_probability) : risk.inherent_probability;
      const i = showResidual ? (risk.residual_impact ?? risk.inherent_impact) : risk.inherent_impact;
      positions.set(risk.id, { prob: p, impact: i });
    });
    return positions;
  }, [risks, showResidual]);

  const getRisksInCell = (prob: number, impact: number): Risk[] => {
    return risks.filter((risk) => {
      const pos = riskPositions.get(risk.id);
      return pos?.prob === prob && pos?.impact === impact;
    });
  };

  const getTreatmentLabel = (treatment: string) => {
    return TREATMENT_OPTIONS.find(t => t.value === treatment)?.label || treatment;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Mode indicator */}
        <div className="flex items-center justify-center mb-4">
          <Badge 
            variant="outline" 
            className={cn(
              'transition-all duration-300',
              showResidual 
                ? 'bg-blue-500/10 border-blue-500/50 text-blue-600' 
                : 'bg-primary/10 border-primary/50 text-primary'
            )}
          >
            {showResidual ? 'Exibindo Risco Residual' : 'Exibindo Risco Inerente'}
          </Badge>
        </div>

        {/* Y-axis label */}
        <div className="flex">
          <div className="w-24 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground -rotate-90 whitespace-nowrap">
              Probabilidade
            </span>
          </div>
          <div className="flex-1">
            {/* Matrix grid */}
            <div 
              className="grid grid-cols-5 gap-1"
              key={showResidual ? 'residual' : 'inherent'}
            >
              {/* Rows from top (5) to bottom (1) */}
              {[5, 4, 3, 2, 1].map((prob) => (
                <div key={prob} className="contents">
                  {[1, 2, 3, 4, 5].map((impact) => {
                    const cellRisks = getRisksInCell(prob, impact);
                    const level = prob * impact;
                    return (
                      <div
                        key={`${prob}-${impact}`}
                        className={cn(
                          'aspect-square rounded-md flex items-center justify-center relative',
                          'transition-all duration-300 ease-out',
                          getMatrixCellColor(prob, impact),
                          'hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:scale-105'
                        )}
                      >
                        {/* Level indicator */}
                        <span className="absolute top-1 left-1 text-[10px] font-medium text-white/60">
                          {level}
                        </span>
                        
                        {cellRisks.length > 0 && (
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <MatrixCellButton
                                count={cellRisks.length}
                                onClick={() => cellRisks.length === 1 && onRiskClick?.(cellRisks[0])}
                                className="animate-scale-in"
                              />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs p-0">
                              <div className="p-2 space-y-2">
                                <div className="text-xs font-medium text-muted-foreground border-b pb-1">
                                  Nível {level} - {getRiskLevelLabel(level)}
                                </div>
                                {cellRisks.map((risk) => (
                                  <div
                                    key={risk.id}
                                    className="text-sm cursor-pointer hover:bg-accent rounded px-2 py-1 -mx-1 transition-colors"
                                    onClick={() => onRiskClick?.(risk)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs font-mono">
                                        {risk.code}
                                      </Badge>
                                      <Badge 
                                        variant="secondary" 
                                        className={cn(
                                          'text-xs',
                                          risk.treatment === 'mitigar' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                                          risk.treatment === 'aceitar' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
                                          risk.treatment === 'transferir' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                                          risk.treatment === 'evitar' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                        )}
                                      >
                                        {getTreatmentLabel(risk.treatment)}
                                      </Badge>
                                    </div>
                                    <p className="text-xs mt-1 text-muted-foreground line-clamp-2">
                                      {risk.title}
                                    </p>
                                    {risk.category && (
                                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                        {risk.category}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div className="grid grid-cols-5 gap-1 mt-2">
              {IMPACT_LABELS.map((label, i) => (
                <div key={i} className="text-center text-xs text-muted-foreground">
                  {label}
                </div>
              ))}
            </div>
            <div className="text-center text-xs font-medium text-muted-foreground mt-1">
              Impacto
            </div>
          </div>
        </div>

        {/* Y-axis labels on left side */}
        <div className="flex mt-2">
          <div className="w-24">
            <div className="flex flex-col-reverse gap-1">
              {PROBABILITY_LABELS.map((label, i) => (
                <div key={i} className="h-[calc((100%-4px)/5)] text-right pr-2 text-xs text-muted-foreground flex items-center justify-end" style={{ aspectRatio: '5/1' }}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          <div className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="w-4 h-4 rounded bg-green-500/80" />
            <span className="text-xs text-muted-foreground">Muito Baixo (1-2)</span>
          </div>
          <div className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="w-4 h-4 rounded bg-lime-500/80" />
            <span className="text-xs text-muted-foreground">Baixo (3-5)</span>
          </div>
          <div className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="w-4 h-4 rounded bg-yellow-500/80" />
            <span className="text-xs text-muted-foreground">Médio (6-11)</span>
          </div>
          <div className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="w-4 h-4 rounded bg-orange-500/80" />
            <span className="text-xs text-muted-foreground">Alto (12-19)</span>
          </div>
          <div className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="w-4 h-4 rounded bg-red-500/80" />
            <span className="text-xs text-muted-foreground">Crítico (20-25)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
