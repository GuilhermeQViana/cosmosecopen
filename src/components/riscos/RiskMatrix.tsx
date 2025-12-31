import { Risk, calculateRiskLevel, getRiskLevelColor } from '@/hooks/useRisks';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RiskMatrixProps {
  risks: Risk[];
  onRiskClick?: (risk: Risk) => void;
  showResidual?: boolean;
}

const PROBABILITY_LABELS = ['Muito Baixa', 'Baixa', 'Média', 'Alta', 'Muito Alta'];
const IMPACT_LABELS = ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];

export function RiskMatrix({ risks, onRiskClick, showResidual = false }: RiskMatrixProps) {
  const getMatrixCellColor = (prob: number, impact: number): string => {
    const level = prob * impact;
    if (level >= 20) return 'bg-red-500/80';
    if (level >= 12) return 'bg-orange-500/80';
    if (level >= 6) return 'bg-yellow-500/80';
    if (level >= 3) return 'bg-lime-500/80';
    return 'bg-green-500/80';
  };

  const getRisksInCell = (prob: number, impact: number): Risk[] => {
    return risks.filter((risk) => {
      const p = showResidual ? (risk.residual_probability ?? risk.inherent_probability) : risk.inherent_probability;
      const i = showResidual ? (risk.residual_impact ?? risk.inherent_impact) : risk.inherent_impact;
      return p === prob && i === impact;
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Y-axis label */}
        <div className="flex">
          <div className="w-24 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground -rotate-90 whitespace-nowrap">
              Probabilidade
            </span>
          </div>
          <div className="flex-1">
            {/* Matrix grid */}
            <div className="grid grid-cols-5 gap-1">
              {/* Rows from top (5) to bottom (1) */}
              {[5, 4, 3, 2, 1].map((prob) => (
                <div key={prob} className="contents">
                  {[1, 2, 3, 4, 5].map((impact) => {
                    const cellRisks = getRisksInCell(prob, impact);
                    return (
                      <div
                        key={`${prob}-${impact}`}
                        className={cn(
                          'aspect-square rounded-md flex items-center justify-center relative transition-all',
                          getMatrixCellColor(prob, impact),
                          'hover:ring-2 hover:ring-primary hover:ring-offset-2'
                        )}
                      >
                        {cellRisks.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => cellRisks.length === 1 && onRiskClick?.(cellRisks[0])}
                                className="w-full h-full flex items-center justify-center"
                              >
                                <div className="bg-background/90 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-foreground shadow-lg">
                                  {cellRisks.length}
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <div className="space-y-1">
                                {cellRisks.map((risk) => (
                                  <div
                                    key={risk.id}
                                    className="text-sm cursor-pointer hover:underline"
                                    onClick={() => onRiskClick?.(risk)}
                                  >
                                    <span className="font-medium">{risk.code}:</span> {risk.title}
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
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/80" />
            <span className="text-xs text-muted-foreground">Muito Baixo (1-2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-lime-500/80" />
            <span className="text-xs text-muted-foreground">Baixo (3-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500/80" />
            <span className="text-xs text-muted-foreground">Médio (6-11)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500/80" />
            <span className="text-xs text-muted-foreground">Alto (12-19)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/80" />
            <span className="text-xs text-muted-foreground">Crítico (20-25)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
