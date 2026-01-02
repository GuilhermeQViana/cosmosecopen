import { RiskHistoryEntry, getRiskTrend } from '@/hooks/useRiskHistory';
import { getRiskLevelColor, getRiskLevelLabel } from '@/hooks/useRisks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Edit2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface RiskHistoryTimelineProps {
  history: RiskHistoryEntry[];
  isLoading?: boolean;
}

const CHANGE_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  created: { label: 'Criado', icon: Plus, color: 'bg-green-500' },
  updated: { label: 'Atualizado', icon: Edit2, color: 'bg-blue-500' },
  level_change: { label: 'Nível alterado', icon: RefreshCw, color: 'bg-orange-500' },
  treatment_change: { label: 'Tratamento alterado', icon: RefreshCw, color: 'bg-purple-500' },
};

const TREATMENT_LABELS: Record<string, string> = {
  mitigar: 'Mitigar',
  aceitar: 'Aceitar',
  transferir: 'Transferir',
  evitar: 'Evitar',
};

export function RiskHistoryTimeline({ history, isLoading }: RiskHistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhum histórico disponível
      </p>
    );
  }

  const trend = getRiskTrend(history);

  return (
    <div className="space-y-4">
      {/* Trend indicator */}
      {trend && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          {trend === 'improving' && (
            <>
              <TrendingDown className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">Tendência de melhora</span>
            </>
          )}
          {trend === 'worsening' && (
            <>
              <TrendingUp className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-600">Tendência de piora</span>
            </>
          )}
          {trend === 'stable' && (
            <>
              <Minus className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Estável</span>
            </>
          )}
        </div>
      )}

      {/* Timeline */}
      <ScrollArea className="h-[300px] pr-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {history.map((entry, index) => {
              const config = CHANGE_TYPE_CONFIG[entry.change_type] || CHANGE_TYPE_CONFIG.updated;
              const Icon = config.icon;

              return (
                <div key={entry.id} className="relative flex gap-3 pl-8">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute left-0 w-6 h-6 rounded-full flex items-center justify-center',
                      config.color
                    )}
                  >
                    <Icon className="h-3 w-3 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium">{config.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>

                    {/* Level change details */}
                    {entry.change_type === 'level_change' && entry.old_level && entry.new_level && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <div
                            className={cn(
                              'w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center',
                              getRiskLevelColor(entry.old_level)
                            )}
                          >
                            {entry.old_level}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {getRiskLevelLabel(entry.old_level)}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-1">
                          <div
                            className={cn(
                              'w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center',
                              getRiskLevelColor(entry.new_level)
                            )}
                          >
                            {entry.new_level}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {getRiskLevelLabel(entry.new_level)}
                          </span>
                        </div>
                        {entry.new_level < entry.old_level ? (
                          <TrendingDown className="h-4 w-4 text-green-500 ml-1" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-500 ml-1" />
                        )}
                      </div>
                    )}

                    {/* Treatment change details */}
                    {entry.change_type === 'treatment_change' && entry.old_value && entry.new_value && (
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {TREATMENT_LABELS[entry.old_value] || entry.old_value}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {TREATMENT_LABELS[entry.new_value] || entry.new_value}
                        </Badge>
                      </div>
                    )}

                    {/* Creation with level */}
                    {entry.change_type === 'created' && entry.new_level && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Nível inicial:</span>
                        <div
                          className={cn(
                            'w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center',
                            getRiskLevelColor(entry.new_level)
                          )}
                        >
                          {entry.new_level}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getRiskLevelLabel(entry.new_level)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
