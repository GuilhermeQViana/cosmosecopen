import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartSkeleton } from './ChartSkeleton';
import { TrendingUp, TrendingDown, Minus, Calendar, Target } from 'lucide-react';
import { useDiagnosticSnapshots } from '@/hooks/useDiagnosticSnapshots';
import type { Assessment } from '@/hooks/useAssessments';
import { cn } from '@/lib/utils';

interface MaturityHistoryChartProps {
  assessments: Assessment[];
  frameworkName?: string;
  isLoading?: boolean;
}

interface SnapshotDataItem {
  control_id: string;
  maturity_level: string;
  target_maturity: string;
  status: string;
}

function maturityToPercent(level: string | number): number {
  const numLevel = typeof level === 'string' ? parseInt(level, 10) : level;
  return (numLevel / 5) * 100;
}

function calculateAverageMaturity(items: SnapshotDataItem[]): number {
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, item) => acc + parseInt(item.maturity_level), 0);
  return Math.round((sum / items.length / 5) * 100);
}

function calculateAverageTarget(items: SnapshotDataItem[]): number {
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, item) => acc + parseInt(item.target_maturity), 0);
  return Math.round((sum / items.length / 5) * 100);
}

function calculateConformanceRate(items: SnapshotDataItem[]): number {
  if (items.length === 0) return 0;
  const conformeCount = items.filter(item => item.status === 'conforme').length;
  return Math.round((conformeCount / items.length) * 100);
}

export function MaturityHistoryChart({ 
  assessments, 
  frameworkName, 
  isLoading 
}: MaturityHistoryChartProps) {
  const { data: snapshots = [], isLoading: loadingSnapshots } = useDiagnosticSnapshots();

  const chartData = useMemo(() => {
    const dataPoints: Array<{
      date: string;
      fullDate: string;
      maturity: number;
      target: number;
      conformance: number;
      gap: number;
      isSnapshot: boolean;
      name?: string;
    }> = [];

    // Add snapshot data points
    const sortedSnapshots = [...snapshots].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedSnapshots.forEach(snapshot => {
      const rawData = snapshot.snapshot_data;
      const snapshotData = Array.isArray(rawData) ? rawData as unknown as SnapshotDataItem[] : [];
      if (snapshotData.length === 0) return;

      const date = new Date(snapshot.created_at);
      const maturity = calculateAverageMaturity(snapshotData);
      const target = calculateAverageTarget(snapshotData);
      const conformance = calculateConformanceRate(snapshotData);

      dataPoints.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        fullDate: date.toLocaleDateString('pt-BR'),
        maturity,
        target,
        conformance,
        gap: target - maturity,
        isSnapshot: true,
        name: snapshot.name,
      });
    });

    // Add current state as last data point
    if (assessments.length > 0) {
      const currentMaturity = Math.round(
        assessments.reduce((sum, a) => sum + parseInt(a.maturity_level), 0) / assessments.length / 5 * 100
      );
      const currentTarget = Math.round(
        assessments.reduce((sum, a) => sum + parseInt(a.target_maturity), 0) / assessments.length / 5 * 100
      );
      const currentConformance = Math.round(
        assessments.filter(a => a.status === 'conforme').length / assessments.length * 100
      );

      dataPoints.push({
        date: 'Atual',
        fullDate: new Date().toLocaleDateString('pt-BR'),
        maturity: currentMaturity,
        target: currentTarget,
        conformance: currentConformance,
        gap: currentTarget - currentMaturity,
        isSnapshot: false,
      });
    }

    return dataPoints;
  }, [snapshots, assessments]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    
    const last = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    const change = last.maturity - previous.maturity;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      value: Math.abs(change),
      percentChange: previous.maturity > 0 
        ? Math.round((change / previous.maturity) * 100) 
        : 0,
    };
  }, [chartData]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const current = chartData[chartData.length - 1];
    const maturities = chartData.map(d => d.maturity);
    const max = Math.max(...maturities);
    const min = Math.min(...maturities);
    const avg = Math.round(maturities.reduce((a, b) => a + b, 0) / maturities.length);
    
    return {
      current: current.maturity,
      target: current.target,
      gap: current.gap,
      max,
      min,
      avg,
      dataPoints: chartData.length,
    };
  }, [chartData]);

  if (isLoading || loadingSnapshots) {
    return <ChartSkeleton type="area" height={300} description />;
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Histórico de Maturidade
          </CardTitle>
          <CardDescription>
            {frameworkName || 'Framework não selecionado'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Nenhum histórico disponível ainda.
            </p>
            <p className="text-xs text-muted-foreground">
              Salve versões do diagnóstico para acompanhar a evolução ao longo do tempo.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          {data.isSnapshot && data.name && (
            <Badge variant="outline" className="text-xs">
              {data.name}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{data.fullDate}</div>
        <div className="space-y-1 pt-1 border-t border-border">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Maturidade:</span>
            <span className="font-medium text-primary">{data.maturity}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Meta:</span>
            <span className="font-medium">{data.target}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Gap:</span>
            <span className={cn(
              'font-medium',
              data.gap > 20 ? 'text-destructive' : data.gap > 10 ? 'text-orange-500' : 'text-green-500'
            )}>
              {data.gap}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Histórico de Maturidade
            </CardTitle>
            <CardDescription>
              {frameworkName || 'Framework'} - {chartData.length} pontos de dados
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {trend && (
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-sm',
                trend.direction === 'up' && 'bg-green-500/10 text-green-600',
                trend.direction === 'down' && 'bg-red-500/10 text-red-600',
                trend.direction === 'stable' && 'bg-muted text-muted-foreground'
              )}>
                {trend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
                {trend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
                {trend.direction === 'stable' && <Minus className="w-4 h-4" />}
                <span className="font-medium">
                  {trend.direction === 'stable' ? 'Estável' : `${trend.value}%`}
                </span>
              </div>
            )}
            {stats && (
              <Badge variant="outline" className="gap-1">
                <Target className="w-3 h-3" />
                Gap: {stats.gap}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="evolution" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
            <TabsTrigger value="comparison">Comparativo</TabsTrigger>
          </TabsList>

          <TabsContent value="evolution" className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMaturity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine 
                  y={stats?.target || 60} 
                  stroke="hsl(var(--warning))" 
                  strokeDasharray="5 5" 
                  label={{ 
                    value: 'Meta', 
                    fill: 'hsl(var(--warning))', 
                    fontSize: 11,
                    position: 'right'
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="maturity"
                  name="Maturidade"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorMaturity)"
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Stats row */}
            {stats && (
              <div className="grid grid-cols-4 gap-3 pt-2 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{stats.current}%</p>
                  <p className="text-xs text-muted-foreground">Atual</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.avg}%</p>
                  <p className="text-xs text-muted-foreground">Média</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{stats.max}%</p>
                  <p className="text-xs text-muted-foreground">Máximo</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{stats.min}%</p>
                  <p className="text-xs text-muted-foreground">Mínimo</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="maturity"
                  name="Maturidade Atual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Meta de Maturidade"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="conformance"
                  name="Taxa de Conformidade"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Legend explanation */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>Maturidade média dos controles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--warning))]" />
                <span>Meta de maturidade definida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--success))]" />
                <span>Percentual de controles conformes</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
