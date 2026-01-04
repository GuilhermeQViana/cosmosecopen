import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus, Clock, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SnapshotEntry {
  id: string;
  name: string;
  created_at: string;
  maturity_level: string;
  status: string;
  observations?: string;
}

interface ControlEvolutionTimelineProps {
  controlId: string;
  snapshots: SnapshotEntry[];
  currentMaturity: string;
  isLoading?: boolean;
}

export function ControlEvolutionTimeline({
  controlId,
  snapshots,
  currentMaturity,
  isLoading,
}: ControlEvolutionTimelineProps) {
  const timelineEntries = useMemo(() => {
    if (!snapshots.length) return [];

    return snapshots
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((snapshot, index, arr) => {
        const prevSnapshot = arr[index + 1];
        const currentLevel = parseInt(snapshot.maturity_level) || 0;
        const prevLevel = prevSnapshot ? parseInt(prevSnapshot.maturity_level) || 0 : 0;
        
        let trend: "up" | "down" | "stable" = "stable";
        if (index < arr.length - 1) {
          if (currentLevel > prevLevel) trend = "up";
          else if (currentLevel < prevLevel) trend = "down";
        }

        return {
          ...snapshot,
          trend,
          change: currentLevel - prevLevel,
        };
      });
  }, [snapshots]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!timelineEntries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          Nenhum histórico de evolução disponível
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Salve versões do diagnóstico para acompanhar a evolução
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-4">
          {/* Current state */}
          <div className="relative flex gap-4">
            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-sm font-bold">{currentMaturity}</span>
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Estado Atual</span>
                <Badge variant="outline" className="text-xs">Agora</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maturidade nível {currentMaturity}
              </p>
            </div>
          </div>

          {/* Historical entries */}
          {timelineEntries.map((entry, index) => (
            <TimelineEntry key={entry.id} entry={entry} isFirst={index === 0} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

interface TimelineEntryProps {
  entry: {
    id: string;
    name: string;
    created_at: string;
    maturity_level: string;
    status: string;
    observations?: string;
    trend: "up" | "down" | "stable";
    change: number;
  };
  isFirst: boolean;
}

function TimelineEntry({ entry, isFirst }: TimelineEntryProps) {
  const TrendIcon = entry.trend === "up" 
    ? TrendingUp 
    : entry.trend === "down" 
      ? TrendingDown 
      : Minus;

  const trendColor = entry.trend === "up" 
    ? "text-green-500" 
    : entry.trend === "down" 
      ? "text-red-500" 
      : "text-muted-foreground";

  const maturityLevel = parseInt(entry.maturity_level) || 0;

  return (
    <div className="relative flex gap-4">
      <div 
        className={cn(
          "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2",
          "bg-background",
          entry.trend === "up" && "border-green-500",
          entry.trend === "down" && "border-red-500",
          entry.trend === "stable" && "border-border"
        )}
      >
        <span className="text-sm font-medium">{maturityLevel}</span>
      </div>
      
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{entry.name}</span>
          <div className={cn("flex items-center gap-1", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {entry.change !== 0 && (
              <span className="text-xs">
                {entry.change > 0 ? "+" : ""}{entry.change}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {format(new Date(entry.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        </div>

        {entry.observations && (
          <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
            <div className="flex items-start gap-2">
              <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
              <p className="text-muted-foreground line-clamp-2">{entry.observations}</p>
            </div>
          </div>
        )}

        <Badge 
          variant="outline" 
          className={cn(
            "mt-2 text-xs",
            entry.status === "conforme" && "border-green-500/50 text-green-600",
            entry.status === "parcial" && "border-yellow-500/50 text-yellow-600",
            entry.status === "nao_conforme" && "border-red-500/50 text-red-600",
            entry.status === "nao_aplicavel" && "border-muted text-muted-foreground"
          )}
        >
          {entry.status === "conforme" && "Conforme"}
          {entry.status === "parcial" && "Parcial"}
          {entry.status === "nao_conforme" && "Não Conforme"}
          {entry.status === "nao_aplicavel" && "N/A"}
        </Badge>
      </div>
    </div>
  );
}

export function useControlEvolution(
  controlId: string,
  snapshots: Array<{
    id: string;
    name: string;
    created_at: string;
    snapshot_data: {
      assessments: Array<{
        control_id: string;
        maturity_level: string;
        status: string;
        observations?: string;
      }>;
    };
  }>
) {
  return useMemo(() => {
    return snapshots
      .map(snapshot => {
        const assessment = snapshot.snapshot_data.assessments?.find(
          a => a.control_id === controlId
        );
        
        if (!assessment) return null;

        return {
          id: snapshot.id,
          name: snapshot.name,
          created_at: snapshot.created_at,
          maturity_level: assessment.maturity_level,
          status: assessment.status,
          observations: assessment.observations,
        };
      })
      .filter(Boolean) as SnapshotEntry[];
  }, [controlId, snapshots]);
}
