import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AccessLog } from '@/hooks/useAccessLogs';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditChartsProps {
  logs: AccessLog[];
  isLoading?: boolean;
}

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
  create: 'hsl(var(--chart-1))',
  update: 'hsl(var(--warning))',
  delete: 'hsl(var(--destructive))',
  login: 'hsl(var(--success))',
  logout: 'hsl(var(--muted-foreground))',
  export: 'hsl(var(--chart-5))',
  import: 'hsl(var(--primary))',
  view: 'hsl(var(--chart-6))',
  assess: 'hsl(var(--chart-2))',
};

const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

export function AuditCharts({ logs, isLoading }: AuditChartsProps) {
  // Activity by day (last 7 days)
  const activityByDay = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= dayStart && logDate <= dayEnd;
      });

      const creates = dayLogs.filter(l => l.action === 'create').length;
      const updates = dayLogs.filter(l => l.action === 'update').length;
      const deletes = dayLogs.filter(l => l.action === 'delete').length;
      const logins = dayLogs.filter(l => l.action === 'login').length;

      return {
        date: format(day, 'EEE', { locale: ptBR }),
        fullDate: format(day, 'dd/MM'),
        total: dayLogs.length,
        creates,
        updates,
        deletes,
        logins,
      };
    });
  }, [logs]);

  // Activity by action type
  const activityByAction = useMemo(() => {
    const actionCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    return Object.entries(actionCounts)
      .map(([action, count]) => ({
        action,
        label: actionLabels[action] || action,
        count,
        color: actionColors[action] || 'hsl(var(--muted))',
      }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  // Activity by user
  const activityByUser = useMemo(() => {
    const userCounts: Record<string, { name: string; count: number }> = {};
    
    logs.forEach(log => {
      const userId = log.user_id || 'system';
      const userName = log.profile?.full_name || 'Sistema';
      
      if (!userCounts[userId]) {
        userCounts[userId] = { name: userName, count: 0 };
      }
      userCounts[userId].count++;
    });

    return Object.entries(userCounts)
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [logs]);

  // Activity by entity type
  const activityByEntity = useMemo(() => {
    const entityCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      const entity = log.entity_type || 'outros';
      entityCounts[entity] = (entityCounts[entity] || 0) + 1;
    });

    const entityLabels: Record<string, string> = {
      assessments: 'Avaliações',
      risks: 'Riscos',
      evidences: 'Evidências',
      action_plans: 'Planos de Ação',
      report: 'Relatórios',
      backup: 'Backups',
      session: 'Sessões',
      outros: 'Outros',
    };

    return Object.entries(entityCounts)
      .map(([entity, count]) => ({
        entity,
        label: entityLabels[entity] || entity,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Activity Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Atividade por Dia</CardTitle>
          <CardDescription>Últimos 7 dias de atividade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityByDay}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#colorTotal)"
                  name="Total"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity by Action Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Por Tipo de Ação</CardTitle>
          <CardDescription>Distribuição de ações realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityByAction}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="label"
                >
                  {activityByAction.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [value, name]}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => <span className="text-foreground text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity by User */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Por Usuário</CardTitle>
          <CardDescription>Top 5 usuários mais ativos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityByUser} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  width={80}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                  name="Ações"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity by Entity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Por Entidade</CardTitle>
          <CardDescription>Ações por tipo de recurso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityByEntity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                  name="Ações"
                >
                  {activityByEntity.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
