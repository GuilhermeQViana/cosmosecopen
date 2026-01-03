import { useMemo } from 'react';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  LogIn,
  LogOut,
  CheckCircle2,
  FileUp,
  ChevronDown,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import type { AccessLog } from '@/hooks/useAccessLogs';

interface AuditTimelineProps {
  logs: AccessLog[];
}

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  login: LogIn,
  logout: LogOut,
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  export: Download,
  assess: CheckCircle2,
  import: FileUp,
};

const actionLabels: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  view: 'Visualização',
  export: 'Exportação',
  assess: 'Avaliação',
  import: 'Importação',
};

const actionColors: Record<string, string> = {
  login: 'bg-[hsl(var(--success))] border-[hsl(var(--success))]',
  logout: 'bg-muted-foreground border-muted-foreground',
  create: 'bg-[hsl(var(--chart-1))] border-[hsl(var(--chart-1))]',
  update: 'bg-[hsl(var(--warning))] border-[hsl(var(--warning))]',
  delete: 'bg-destructive border-destructive',
  view: 'bg-[hsl(var(--chart-6))] border-[hsl(var(--chart-6))]',
  export: 'bg-[hsl(var(--chart-5))] border-[hsl(var(--chart-5))]',
  assess: 'bg-[hsl(var(--chart-2))] border-[hsl(var(--chart-2))]',
  import: 'bg-primary border-primary',
};

const entityLabels: Record<string, string> = {
  assessment: 'avaliação',
  assessments: 'avaliação',
  risk: 'risco',
  risks: 'risco',
  evidence: 'evidência',
  evidences: 'evidência',
  action_plan: 'plano de ação',
  action_plans: 'plano de ação',
  control: 'controle',
  controls: 'controle',
  user: 'usuário',
  organization: 'organização',
  report: 'relatório',
  backup: 'backup',
  session: 'sessão',
};

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Hoje';
  if (isYesterday(date)) return 'Ontem';
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

function getActionDescription(log: AccessLog): string {
  const userName = log.profile?.full_name || 'Sistema';
  const action = actionLabels[log.action]?.toLowerCase() || log.action;
  const entity = log.entity_type ? entityLabels[log.entity_type] || log.entity_type : '';
  
  switch (log.action) {
    case 'login':
      return `${userName} fez login no sistema`;
    case 'logout':
      return `${userName} saiu do sistema`;
    case 'create':
      return `${userName} criou ${entity ? `um(a) ${entity}` : 'um registro'}`;
    case 'update':
      return `${userName} atualizou ${entity ? `um(a) ${entity}` : 'um registro'}`;
    case 'delete':
      return `${userName} excluiu ${entity ? `um(a) ${entity}` : 'um registro'}`;
    case 'export':
      return `${userName} exportou ${entity || 'dados'}`;
    case 'import':
      return `${userName} importou ${entity || 'dados'}`;
    case 'view':
      return `${userName} visualizou ${entity ? `um(a) ${entity}` : 'um registro'}`;
    case 'assess':
      return `${userName} realizou uma avaliação`;
    default:
      return `${userName} realizou ${action}${entity ? ` em ${entity}` : ''}`;
  }
}

function getInitials(name: string | null | undefined) {
  if (!name) return 'S';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface GroupedLogs {
  date: string;
  dateObj: Date;
  logs: AccessLog[];
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  // Group logs by day
  const groupedLogs = useMemo(() => {
    const groups: Record<string, AccessLog[]> = {};
    
    logs.forEach(log => {
      const date = format(new Date(log.created_at), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
    });

    return Object.entries(groups)
      .map(([date, logs]) => ({
        date,
        dateObj: new Date(date),
        logs: logs.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      }))
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()) as GroupedLogs[];
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Nenhum registro encontrado</p>
        <p className="text-sm text-muted-foreground">
          Os logs de atividade aparecerão aqui quando houver ações registradas
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {groupedLogs.map((group) => (
          <Collapsible key={group.date} defaultOpen>
            <div className="space-y-3">
              {/* Day Header */}
              <CollapsibleTrigger className="flex items-center gap-2 w-full group">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium capitalize">
                    {getDateLabel(group.dateObj)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {group.logs.length}
                  </Badge>
                </div>
                <div className="flex-1 h-px bg-border" />
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=closed]:rotate-[-90deg]" />
              </CollapsibleTrigger>

              {/* Timeline Items */}
              <CollapsibleContent>
                <div className="ml-4 border-l-2 border-border pl-4 space-y-0">
                  {group.logs.map((log, index) => {
                    const ActionIcon = actionIcons[log.action] || Activity;
                    const isLast = index === group.logs.length - 1;

                    return (
                      <div
                        key={log.id}
                        className={`relative pb-4 ${isLast ? 'pb-0' : ''}`}
                      >
                        {/* Timeline Dot */}
                        <div 
                          className={`absolute -left-[calc(1rem+5px)] w-2.5 h-2.5 rounded-full border-2 ${actionColors[log.action] || 'bg-muted border-muted'}`}
                        />
                        
                        {/* Content */}
                        <div className="flex items-start gap-3 group hover:bg-muted/50 rounded-lg p-2 -ml-2 transition-colors">
                          {/* Avatar */}
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={log.profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(log.profile?.full_name)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge 
                                variant="outline" 
                                className={`text-xs shrink-0 ${
                                  log.action === 'delete' ? 'border-destructive/50 text-destructive' :
                                  log.action === 'create' ? 'border-[hsl(var(--chart-1))]/50 text-[hsl(var(--chart-1))]' :
                                  log.action === 'update' ? 'border-[hsl(var(--warning))]/50 text-[hsl(var(--warning))]' :
                                  log.action === 'login' ? 'border-[hsl(var(--success))]/50 text-[hsl(var(--success))]' :
                                  ''
                                }`}
                              >
                                <ActionIcon className="h-3 w-3 mr-1" />
                                {actionLabels[log.action] || log.action}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), 'HH:mm')}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mt-1">
                              {getActionDescription(log)}
                            </p>
                            {log.entity_id && (
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                ID: {log.entity_id.slice(0, 8)}...
                              </p>
                            )}
                            {log.ip_address && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                IP: {log.ip_address}
                              </p>
                            )}
                          </div>

                          {/* Time ago - visible on hover */}
                          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {formatDistanceToNow(new Date(log.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </ScrollArea>
  );
}
