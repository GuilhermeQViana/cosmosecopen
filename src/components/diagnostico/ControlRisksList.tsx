import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getRiskLevelColor, getRiskLevelLabel, calculateRiskLevel } from '@/hooks/useRisks';
import { AlertTriangle, Plus, ExternalLink, Shield, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkedRisk {
  id: string;
  code: string;
  title: string;
  inherent_probability: number;
  inherent_impact: number;
  treatment: string;
}

interface ControlRisksListProps {
  controlId: string;
  controlCode: string;
  controlName: string;
  compact?: boolean;
}

function useControlRisks(controlId: string) {
  return useQuery({
    queryKey: ['control-risks', controlId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_controls')
        .select(`
          risk_id,
          risks (
            id,
            code,
            title,
            inherent_probability,
            inherent_impact,
            treatment
          )
        `)
        .eq('control_id', controlId);

      if (error) throw error;

      return (data || [])
        .map((rc: any) => rc.risks)
        .filter(Boolean) as LinkedRisk[];
    },
    enabled: !!controlId,
  });
}

export function ControlRisksList({
  controlId,
  controlCode,
  controlName,
  compact = false,
}: ControlRisksListProps) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: risks = [], isLoading } = useControlRisks(controlId);

  const handleCreateRisk = () => {
    setDialogOpen(false);
    // Navigate to risks page with control pre-linked
    navigate(`/riscos?linkControl=${controlId}&controlCode=${encodeURIComponent(controlCode)}&controlName=${encodeURIComponent(controlName)}`);
  };

  const handleViewRisk = (riskId: string) => {
    setDialogOpen(false);
    navigate(`/riscos?viewRisk=${riskId}`);
  };

  if (compact) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs">{risks.length}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {risks.length === 0
                ? 'Nenhum risco vinculado'
                : `${risks.length} risco(s) vinculado(s)`}
            </TooltipContent>
          </Tooltip>
        </DialogTrigger>
        <RisksDialogContent
          risks={risks}
          isLoading={isLoading}
          controlCode={controlCode}
          onCreateRisk={handleCreateRisk}
          onViewRisk={handleViewRisk}
        />
      </Dialog>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Riscos Vinculados
          {risks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {risks.length}
            </Badge>
          )}
        </h4>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleCreateRisk} 
          className="h-7 gap-1"
        >
          <Plus className="w-3 h-3" />
          Criar Risco
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && risks.length === 0 && (
        <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/20">
          <Shield className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
          <p className="mb-3">Nenhum risco vinculado a este controle</p>
          <Button variant="outline" size="sm" onClick={handleCreateRisk} className="gap-1">
            <Plus className="w-3 h-3" />
            Criar Risco Associado
          </Button>
        </div>
      )}

      {!isLoading && risks.length > 0 && (
        <div className="space-y-2">
          {risks.map((risk) => {
            const level = calculateRiskLevel(risk.inherent_probability, risk.inherent_impact);
            return (
              <div
                key={risk.id}
                onClick={() => handleViewRisk(risk.id)}
                className={cn(
                  'p-3 rounded-lg border bg-card cursor-pointer transition-all duration-150',
                  'hover:bg-accent/50 hover:border-primary/50 hover:shadow-sm',
                  'active:scale-[0.99]'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2.5 h-2.5 rounded-full', getRiskLevelColor(level))} />
                    <code className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {risk.code}
                    </code>
                    <span className="text-sm font-medium truncate max-w-[180px]">{risk.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getRiskLevelLabel(level)}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface RisksDialogContentProps {
  risks: LinkedRisk[];
  isLoading: boolean;
  controlCode: string;
  onCreateRisk: () => void;
  onViewRisk: (riskId: string) => void;
}

function RisksDialogContent({
  risks,
  isLoading,
  controlCode,
  onCreateRisk,
  onViewRisk,
}: RisksDialogContentProps) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Riscos Vinculados ao Controle {controlCode}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        {!isLoading && risks.length === 0 && (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">
              Este controle não está vinculado a nenhum risco
            </p>
            <Button onClick={onCreateRisk}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Risco Associado
            </Button>
          </div>
        )}

        {!isLoading && risks.length > 0 && (
          <>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2 pr-4">
                {risks.map((risk) => {
                  const level = calculateRiskLevel(risk.inherent_probability, risk.inherent_impact);
                  return (
                    <div
                      key={risk.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => onViewRisk(risk.id)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', getRiskLevelColor(level))} />
                          <code className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {risk.code}
                          </code>
                        </div>
                        <p className="text-sm font-medium">{risk.title}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          {getRiskLevelLabel(level)}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {risk.treatment}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <Button variant="outline" className="w-full" onClick={onCreateRisk}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Risco
            </Button>
          </>
        )}
      </div>
    </DialogContent>
  );
}

export { useControlRisks };
