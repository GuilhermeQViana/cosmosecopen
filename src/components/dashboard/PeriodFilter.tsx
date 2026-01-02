import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Period = '7d' | '30d' | '90d' | '1y';

interface PeriodFilterProps {
  value: Period;
  onChange: (value: Period) => void;
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '1y', label: 'Último ano' },
];

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const selectedOption = PERIOD_OPTIONS.find((o) => o.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          {selectedOption?.label}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {PERIOD_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(value === option.value && 'bg-accent')}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getPeriodDates(period: Period): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end };
}

export function getPreviousPeriodDates(period: Period): { start: Date; end: Date } {
  const { start: currentStart, end: currentEnd } = getPeriodDates(period);
  const duration = currentEnd.getTime() - currentStart.getTime();
  
  const end = new Date(currentStart.getTime());
  const start = new Date(end.getTime() - duration);

  return { start, end };
}
