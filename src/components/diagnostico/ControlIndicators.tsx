import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  FileCheck,
  ClipboardList,
  MessageSquare,
  AlertOctagon,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ControlIndicatorsProps {
  evidenceCount: number;
  actionPlanCount: number;
  commentCount: number;
  isProblematic?: boolean;
  lastAssessedAt?: string | null;
  showLabels?: boolean;
  compact?: boolean;
}

export function ControlIndicators({
  evidenceCount,
  actionPlanCount,
  commentCount,
  isProblematic,
  lastAssessedAt,
  showLabels = false,
  compact = true,
}: ControlIndicatorsProps) {
  const isOld = lastAssessedAt
    ? Date.now() - new Date(lastAssessedAt).getTime() > 30 * 24 * 60 * 60 * 1000 // 30 days
    : false;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Problematic Control Flag */}
      {isProblematic && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="destructive"
              className="gap-1 h-5 px-1.5 text-xs cursor-help"
            >
              <AlertOctagon className="h-3 w-3" />
              {showLabels && 'Atenção'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">
              <strong>Controle problemático:</strong> Não conforme, sem evidências e sem plano de ação.
            </p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Old Assessment Warning */}
      {isOld && !isProblematic && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="gap-1 h-5 px-1.5 text-xs cursor-help bg-amber-500/10 text-amber-600 border-amber-500/30"
            >
              <Clock className="h-3 w-3" />
              {showLabels && 'Desatualizado'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">
              Última avaliação há mais de 30 dias
              {lastAssessedAt && (
                <span className="block text-muted-foreground">
                  ({formatDistanceToNow(new Date(lastAssessedAt), { locale: ptBR, addSuffix: true })})
                </span>
              )}
            </p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Evidence Count */}
      {evidenceCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className={cn(
                'gap-1 h-5 px-1.5 text-xs cursor-help',
                compact && 'px-1'
              )}
            >
              <FileCheck className="h-3 w-3 text-emerald-500" />
              {evidenceCount}
              {showLabels && ' evidências'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{evidenceCount} evidência(s) vinculada(s)</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Action Plan Count */}
      {actionPlanCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className={cn(
                'gap-1 h-5 px-1.5 text-xs cursor-help',
                compact && 'px-1'
              )}
            >
              <ClipboardList className="h-3 w-3 text-blue-500" />
              {actionPlanCount}
              {showLabels && ' planos'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{actionPlanCount} plano(s) de ação</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Comment Count */}
      {commentCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className={cn(
                'gap-1 h-5 px-1.5 text-xs cursor-help',
                compact && 'px-1'
              )}
            >
              <MessageSquare className="h-3 w-3 text-purple-500" />
              {commentCount}
              {showLabels && ' comentários'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{commentCount} comentário(s)</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
