import { useState, useMemo } from 'react';
import { ActionPlan, PRIORITY_OPTIONS, STATUS_COLUMNS } from '@/hooks/useActionPlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';

interface CalendarViewProps {
  plans: ActionPlan[];
  onOpen: (plan: ActionPlan) => void;
  onCreateWithDate?: (date: Date) => void;
}

// Get contrast text color based on background
const getTextColorClass = (bgColorClass: string) => {
  // For darker backgrounds, use white text
  if (bgColorClass.includes('slate') || bgColorClass.includes('blue') || 
      bgColorClass.includes('purple') || bgColorClass.includes('green')) {
    return 'text-white';
  }
  // For yellow/light backgrounds, use dark text
  if (bgColorClass.includes('yellow')) {
    return 'text-slate-900';
  }
  return 'text-white';
};

export function CalendarView({ plans, onOpen, onCreateWithDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { locale: ptBR });
    const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getPlansForDay = (day: Date) => {
    return plans.filter((plan) => {
      if (!plan.due_date) return false;
      return isSameDay(new Date(plan.due_date), day);
    });
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold font-space capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="bg-background/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
              className="bg-background/50"
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="bg-background/50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
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
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const isHovered = hoveredDay && isSameDay(day, hoveredDay);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[100px] border rounded-md p-1 transition-all relative group',
                  !isCurrentMonth && 'bg-muted/30 opacity-50',
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
                {onCreateWithDate && isCurrentMonth && (
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
                  {dayPlans.slice(0, 3).map((plan) => {
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
                  {dayPlans.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center font-medium">
                      +{dayPlans.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
