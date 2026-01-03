import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getRiskLevelLabel, getRiskLevelColor, getRiskLevelFromScore } from '@/hooks/useVendors';

interface VendorRiskBadgeProps {
  score: number | null;
  riskLevel?: string | null;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

export function VendorRiskBadge({ score, riskLevel, showScore = true, size = 'md' }: VendorRiskBadgeProps) {
  const level = riskLevel || getRiskLevelFromScore(score);
  const colorClass = getRiskLevelColor(level);
  const label = getRiskLevelLabel(level);

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent text-white font-medium',
        colorClass,
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'
      )}
    >
      {showScore && score !== null ? `${score}% - ${label}` : label}
    </Badge>
  );
}

interface VendorCriticalityBadgeProps {
  criticality: string;
  size?: 'sm' | 'md';
}

const criticalityConfig: Record<string, { label: string; className: string }> = {
  critica: { label: 'Crítica', className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' },
  alta: { label: 'Alta', className: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  media: { label: 'Média', className: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' },
  baixa: { label: 'Baixa', className: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30' },
};

export function VendorCriticalityBadge({ criticality, size = 'md' }: VendorCriticalityBadgeProps) {
  const config = criticalityConfig[criticality] || criticalityConfig.media;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        config.className,
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'
      )}
    >
      {config.label}
    </Badge>
  );
}

interface VendorStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ativo: { label: 'Ativo', className: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30' },
  inativo: { label: 'Inativo', className: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30' },
  em_avaliacao: { label: 'Em Avaliação', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  bloqueado: { label: 'Bloqueado', className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' },
};

export function VendorStatusBadge({ status, size = 'md' }: VendorStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.ativo;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        config.className,
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'
      )}
    >
      {config.label}
    </Badge>
  );
}
