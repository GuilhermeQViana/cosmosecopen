import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useVendors, getRiskLevelFromScore, VENDOR_CRITICALITY } from '@/hooks/useVendors';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export function VendorRiskHeatMap() {
  const { data: vendors = [] } = useVendors();

  const heatMapData = useMemo(() => {
    const criticalityLevels = ['baixa', 'media', 'alta', 'critica'];
    const riskLevels = ['baixo', 'medio', 'alto', 'critico'];
    
    const matrix: Record<string, Record<string, typeof vendors>> = {};
    
    criticalityLevels.forEach(crit => {
      matrix[crit] = {};
      riskLevels.forEach(risk => {
        matrix[crit][risk] = [];
      });
    });

    vendors.forEach(vendor => {
      const criticality = vendor.criticality || 'media';
      const riskLevel = getRiskLevelFromScore(vendor.last_assessment?.overall_score ?? null);
      
      if (matrix[criticality] && matrix[criticality][riskLevel]) {
        matrix[criticality][riskLevel].push(vendor);
      }
    });

    return matrix;
  }, [vendors]);

  const getCellColor = (criticality: string, riskLevel: string, count: number) => {
    if (count === 0) return 'bg-muted/30';
    
    const criticalityScore = { baixa: 1, media: 2, alta: 3, critica: 4 };
    const riskScore = { baixo: 1, medio: 2, alto: 3, critico: 4 };
    
    const totalScore = (criticalityScore[criticality as keyof typeof criticalityScore] || 2) + 
                       (riskScore[riskLevel as keyof typeof riskScore] || 2);
    
    if (totalScore >= 7) return 'bg-red-500/60 hover:bg-red-500/80';
    if (totalScore >= 5) return 'bg-orange-500/50 hover:bg-orange-500/70';
    if (totalScore >= 3) return 'bg-amber-500/40 hover:bg-amber-500/60';
    return 'bg-green-500/30 hover:bg-green-500/50';
  };

  const criticalityLabels = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    critica: 'Crítica',
  };

  const riskLabels = {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
    critico: 'Crítico',
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Mapa de Calor de Riscos</CardTitle>
        <CardDescription>
          Distribuição de fornecedores por criticidade × nível de risco
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            {/* Header - Risk Levels */}
            <div className="flex mb-2">
              <div className="w-24 shrink-0" />
              {Object.entries(riskLabels).map(([key, label]) => (
                <div key={key} className="flex-1 text-center text-xs font-medium text-muted-foreground">
                  {label}
                </div>
              ))}
            </div>

            {/* Rows - Criticality Levels */}
            <TooltipProvider>
              {Object.entries(criticalityLabels).reverse().map(([criticality, critLabel]) => (
                <div key={criticality} className="flex mb-1">
                  <div className="w-24 shrink-0 flex items-center text-xs font-medium text-muted-foreground">
                    {critLabel}
                  </div>
                  {Object.entries(riskLabels).map(([risk, riskLabel]) => {
                    const vendorsInCell = heatMapData[criticality]?.[risk] || [];
                    const count = vendorsInCell.length;
                    
                    return (
                      <Tooltip key={risk}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'flex-1 h-14 mx-0.5 rounded-md flex items-center justify-center transition-colors cursor-pointer',
                              getCellColor(criticality, risk, count)
                            )}
                          >
                            {count > 0 && (
                              <span className="text-sm font-bold text-foreground/90">
                                {count}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium">
                              Criticidade {critLabel} × Risco {riskLabel}
                            </p>
                            {count === 0 ? (
                              <p className="text-xs text-muted-foreground">Nenhum fornecedor</p>
                            ) : (
                              <div className="text-xs">
                                <p className="mb-1">{count} fornecedor(es):</p>
                                <ul className="list-disc list-inside">
                                  {vendorsInCell.slice(0, 5).map(v => (
                                    <li key={v.id}>{v.name}</li>
                                  ))}
                                  {count > 5 && <li>e mais {count - 5}...</li>}
                                </ul>
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </TooltipProvider>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500/30" />
                <span>Baixo</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-amber-500/40" />
                <span>Médio</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-500/50" />
                <span>Alto</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500/60" />
                <span>Crítico</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
