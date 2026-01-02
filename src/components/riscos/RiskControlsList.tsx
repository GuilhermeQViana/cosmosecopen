import { useRiskControls } from '@/hooks/useRisks';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Link2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface RiskControlsListProps {
  riskId: string | null;
}

export function RiskControlsList({ riskId }: RiskControlsListProps) {
  const { data: riskControls, isLoading } = useRiskControls(riskId);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (!riskControls || riskControls.length === 0) {
    return (
      <div className="text-center py-8">
        <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-sm font-medium mb-1">Nenhum controle vinculado</h3>
        <p className="text-xs text-muted-foreground">
          Vincule controles a este risco para ver a lista aqui
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)] pr-4">
      <div className="space-y-3">
        {riskControls.map((rc: any) => {
          const control = rc.controls;
          if (!control) return null;

          return (
            <div
              key={rc.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    {control.code}
                  </Badge>
                  {control.frameworks && (
                    <Badge variant="secondary" className="text-xs">
                      {control.frameworks.code?.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{control.name}</p>
                {control.category && (
                  <p className="text-xs text-muted-foreground">{control.category}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => navigate(`/diagnostico?controlId=${control.id}`)}
                title="Ver no Diagnóstico"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
