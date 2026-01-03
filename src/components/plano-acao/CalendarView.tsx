import { useState, useMemo } from 'react';
import { ActionPlan, PRIORITY_OPTIONS, STATUS_COLUMNS } from '@/hooks/useActionPlans';
import { DayPlansDialog } from './DayPlansDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addQuarters,
  subQuarters,
  startOfWeek,
  endOfWeek,
  startOfQuarter,
  endOfQuarter,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Maximize2 } from 'lucide-react';

interface CalendarViewProps {
  plans: ActionPlan[];
  onOpen: (plan: ActionPlan) => void;
  onCreateWithDate?: (date: Date) => void;
}

type PeriodType = 'week' | 'month' | 'quarter';

// Get contrast text color based on background
const getTextColorClass = (bgColorClass: string) => {
  if (bgColorClass.includes('slate') || bgColorClass.includes('blue') || 
      bgColorClass.includes('purple') || bgColorClass.includes('green')) {
    return 'text-white';
  }
  if (bgColorClass.includes('yellow')) {
    return 'text-slate-900';
  }
  return 'text-white';
};

export function CalendarView({ plans, onOpen, onCreateWithDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);
  const [expandedDayPlans, setExpandedDayPlans] = useState<ActionPlan[]>([]);

  const { days, periodLabel } = useMemo(() => {
    let start: Date;
    let end: Date;
    let label: string;

    switch (periodType) {
      case 'week':
        start = startOfWeek(currentDate, { locale: ptBR });
        end = endOfWeek(currentDate, { locale: ptBR });
        label = `${format(start, 'd MMM', { locale: ptBR })} - ${format(end, 'd MMM yyyy', { locale: ptBR })}`;
        break;
      case 'quarter':
        start = startOfQuarter(currentDate);
        end = endOfQuarter(currentDate);
        const quarterNum = Math.floor(start.getMonth() / 3) + 1;
        label = `${quarterNum}º Trimestre ${format(currentDate, 'yyyy')}`;
        // For quarter, we'll show weeks (expand to include full weeks)
        start = startOfWeek(start, { locale: ptBR });
        end = endOfWeek(end, { locale: ptBR });
        break;
      default: // month
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        start = startOfWeek(monthStart, { locale: ptBR });
        end = endOfWeek(monthEnd, { locale: ptBR });
        label = format(currentDate, 'MMMM yyyy', { locale: ptBR });
    }

    return {
      days: eachDayOfInterval({ start, end }),
      periodLabel: label,
    };
  }, [currentDate, periodType]);

  const navigate = (direction: 'prev' | 'next') => {
    const modifier = direction === 'next' ? 1 : -1;
    switch (periodType) {
      case 'week':
        setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        break;
      case 'quarter':
        setCurrentDate(direction === 'next' ? addQuarters(currentDate, 1) : subQuarters(currentDate, 1));
        break;
      default:
        setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    }
  };

  // Helper to parse date without timezone issues
  const parseDateSafe = (dateStr: string): Date => {
    return new Date(dateStr + 'T12:00:00');
  };

  const getPlansForDay = (day: Date) => {
    return plans.filter((plan) => {
      if (!plan.due_date) return false;
      return isSameDay(parseDateSafe(plan.due_date), day);
    });
  };

  const handleExpandDay = (day: Date, dayPlans: ActionPlan[]) => {
    setExpandedDay(day);
    setExpandedDayPlans(dayPlans);
  };

  const isInCurrentPeriod = (day: Date) => {
    switch (periodType) {
      case 'week':
        return true; // All days in week view are current
      case 'quarter':
        const quarterStart = startOfQuarter(currentDate);
        const quarterEnd = endOfQuarter(currentDate);
        return day >= quarterStart && day <= quarterEnd;
      default:
        return isSameMonth(day, currentDate);
    }
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const cellHeight = periodType === 'week' ? 'min-h-[140px]' : periodType === 'quarter' ? 'min-h-[60px]' : 'min-h-[100px]';
  const maxPlansToShow = periodType === 'quarter' ? 2 : 3;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold font-space capitalize">
              {periodLabel}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Period Selector */}
            <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
              <SelectTrigger className="w-[130px] bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
              </SelectContent>
            </Select>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('prev')}
                className="bg-background/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="bg-background/50"
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('next')}
                className="bg-background/50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayPlans = getPlansForDay(day);
            const isCurrentPeriod = isInCurrentPeriod(day);
            const isToday = isSameDay(day, new Date());
            const isHovered = hoveredDay && isSameDay(day, hoveredDay);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  cellHeight,
                  'border rounded-md p-1 transition-all relative group',
                  !isCurrentPeriod && 'bg-muted/30 opacity-50',
                  isToday && 'border-primary bg-primary/5',
                  isHovered && onCreateWithDate && 'border-primary/50 bg-primary/5'
                )}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div
                  className={cn(
                    'text-xs font-medium mb-1 text-center',
                    isToday && 'text-primary'
                  )}
                >
                  {format(day, 'd')}
                </div>
                
                {/* Add button on hover */}
                {onCreateWithDate && isCurrentPeriod && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      'absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity',
                      'hover:bg-primary/20 text-primary'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateWithDate(day);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}

                <div className="space-y-1">
                  {dayPlans.slice(0, maxPlansToShow).map((plan) => {
                    const priorityConfig = PRIORITY_OPTIONS.find(
                      (p) => p.value === plan.priority
                    );
                    const statusConfig = STATUS_COLUMNS.find(
                      (s) => s.value === plan.status
                    );
                    const bgClass = statusConfig?.color || 'bg-slate-500';
                    const textClass = getTextColorClass(bgClass);

                    return (
                      <div
                        key={plan.id}
                        onClick={() => onOpen(plan)}
                        className={cn(
                          'text-xs p-1 rounded cursor-pointer truncate transition-all hover:opacity-90 hover:shadow-sm',
                          bgClass,
                          textClass,
                          'font-medium'
                        )}
                        title={`${plan.title} (${priorityConfig?.label})`}
                      >
                        {plan.title}
                      </div>
                    );
                  })}
                  {dayPlans.length > maxPlansToShow && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpandDay(day, dayPlans);
                      }}
                      className="w-full text-xs text-primary hover:text-primary/80 text-center font-medium flex items-center justify-center gap-1 py-0.5 hover:bg-primary/10 rounded transition-colors"
                    >
                      <Maximize2 className="h-3 w-3" />
                      +{dayPlans.length - maxPlansToShow} mais
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Day Plans Dialog */}
        <DayPlansDialog
          open={!!expandedDay}
          onOpenChange={(open) => !open && setExpandedDay(null)}
          date={expandedDay}
          plans={expandedDayPlans}
          onPlanClick={onOpen}
        />
      </CardContent>
    </Card>
  );
}