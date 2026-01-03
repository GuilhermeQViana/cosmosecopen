import { useState, useMemo } from 'react';
import { useAccessLogs, useAccessLogsStats, useAccessLogsForCharts, type AccessLogFilters } from '@/hooks/useAccessLogs';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAccessLog } from '@/hooks/useAccessLog';
import { AuditCharts } from '@/components/auditoria/AuditCharts';
import { AuditTimeline } from '@/components/auditoria/AuditTimeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  Activity,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Loader2,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  LogIn,
  LogOut,
  CheckCircle2,
  X,
  User,
  FileUp,
  LayoutList,
  Clock as ClockIcon,
} from 'lucide-react';

import { toast } from 'sonner';

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
  login: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
  logout: 'bg-muted text-muted-foreground',
  create: 'bg-[hsl(var(--chart-1))]/10 text-[hsl(var(--chart-1))]',
  update: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  delete: 'bg-destructive/10 text-destructive',
  view: 'bg-[hsl(var(--chart-6))]/10 text-[hsl(var(--chart-6))]',
  export: 'bg-[hsl(var(--chart-5))]/10 text-[hsl(var(--chart-5))]',
  assess: 'bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]',
  import: 'bg-primary/10 text-primary',
};

const entityLabels: Record<string, string> = {
  assessment: 'Avaliação',
  assessments: 'Avaliação',
  risk: 'Risco',
  risks: 'Risco',
  evidence: 'Evidência',
  evidences: 'Evidência',
  action_plan: 'Plano de Ação',
  action_plans: 'Plano de Ação',
  control: 'Controle',
  controls: 'Controle',
  user: 'Usuário',
  organization: 'Organização',
  report: 'Relatório',
  backup: 'Backup',
  session: 'Sessão',
};

