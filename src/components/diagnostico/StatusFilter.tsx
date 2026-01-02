import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, XCircle, Filter, X } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type ConformityStatus = Database['public']['Enums']['conformity_status'];

export type StatusFilterValue = ConformityStatus | 'all' | 'pending';

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
  counts: {
    all: number;
    conforme: number;
    parcial: number;
    naoConforme: number;
    pending: number;
  };
}

const FILTER_OPTIONS: { value: StatusFilterValue; label: string; icon?: React.ElementType; color?: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'conforme', label: 'Conformes', icon: CheckCircle2, color: 'text-[hsl(var(--conforme))]' },
  { value: 'parcial', label: 'Parciais', icon: AlertCircle, color: 'text-[hsl(var(--parcial))]' },
  { value: 'nao_conforme', label: 'Não Conformes', icon: XCircle, color: 'text-[hsl(var(--nao-conforme))]' },
  { value: 'pending', label: 'Pendentes', icon: Filter, color: 'text-muted-foreground' },
];

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  const getCount = (filterValue: StatusFilterValue) => {
    switch (filterValue) {
      case 'all':
        return counts.all;
      case 'conforme':
        return counts.conforme;
      case 'parcial':
        return counts.parcial;
      case 'nao_conforme':
        return counts.naoConforme;
      case 'pending':
        return counts.pending;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTER_OPTIONS.map((option) => {
        const isActive = value === option.value;
        const count = getCount(option.value);
        const Icon = option.icon;

        return (
          <Button
            key={option.value}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(option.value)}
            className={cn(
              'gap-1.5 h-8',
              isActive && 'shadow-sm'
            )}
          >
            {Icon && <Icon className={cn('h-3.5 w-3.5', !isActive && option.color)} />}
            {option.label}
            <Badge
              variant="secondary"
              className={cn(
                'ml-1 h-5 min-w-5 px-1.5 text-xs',
                isActive ? 'bg-background/20 text-primary-foreground' : 'bg-muted'
              )}
            >
              {count}
            </Badge>
          </Button>
        );
      })}
      
      {value !== 'all' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange('all')}
          className="h-8 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
