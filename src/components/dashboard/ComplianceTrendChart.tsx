import { useMemo } from 'react';
import {
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
import { ChartSkeleton } from './ChartSkeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useDiagnosticSnapshots } from '@/hooks/useDiagnosticSnapshots';
import { format, parseISO, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Assessment } from '@/hooks/useAssessments';

interface ComplianceTrendChartProps {
  assessments: Assessment[];
  isLoading?: boolean;
}

interface SnapshotDataItem {
  status?: string;
}

export function ComplianceTrendChart({ assessments, isLoading }: ComplianceTrendChartProps) {
  const { data: snapshots = [], isLoading: loadingSnapshots } = useDiagnosticSnapshots();

  const chartData = useMemo(() => {
    const data: { 
      month: string; 
      date: Date;
      conforme: number; 
      parcial: number; 
      naoConforme: number;
      total: number;
    }[] = [];

    // Process snapshots
    snapshots
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .forEach(snapshot => {
        const snapshotData = snapshot.snapshot_data as SnapshotDataItem[];
        if (!Array.isArray(snapshotData)) return;

        const conforme = snapshotData.filter(d => d.status === 'conforme').length;
        const parcial = snapshotData.filter(d => d.status === 'parcial').length;
        const naoConforme = snapshotData.filter(d => d.status === 'nao_conforme').length;
        const total = snapshotData.length;

        data.push({
          month: format(parseISO(snapshot.created_at), 'MMM/yy', { locale: ptBR }),
          date: parseISO(snapshot.created_at),
          conforme: total > 0 ? Math.round((conforme / total) * 100) : 0,
          parcial: total > 0 ? Math.round((parcial / total) * 100) : 0,
          naoConforme: total > 0 ? Math.round((naoConforme / total) * 100) : 0,
          total,
        });
      });

    // Add current state
    if (assessments.length > 0) {
      const conforme = assessments.filter(a => a.status === 'conforme').length;
      const parcial = assessments.filter(a => a.status === 'parcial').length;
      const naoConforme = assessments.filter(a => a.status === 'nao_conforme').length;
      const total = assessments.length;

      data.push({
        month: 'Atual',
        date: new Date(),
        conforme: total > 0 ? Math.round((conforme / total) * 100) : 0,
        parcial: total > 0 ? Math.round((parcial / total) * 100) : 0,
        naoConforme: total > 0 ? Math.round((naoConforme / total) * 100) : 0,
        total,
      });
    }

    return data;
  }, [snapshots, assessments]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    const current = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    const diff = current.conforme - previous.conforme;
    if (diff > 0) return { direction: 'up' as const, value: diff };
    if (diff < 0) return { direction: 'down' as const, value: Math.abs(diff) };
    return { direction: 'stable' as const, value: 0 };
  }, [chartData]);

  if (isLoading || loadingSnapshots) {
    return <ChartSkeleton type="area" height={300} />;
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tendência de Conformidade</CardTitle>
          <CardDescription>Evolução histórica do status de conformidade</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-sm text-muted-foreground text-center">
            Salve snapshots do diagnóstico para visualizar tendências ao longo do tempo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Tendência de Conformidade</CardTitle>
            <CardDescription>Evolução histórica do status de conformidade</CardDescription>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend.direction === 'up' ? 'text-[hsl(var(--success))]' : 
              trend.direction === 'down' ? 'text-[hsl(var(--risk-high))]' : 
              'text-muted-foreground'
            }`}>
              {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
              {trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
              {trend.direction === 'stable' && <Minus className="h-4 w-4" />}
              <span>{trend.value > 0 ? `${trend.value}%` : 'Estável'}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorConforme" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorParcial" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNaoConforme" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
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
              y={80} 
              stroke="hsl(var(--success))" 
              strokeDasharray="5 5" 
              label={{ value: 'Meta 80%', position: 'insideTopRight', fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="conforme"
              name="Conforme"
              stroke="hsl(var(--success))"
              fill="url(#colorConforme)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="parcial"
              name="Parcial"
              stroke="hsl(var(--warning))"
              fill="url(#colorParcial)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="naoConforme"
              name="Não Conforme"
              stroke="hsl(var(--destructive))"
              fill="url(#colorNaoConforme)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
