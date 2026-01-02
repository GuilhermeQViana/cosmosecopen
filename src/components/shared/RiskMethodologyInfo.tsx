import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CONTROL_WEIGHTS,
  RISK_SCORE_THRESHOLDS,
  MATURITY_LEVELS,
  MATURITY_GAP_DESCRIPTIONS,
  BUSINESS_RISK_THRESHOLDS,
} from '@/lib/risk-methodology';
import { cn } from '@/lib/utils';
import { Info, Calculator, Gauge, Target, Grid3X3 } from 'lucide-react';

interface RiskMethodologyInfoProps {
  trigger?: React.ReactNode;
}

export function RiskMethodologyInfo({ trigger }: RiskMethodologyInfoProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Info className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Metodologia de Risco
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="formula" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="formula" className="text-xs">
              <Calculator className="w-3 h-3 mr-1" />
              Fórmula
            </TabsTrigger>
            <TabsTrigger value="weights" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Pesos
            </TabsTrigger>
            <TabsTrigger value="maturity" className="text-xs">
              <Gauge className="w-3 h-3 mr-1" />
              Maturidade
            </TabsTrigger>
            <TabsTrigger value="matrix" className="text-xs">
              <Grid3X3 className="w-3 h-3 mr-1" />
              Matriz 5x5
            </TabsTrigger>
          </TabsList>

          {/* Formula Tab */}
          <TabsContent value="formula" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Fórmula do Risk Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg text-center font-mono text-lg">
                  Risk Score = (Alvo - Atual) × Peso
                </div>
                <p className="text-sm text-muted-foreground">
                  O Risk Score representa o gap de maturidade ponderado pela criticidade do controle
                  para o contexto da organização.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Classificação de Risco</h4>
                <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(RISK_SCORE_THRESHOLDS) as [string, typeof RISK_SCORE_THRESHOLDS[keyof typeof RISK_SCORE_THRESHOLDS]][]).map(([key, value]) => (
                      <div
                        key={key}
                        className={cn(
                          'flex items-center justify-between p-2 rounded border',
                          value.color
                        )}
                      >
                        <div>
                          <span className="font-medium">{value.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {value.min}-{value.max}
                            {key === 'CRITICAL' && '+'}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {value.action}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weights Tab */}
          <TabsContent value="weights" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Peso do Controle (1-3)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(CONTROL_WEIGHTS).map(([weight, config]) => (
                    <div
                      key={weight}
                      className={cn(
                        'p-3 rounded-lg border',
                        config.color
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-2xl">{weight}</span>
                        <Badge variant="outline">{config.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Gap de Maturidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(MATURITY_GAP_DESCRIPTIONS).map(([gap, description]) => (
                    <div key={gap} className="flex items-center justify-between text-sm">
                      <span className="font-mono">Gap = {gap}</span>
                      <span className="text-muted-foreground">{description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maturity Tab */}
          <TabsContent value="maturity" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Escala de Maturidade (0-5)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(MATURITY_LEVELS).map(([level, config]) => (
                    <div key={level} className="grid grid-cols-12 gap-2 items-start text-sm p-2 rounded hover:bg-muted/50">
                      <div className="col-span-1 font-bold text-lg">{level}</div>
                      <div className="col-span-2 font-medium">{config.label}</div>
                      <div className="col-span-5 text-muted-foreground">{config.description}</div>
                      <div className="col-span-4 text-xs text-muted-foreground italic">
                        {config.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matrix Tab */}
          <TabsContent value="matrix" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Matriz de Risco 5x5</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Para avaliação de riscos de negócio, a plataforma utiliza uma matriz 5x5
                  cruzando Probabilidade × Impacto.
                </p>

                {/* Interactive Mini Matrix */}
                <div className="overflow-x-auto">
                  <div className="min-w-[300px]">
                    <div className="text-xs text-center mb-2 text-muted-foreground">
                      Probabilidade ↓ × Impacto →
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {/* Header row */}
                      <div className="text-xs text-center p-1"></div>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="text-xs text-center p-1 font-medium">
                          {i}
                        </div>
                      ))}
                      
                      {/* Matrix rows */}
                      {[5, 4, 3, 2, 1].map((prob) => (
                        <>
                          <div key={`label-${prob}`} className="text-xs text-center p-1 font-medium">
                            {prob}
                          </div>
                          {[1, 2, 3, 4, 5].map((impact) => {
                            const level = prob * impact;
                            let bgColor = 'bg-green-500/80';
                            if (level >= 20) bgColor = 'bg-red-500/80';
                            else if (level >= 12) bgColor = 'bg-orange-500/80';
                            else if (level >= 6) bgColor = 'bg-yellow-500/80';
                            else if (level >= 3) bgColor = 'bg-lime-500/80';
                            
                            return (
                              <div
                                key={`${prob}-${impact}`}
                                className={cn(
                                  'aspect-square rounded flex items-center justify-center text-xs font-bold text-white',
                                  bgColor
                                )}
                              >
                                {level}
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {Object.entries(BUSINESS_RISK_THRESHOLDS).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className={cn('w-4 h-4 rounded', value.color)} />
                      <span className="text-xs text-muted-foreground">
                        {value.label} ({value.min}-{value.max})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
