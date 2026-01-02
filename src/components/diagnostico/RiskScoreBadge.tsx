import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  calculateRiskScore,
  getRiskScoreClassification,
  getMaturityGapDescription,
  getControlWeightInfo,
} from '@/lib/risk-methodology';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, Zap } from 'lucide-react';

interface RiskScoreBadgeProps {
  maturityLevel: number;
  targetMaturity: number;
  weight?: number;
  criticality?: string | null;
  showDetails?: boolean;
}

export function RiskScoreBadge({
  maturityLevel,
  targetMaturity,
  weight = 1,
  criticality,
  showDetails = true,
}: RiskScoreBadgeProps) {
  // Calculate using standardized methodology
  const riskScore = calculateRiskScore(maturityLevel, targetMaturity, weight);
  const classification = getRiskScoreClassification(riskScore);
  const gap = Math.max(0, targetMaturity - maturityLevel);
  const gapDescription = getMaturityGapDescription(gap);
  const weightInfo = getControlWeightInfo(weight);

  const isCritical = classification.level === 'CRITICAL';
  const isHigh = classification.level === 'HIGH';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                'font-mono cursor-help transition-all',
                classification.color,
                isCritical && 'animate-pulse'
              )}
            >
              {isCritical && <AlertTriangle className="w-3 h-3 mr-1" />}
              Risk Score: {riskScore}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs p-3">
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-sm">
                Cálculo do Risk Score
              </div>
              <div className="font-mono bg-muted p-2 rounded">
                ({targetMaturity} - {maturityLevel}) × {weight} = {riskScore}
              </div>
              <div className="text-muted-foreground">
                (Alvo - Atual) × Peso = Score
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            classification.color
          )}
        >
          {classification.label}
        </Badge>

        {(isCritical || isHigh) && (
          <Badge
            variant={isCritical ? 'destructive' : 'outline'}
            className={cn(
              'text-xs',
              !isCritical && 'bg-orange-500/10 text-orange-600 border-orange-500/30'
            )}
          >
            <Zap className="w-3 h-3 mr-1" />
            {classification.action}
          </Badge>
        )}
      </div>

      {showDetails && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>Gap {gap}: {gapDescription}</span>
          {weight > 1 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-[10px] cursor-help">
                  Peso {weight} ({weightInfo.label})
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-xs">{weightInfo.description}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}
