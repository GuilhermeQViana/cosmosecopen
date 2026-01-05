import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartSkeleton } from './ChartSkeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import type { Risk } from '@/hooks/useRisks';

interface RiskHeatmapMatrixProps {
  risks: Risk[];
  isLoading?: boolean;
}

const PROBABILITY_LABELS = ['Muito Baixa', 'Baixa', 'Média', 'Alta', 'Muito Alta'];
const IMPACT_LABELS = ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];

function getCellColor(prob: number, impact: number): string {
  const level = prob * impact;
  if (level >= 20) return 'bg-[hsl(var(--risk-critical))]';
  if (level >= 12) return 'bg-[hsl(var(--risk-high))]';
  if (level >= 6) return 'bg-[hsl(var(--risk-medium))]';
  return 'bg-[hsl(var(--risk-low))]';
}

function getCellTextColor(prob: number, impact: number): string {
  const level = prob * impact;
  if (level >= 6) return 'text-white';
  return 'text-foreground';
}

export function RiskHeatmapMatrix({ risks, isLoading }: RiskHeatmapMatrixProps) {
  const navigate = useNavigate();
  const [hoveredCell, setHoveredCell] = useState<{ prob: number; impact: number } | null>(null);

  const matrix = useMemo(() => {
    // Create 5x5 matrix with risk counts
    const grid: { count: number; risks: Risk[] }[][] = Array(5)
      .fill(null)
      .map(() =>
        Array(5)
          .fill(null)
          .map(() => ({ count: 0, risks: [] }))
      );

    risks.forEach(risk => {
      const probIndex = risk.inherent_probability - 1;
      const impactIndex = risk.inherent_impact - 1;
      if (probIndex >= 0 && probIndex < 5 && impactIndex >= 0 && impactIndex < 5) {
        grid[4 - probIndex][impactIndex].count++;
        grid[4 - probIndex][impactIndex].risks.push(risk);
      }
    });

    return grid;
  }, [risks]);

  const stats = useMemo(() => {
    let critical = 0, high = 0, medium = 0, low = 0;
    risks.forEach(r => {
      const level = r.inherent_probability * r.inherent_impact;
      if (level >= 20) critical++;
      else if (level >= 12) high++;
      else if (level >= 6) medium++;
      else low++;
    });
    return { critical, high, medium, low };
  }, [risks]);

  if (isLoading) {
    return <ChartSkeleton type="custom" height={320} />;
  }

  const handleCellClick = (prob: number, impact: number) => {
    // Navigate to risks page with filter
    navigate(`/riscos?prob=${prob}&impact=${impact}`);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Mapa de Calor de Riscos</CardTitle>
            <CardDescription>Matriz 5×5 de Probabilidade × Impacto</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-[hsl(var(--risk-critical))]/10 text-[hsl(var(--risk-critical))] border-[hsl(var(--risk-critical))]/30">
              {stats.critical} Críticos
            </Badge>
            <Badge variant="outline" className="bg-[hsl(var(--risk-high))]/10 text-[hsl(var(--risk-high))] border-[hsl(var(--risk-high))]/30">
              {stats.high} Altos
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Y-axis label */}
          <div className="flex flex-col justify-center">
            <span className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap">
              Probabilidade →
            </span>
          </div>

          <div className="flex-1">
            {/* Matrix Grid */}
            <div className="grid grid-cols-5 gap-1">
              {matrix.map((row, rowIdx) => (
                row.map((cell, colIdx) => {
                  const prob = 5 - rowIdx;
                  const impact = colIdx + 1;
                  const isHovered = hoveredCell?.prob === prob && hoveredCell?.impact === impact;
                  
                  return (
                    <TooltipProvider key={`${rowIdx}-${colIdx}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={`
                              aspect-square rounded-md flex items-center justify-center
                              text-sm font-medium transition-all duration-200
                              ${getCellColor(prob, impact)} ${getCellTextColor(prob, impact)}
                              ${isHovered ? 'ring-2 ring-primary scale-105' : ''}
                              ${cell.count > 0 ? 'cursor-pointer hover:scale-105' : 'opacity-60'}
                            `}
                            onClick={() => cell.count > 0 && handleCellClick(prob, impact)}
                            onMouseEnter={() => setHoveredCell({ prob, impact })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {cell.count > 0 ? cell.count : ''}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium">
                              P{prob} × I{impact} = {prob * impact}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {PROBABILITY_LABELS[prob - 1]} × {IMPACT_LABELS[impact - 1]}
                            </p>
                            {cell.count > 0 && (
                              <div className="pt-1 border-t border-border mt-1">
                                <p className="text-xs font-medium">{cell.count} risco(s):</p>
                                <ul className="text-xs text-muted-foreground">
                                  {cell.risks.slice(0, 3).map(r => (
                                    <li key={r.id} className="truncate">• {r.title}</li>
                                  ))}
                                  {cell.risks.length > 3 && (
                                    <li>... e mais {cell.risks.length - 3}</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })
              ))}
            </div>

            {/* X-axis label */}
            <div className="text-center mt-2">
              <span className="text-xs text-muted-foreground">Impacto →</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col justify-center gap-1 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[hsl(var(--risk-critical))]" />
              <span>Crítico</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[hsl(var(--risk-high))]" />
              <span>Alto</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[hsl(var(--risk-medium))]" />
              <span>Médio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[hsl(var(--risk-low))]" />
              <span>Baixo</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
