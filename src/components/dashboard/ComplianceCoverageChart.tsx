import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartSkeleton } from './ChartSkeleton';
import { useFrameworks } from '@/hooks/useFrameworks';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';

interface ComplianceCoverageChartProps {
  isLoading?: boolean;
}

export function ComplianceCoverageChart({ isLoading }: ComplianceCoverageChartProps) {
  const { organization } = useOrganization();
  const { data: frameworks = [] } = useFrameworks();

  // Fetch all controls and assessments for organization's frameworks
  const { data: frameworkData = [], isLoading: loadingData } = useQuery({
    queryKey: ['compliance-coverage', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      // Get controls for all frameworks
      const { data: controls } = await supabase
        .from('controls')
        .select('id, framework_id')
        .in('framework_id', frameworks.map(f => f.id));

      // Get assessments for organization
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id, control_id, status')
        .eq('organization_id', organization.id);

      // Calculate per-framework stats
      return frameworks.map(framework => {
        const frameworkControls = controls?.filter(c => c.framework_id === framework.id) || [];
        const frameworkControlIds = new Set(frameworkControls.map(c => c.id));
        const frameworkAssessments = assessments?.filter(a => frameworkControlIds.has(a.control_id)) || [];
        
        const totalControls = frameworkControls.length;
        const assessedCount = frameworkAssessments.length;
        const conformeCount = frameworkAssessments.filter(a => a.status === 'conforme').length;

        const coverage = totalControls > 0 ? Math.round((assessedCount / totalControls) * 100) : 0;
        const compliance = assessedCount > 0 ? Math.round((conformeCount / assessedCount) * 100) : 0;

        return {
          name: framework.name.length > 20 ? framework.name.substring(0, 20) + '...' : framework.name,
          fullName: framework.name,
          coverage,
          compliance,
          totalControls,
          assessedCount,
          conformeCount,
        };
      }).filter(f => f.totalControls > 0);
    },
    enabled: !!organization?.id && frameworks.length > 0,
  });

  if (isLoading || loadingData) {
    return <ChartSkeleton type="bar" height={250} />;
  }

  if (frameworkData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cobertura por Framework</CardTitle>
          <CardDescription>Avaliação e conformidade por framework</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-sm text-muted-foreground text-center">
            Nenhum framework com controles encontrado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0]?.payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{data?.fullName || label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Cobertura:</span>
            <span className="font-medium">{data?.coverage}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Conformidade:</span>
            <span className="font-medium">{data?.compliance}%</span>
          </div>
          <div className="flex justify-between gap-4 text-xs text-muted-foreground pt-1 border-t">
            <span>Controles:</span>
            <span>{data?.assessedCount} / {data?.totalControls}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cobertura por Framework</CardTitle>
        <CardDescription>% de controles avaliados e conformes por framework</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={frameworkData} layout="vertical" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={80} stroke="hsl(var(--success))" strokeDasharray="5 5" />
            <Bar dataKey="coverage" name="Cobertura" radius={[0, 4, 4, 0]} barSize={12}>
              {frameworkData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.coverage >= 80 ? 'hsl(var(--chart-3))' : 'hsl(var(--muted-foreground))'}
                />
              ))}
            </Bar>
            <Bar dataKey="compliance" name="Conformidade" radius={[0, 4, 4, 0]} barSize={12}>
              {frameworkData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.compliance >= 80 ? 'hsl(var(--success))' : 
                    entry.compliance >= 50 ? 'hsl(var(--warning))' : 
                    'hsl(var(--destructive))'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[hsl(var(--chart-3))]" />
            <span className="text-muted-foreground">Cobertura</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[hsl(var(--success))]" />
            <span className="text-muted-foreground">Conformidade</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
