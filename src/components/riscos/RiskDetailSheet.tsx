import { useState } from 'react';
import { Risk, calculateRiskLevel, getRiskLevelColor, getRiskLevelLabel, TREATMENT_OPTIONS } from '@/hooks/useRisks';
import { useRiskHistory, getRiskTrend } from '@/hooks/useRiskHistory';
import { RiskHistoryTimeline } from './RiskHistoryTimeline';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Info,
  History,
  Link2,
} from 'lucide-react';

interface RiskDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk: Risk | null;
}

export function RiskDetailSheet({ open, onOpenChange, risk }: RiskDetailSheetProps) {
  const { data: history, isLoading: historyLoading } = useRiskHistory(risk?.id ?? null);
  const [activeTab, setActiveTab] = useState('details');

  if (!risk) return null;

  const inherentLevel = calculateRiskLevel(risk.inherent_probability, risk.inherent_impact);
  const residualLevel = risk.residual_probability && risk.residual_impact
    ? calculateRiskLevel(risk.residual_probability, risk.residual_impact)
    : null;

  const treatmentLabel = TREATMENT_OPTIONS.find(t => t.value === risk.treatment)?.label || risk.treatment;
  const trend = history ? getRiskTrend(history) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-mono text-xs">
              {risk.code}
            </Badge>
            {risk.category && (
              <Badge variant="secondary" className="text-xs">
                {risk.category}
              </Badge>
            )}
            {trend && (
              <Badge
                variant="outline"
                className={cn(
                  'gap-1',
                  trend === 'improving' && 'border-green-500 text-green-600',
                  trend === 'worsening' && 'border-red-500 text-red-600'
                )}
              >
                {trend === 'improving' && <TrendingDown className="h-3 w-3" />}
                {trend === 'worsening' && <TrendingUp className="h-3 w-3" />}
                {trend === 'stable' && <Minus className="h-3 w-3" />}
                {trend === 'improving' ? 'Melhorando' : trend === 'worsening' ? 'Piorando' : 'Estável'}
              </Badge>
            )}
          </div>
          <SheetTitle className="text-left">{risk.title}</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="gap-2">
              <Info className="h-4 w-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <ScrollArea className="h-[calc(100vh-250px)] pr-4">
              <div className="space-y-6">
                {risk.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Descrição</h4>
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                  </div>
                )}

                {/* Risk Levels */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Risco Inerente</h4>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-md flex items-center justify-center text-white font-bold',
                          getRiskLevelColor(inherentLevel)
                        )}
                      >
                        {inherentLevel}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{getRiskLevelLabel(inherentLevel)}</div>
                        <div className="text-muted-foreground text-xs">
                          P:{risk.inherent_probability} × I:{risk.inherent_impact}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Risco Residual</h4>
                    {residualLevel !== null ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-md flex items-center justify-center text-white font-bold',
                            getRiskLevelColor(residualLevel)
                          )}
                        >
                          {residualLevel}
                        </div>
                        <div className="text-sm">
                          <div className="font-medium flex items-center gap-1">
                            {getRiskLevelLabel(residualLevel)}
                            {residualLevel < inherentLevel && (
                              <TrendingDown className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            P:{risk.residual_probability} × I:{risk.residual_impact}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Não avaliado</p>
                    )}
                  </div>
                </div>

                {/* Treatment */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Tratamento</h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      risk.treatment === 'mitigar' && 'border-blue-500 text-blue-600',
                      risk.treatment === 'aceitar' && 'border-yellow-500 text-yellow-600',
                      risk.treatment === 'transferir' && 'border-purple-500 text-purple-600',
                      risk.treatment === 'evitar' && 'border-red-500 text-red-600'
                    )}
                  >
                    {treatmentLabel}
                  </Badge>
                </div>

                {risk.treatment_plan && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Plano de Tratamento</h4>
                    <p className="text-sm text-muted-foreground">{risk.treatment_plan}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <RiskHistoryTimeline history={history || []} isLoading={historyLoading} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