export default function Auditoria() {
  const { organization } = useOrganization();
  const { data: teamMembers } = useTeamMembers();
  const { logExport } = useAccessLog();
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  const filters: AccessLogFilters = useMemo(() => ({
    action: actionFilter,
    entityType: entityFilter,
    userId: userFilter,
    search: searchTerm,
    startDate,
    endDate,
  }), [actionFilter, entityFilter, userFilter, searchTerm, startDate, endDate]);

  const { data: logsResponse, isLoading } = useAccessLogs({ page, pageSize: 15, filters });
  const { data: stats } = useAccessLogsStats();
  const { data: chartLogs, isLoading: isLoadingCharts } = useAccessLogsForCharts();

  const logs = logsResponse?.data || [];
  const totalPages = logsResponse?.totalPages || 1;
  const totalCount = logsResponse?.totalCount || 0;

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setEntityFilter('all');
    setUserFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const hasActiveFilters = actionFilter !== 'all' || entityFilter !== 'all' || userFilter !== 'all' || startDate || endDate;

  const handleExport = () => {
    if (logs.length === 0) {
      toast.error('Nenhum log para exportar');
      return;
    }

    const headers = ['Data/Hora', 'Ação', 'Entidade', 'ID Entidade', 'Usuário', 'IP', 'Detalhes'];
    const rows = logs.map(log => [
      format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss'),
      actionLabels[log.action] || log.action,
      log.entity_type ? (entityLabels[log.entity_type] || log.entity_type) : '-',
      log.entity_id || '-',
      log.profile?.full_name || 'Sistema',
      log.ip_address || '-',
      log.details ? JSON.stringify(log.details) : '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-auditoria-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Log the export event
    logExport('audit_logs', 'csv', logs.length);

    toast.success('Logs exportados com sucesso!');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Auditoria de Logs</h1>
        <p className="text-muted-foreground">
          Histórico de atividades e acessos da {organization?.name || 'organização'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total de Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--chart-6))]/10">
                <Clock className="h-5 w-5 text-[hsl(var(--chart-6))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.today || 0}</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--chart-1))]/10">
                <Plus className="h-5 w-5 text-[hsl(var(--chart-1))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.creates || 0}</p>
                <p className="text-xs text-muted-foreground">Criações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--warning))]/10">
                <Edit className="h-5 w-5 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.updates || 0}</p>
                <p className="text-xs text-muted-foreground">Atualizações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.deletes || 0}</p>
                <p className="text-xs text-muted-foreground">Exclusões</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AuditCharts logs={chartLogs || []} isLoading={isLoadingCharts} />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ação, entidade ou usuário..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Ações</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="update">Atualização</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
                <SelectItem value="view">Visualização</SelectItem>
                <SelectItem value="export">Exportação</SelectItem>
                <SelectItem value="import">Importação</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Entidades</SelectItem>
                <SelectItem value="assessments">Avaliação</SelectItem>
                <SelectItem value="risks">Risco</SelectItem>
                <SelectItem value="evidences">Evidência</SelectItem>
                <SelectItem value="action_plans">Plano de Ação</SelectItem>
                <SelectItem value="report">Relatório</SelectItem>
                <SelectItem value="backup">Backup</SelectItem>
                <SelectItem value="session">Sessão</SelectItem>
              </SelectContent>
            </Select>
            
            {/* User Filter */}
            <Select value={userFilter} onValueChange={(v) => { setUserFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44">
                <User className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Usuários</SelectItem>
                {teamMembers?.map((member) => (
                  <SelectItem key={member.id} value={member.user_id}>
                    {member.profile?.full_name || 'Usuário'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Date Range Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-36 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd/MM/yyyy') : 'Data início'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => { setStartDate(date); setPage(1); }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-36 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yyyy') : 'Data fim'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => { setEndDate(date); setPage(1); }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Limpar
              </Button>
            )}

            <Button variant="outline" size="icon" onClick={handleExport} title="Exportar CSV">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Section */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Registro de Atividades</CardTitle>
            <CardDescription>
              {totalCount} registro{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}
              {viewMode === 'table' && totalPages > 1 && ` • Página ${page} de ${totalPages}`}
            </CardDescription>
          </div>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'timeline')}>
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="table" className="gap-2">
                <LayoutList className="h-4 w-4" />
                Tabela
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <ClockIcon className="h-4 w-4" />
                Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : viewMode === 'timeline' ? (
            <AuditTimeline logs={logs} />
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum registro encontrado</p>
              <p className="text-sm text-muted-foreground">
                Os logs de atividade aparecerão aqui quando houver ações registradas
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const ActionIcon = actionIcons[log.action] || Activity;
                    const isExpanded = expandedRows.has(log.id);
                    const hasDetails = log.details && Object.keys(log.details).length > 0;

                    return (
                      <Collapsible key={log.id} asChild open={isExpanded}>
                        <>
                          <TableRow 
                            className={hasDetails ? 'cursor-pointer hover:bg-muted/50' : ''}
                            onClick={() => hasDetails && toggleRow(log.id)}
                          >
                            <TableCell className="w-8">
                              {hasDetails && (
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={actionColors[log.action] || ''}>
                                <ActionIcon className="mr-1 h-3 w-3" />
                                {actionLabels[log.action] || log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {log.entity_type ? (
                                <div>
                                  <p className="font-medium text-sm">
                                    {entityLabels[log.entity_type] || log.entity_type}
                                  </p>
                                  {log.entity_id && (
                                    <p className="text-xs text-muted-foreground font-mono">
                                      {log.entity_id.slice(0, 8)}...
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={log.profile?.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(log.profile?.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {log.profile?.full_name || 'Sistema'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {log.ip_address || '-'}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm">
                                  {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(log.created_at), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                          <CollapsibleContent asChild>
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={6} className="py-3">
                                <div className="px-4">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">Detalhes da ação:</p>
                                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              </TableCell>
                            </TableRow>
                          </CollapsibleContent>
                        </>
                      </Collapsible>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={page === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
