import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RiskScoreBadgeProps {
  maturityLevel: number;
  targetMaturity: number;
  weight?: number;
  criticality?: string | null;
}

export function RiskScoreBadge({
  maturityLevel,
  targetMaturity,
  weight = 1,
  criticality,
}: RiskScoreBadgeProps) {
  // Calculate risk score: gap * weight
  const gap = Math.max(0, targetMaturity - maturityLevel);
  const riskScore = gap * weight;

  // Determine color based on score
  const getScoreConfig = () => {
    if (riskScore === 0) {
      return {
        label: 'Baixo',
        className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      };
    }
    if (riskScore <= 3) {
      return {
        label: 'Médio',
        className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      };
    }
    if (riskScore <= 6) {
      return {
        label: 'Alto',
        className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      };
    }
    return {
      label: 'Crítico',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    };
  };

  const config = getScoreConfig();

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={cn('font-mono', config.className)}>
        Risk Score: {riskScore}
      </Badge>
      {criticality === 'critico' && (
        <Badge variant="destructive" className="text-xs">
          Crítico
        </Badge>
      )}
    </div>
  );
}
