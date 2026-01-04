import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Calendar,
  Hash,
  Shield,
  TrendingDown,
  Check,
} from 'lucide-react';

export type SortOption = 
  | 'risk_score_desc'
  | 'risk_score_asc'
  | 'maturity_gap_desc'
  | 'maturity_gap_asc'
  | 'weight_desc'
  | 'weight_asc'
  | 'last_assessment'
  | 'code_asc'
  | 'code_desc'
  | 'name_asc';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { 
  value: SortOption; 
  label: string; 
  icon: React.ElementType;
  description: string;
}[] = [
  { 
    value: 'risk_score_desc', 
    label: 'Risk Score', 
    icon: AlertTriangle,
    description: 'Maior primeiro'
  },
  { 
    value: 'risk_score_asc', 
    label: 'Risk Score', 
    icon: AlertTriangle,
    description: 'Menor primeiro'
  },
  { 
    value: 'maturity_gap_desc', 
    label: 'Gap de Maturidade', 
    icon: TrendingDown,
    description: 'Maior primeiro'
  },
  { 
    value: 'maturity_gap_asc', 
    label: 'Gap de Maturidade', 
    icon: TrendingDown,
    description: 'Menor primeiro'
  },
  { 
    value: 'weight_desc', 
    label: 'Peso/Criticidade', 
    icon: Shield,
    description: 'Maior primeiro'
  },
  { 
    value: 'weight_asc', 
    label: 'Peso/Criticidade', 
    icon: Shield,
    description: 'Menor primeiro'
  },
  { 
    value: 'last_assessment', 
    label: 'Última Avaliação', 
    icon: Calendar,
    description: 'Mais antiga primeiro'
  },
  { 
    value: 'code_asc', 
    label: 'Código', 
    icon: Hash,
    description: 'A-Z'
  },
  { 
    value: 'code_desc', 
    label: 'Código', 
    icon: Hash,
    description: 'Z-A'
  },
  { 
    value: 'name_asc', 
    label: 'Nome', 
    icon: Hash,
    description: 'Alfabético'
  },
];

const STORAGE_KEY = 'cosmosec-diagnostic-sort';

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const currentOption = SORT_OPTIONS.find((o) => o.value === value);
  const Icon = currentOption?.icon || ArrowUpDown;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentOption?.label}
          </span>
          {value.includes('desc') ? (
            <ArrowDown className="h-3 w-3 text-muted-foreground" />
          ) : value.includes('asc') ? (
            <ArrowUp className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SORT_OPTIONS.map((option) => {
          const OptionIcon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-center justify-between cursor-pointer',
                isSelected && 'bg-accent'
              )}
            >
              <div className="flex items-center gap-2">
                <OptionIcon className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook for persisted sort preference
export function useSortPreference(): [SortOption, (value: SortOption) => void] {
  const [sort, setSort] = useState<SortOption>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved as SortOption) || 'code_asc';
    }
    return 'code_asc';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, sort);
  }, [sort]);

  return [sort, setSort];
}
