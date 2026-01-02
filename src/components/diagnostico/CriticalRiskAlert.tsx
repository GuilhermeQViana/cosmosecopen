import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, Zap, ChevronRight } from 'lucide-react';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import { calculateRiskScore, getRiskScoreClassification, RISK_SCORE_THRESHOLDS } from '@/lib/risk-methodology';
import { cn } from '@/lib/utils';

interface CriticalRiskAlertProps {
  controls: Control[];
  assessments: Assessment[];
  onFilterCritical?: () => void;
}

interface CriticalControl {
  control: Control;
  assessment: Assessment;
  riskScore: number;
}

export function CriticalRiskAlert({
  controls,
  assessments,
  onFilterCritical,
}: CriticalRiskAlertProps) {
  const criticalControls = useMemo(() => {
    const assessmentMap = new Map(assessments.map((a) => [a.control_id, a]));
    
    const critical: CriticalControl[] = [];
    
    for (const control of controls) {
      const assessment = assessmentMap.get(control.id);
      if (!assessment) continue;
      
      const currentMaturity = parseInt(assessment.maturity_level);
      const targetMaturity = parseInt(assessment.target_maturity);
      const weight = control.weight || 1;
      
      const riskScore = calculateRiskScore(currentMaturity, targetMaturity, weight);
      
      if (riskScore >= RISK_SCORE_THRESHOLDS.CRITICAL.min) {
        critical.push({ control, assessment, riskScore });
      }
    }
    
    // Sort by risk score descending
    return critical.sort((a, b) => b.riskScore - a.riskScore);
  }, [controls, assessments]);

  const highRiskControls = useMemo(() => {
    const assessmentMap = new Map(assessments.map((a) => [a.control_id, a]));
    
    let count = 0;
    
    for (const control of controls) {
      const assessment = assessmentMap.get(control.id);
      if (!assessment) continue;
      
      const currentMaturity = parseInt(assessment.maturity_level);
      const targetMaturity = parseInt(assessment.target_maturity);
      const weight = control.weight || 1;
      
      const riskScore = calculateRiskScore(currentMaturity, targetMaturity, weight);
      
      if (riskScore >= RISK_SCORE_THRESHOLDS.HIGH.min && riskScore < RISK_SCORE_THRESHOLDS.CRITICAL.min) {
        count++;
      }
    }
    
    return count;
  }, [controls, assessments]);

  if (criticalControls.length === 0 && highRiskControls === 0) {
    return null;
  }

  return (
    <Alert 
      variant={criticalControls.length > 0 ? 'destructive' : 'default'}
      className={cn(
        'border-2',
        criticalControls.length > 0 
          ? 'bg-destructive/5 border-destructive/30' 
          : 'bg-orange-500/5 border-orange-500/30'
      )}
    >
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="flex items-center gap-2">
        {criticalControls.length > 0 ? (
          <>
            <span>Atenção: {criticalControls.length} controle{criticalControls.length > 1 ? 's' : ''} com Risk Score Crítico</span>
            <Badge variant="destructive" className="animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              Ação Imediata
            </Badge>
          </>
        ) : (
          <span>{highRiskControls} controle{highRiskControls > 1 ? 's' : ''} com Risk Score Alto</span>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="flex flex-col gap-3">
          {criticalControls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {criticalControls.slice(0, 5).map(({ control, riskScore }) => (
                <Tooltip key={control.id}>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className="bg-destructive/10 text-destructive border-destructive/30 cursor-help"
                    >
                      {control.code}: Score {riskScore}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">{control.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Risk Score {riskScore} - Requer ação imediata
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {criticalControls.length > 5 && (
                <Badge variant="outline" className="bg-muted">
                  +{criticalControls.length - 5} mais
                </Badge>
              )}
            </div>
          )}
          
          {onFilterCritical && criticalControls.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onFilterCritical}
              className="w-fit bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20"
            >
              Ver controles críticos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
