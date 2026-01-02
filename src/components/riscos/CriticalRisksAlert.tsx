import { Risk, calculateRiskLevel } from '@/hooks/useRisks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CriticalRisksAlertProps {
  risks: Risk[];
  onFilterCritical: () => void;
}

export function CriticalRisksAlert({ risks, onFilterCritical }: CriticalRisksAlertProps) {
  const criticalRisks = risks.filter((r) => {
    const level = calculateRiskLevel(r.inherent_probability, r.inherent_impact);
    return level >= 20;
  });

  const highRisks = risks.filter((r) => {
    const level = calculateRiskLevel(r.inherent_probability, r.inherent_impact);
    return level >= 12 && level < 20;
  });

  if (criticalRisks.length === 0 && highRisks.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        criticalRisks.length > 0
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-orange-500/10 border-orange-500/30'
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'p-2 rounded-full',
              criticalRisks.length > 0 ? 'bg-red-500/20' : 'bg-orange-500/20'
            )}
          >
            <AlertTriangle
              className={cn(
                'h-5 w-5',
                criticalRisks.length > 0
                  ? 'text-red-500 animate-pulse'
                  : 'text-orange-500'
              )}
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">
              {criticalRisks.length > 0
                ? 'Riscos Críticos Detectados'
                : 'Riscos Altos Detectados'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {criticalRisks.length > 0 && (
                <span>
                  <strong>{criticalRisks.length}</strong>{' '}
                  {criticalRisks.length === 1 ? 'risco crítico' : 'riscos críticos'} requer
                  {criticalRisks.length === 1 ? '' : 'em'} ação imediata.
                </span>
              )}
              {criticalRisks.length > 0 && highRisks.length > 0 && ' '}
              {highRisks.length > 0 && (
                <span>
                  <strong>{highRisks.length}</strong>{' '}
                  {highRisks.length === 1 ? 'risco alto' : 'riscos altos'} necessita
                  {highRisks.length === 1 ? '' : 'm'} atenção.
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {criticalRisks.slice(0, 5).map((risk) => (
                <Tooltip key={risk.id}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-300 text-xs cursor-help"
                    >
                      {risk.code}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{risk.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Nível: {calculateRiskLevel(risk.inherent_probability, risk.inherent_impact)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {criticalRisks.length > 5 && (
                <Badge
                  variant="outline"
                  className="bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-300 text-xs"
                >
                  +{criticalRisks.length - 5}
                </Badge>
              )}
              {highRisks.slice(0, 3).map((risk) => (
                <Tooltip key={risk.id}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="bg-orange-500/20 border-orange-500/40 text-orange-700 dark:text-orange-300 text-xs cursor-help"
                    >
                      {risk.code}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{risk.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Nível: {calculateRiskLevel(risk.inherent_probability, risk.inherent_impact)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {highRisks.length > 3 && (
                <Badge
                  variant="outline"
                  className="bg-orange-500/20 border-orange-500/40 text-orange-700 dark:text-orange-300 text-xs"
                >
                  +{highRisks.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant={criticalRisks.length > 0 ? 'destructive' : 'outline'}
          size="sm"
          onClick={onFilterCritical}
          className="gap-2 shrink-0"
        >
          Ver riscos críticos
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
