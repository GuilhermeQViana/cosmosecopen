import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricComparisonProps {
  current: number;
  previous: number;
  suffix?: string;
  higherIsBetter?: boolean;
}

export function MetricComparison({ 
  current, 
  previous, 
  suffix = '', 
  higherIsBetter = true 
}: MetricComparisonProps) {
  if (previous === 0) {
    return null;
  }

  const change = current - previous;
  const percentChange = Math.round((change / previous) * 100);
  
  const isPositive = higherIsBetter ? change > 0 : change < 0;
  const isNeutral = change === 0;

  if (isNeutral) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span>Sem variação</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'flex items-center gap-1 text-xs',
        isPositive ? 'text-[hsl(var(--success))]' : 'text-destructive'
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span>
        {change > 0 ? '+' : ''}{percentChange}%{suffix && ` ${suffix}`}
      </span>
    </div>
  );
}
