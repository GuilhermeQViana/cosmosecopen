import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './ChartSkeleton';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Assessment } from '@/hooks/useAssessments';

interface Control {
  id: string;
  category: string | null;
}

interface ComplianceRadarChartProps {
  controls: Control[];
  assessments: Assessment[];
  isLoading?: boolean;
}

// Convert maturity level to percentage
function maturityToPercent(level: string): number {
  const numLevel = parseInt(level, 10);
  return (numLevel / 5) * 100;
}

export function ComplianceRadarChart({ controls, assessments, isLoading }: ComplianceRadarChartProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <ChartSkeleton type="radar" height={300} />;
  }

  const data = useMemo(() => {
    // Group controls by category
    const categoryMap = new Map<string, { controlIds: Set<string>; fullName: string }>();
    
    controls.forEach(control => {
      const category = control.category || 'Outros';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { controlIds: new Set(), fullName: category });
      }
      categoryMap.get(category)!.controlIds.add(control.id);
    });

    // Calculate average maturity per category
    const chartData: { category: string; fullCategory: string; current: number; target: number; gap: number }[] = [];

    categoryMap.forEach((value, category) => {
      const categoryAssessments = assessments.filter(a => value.controlIds.has(a.control_id));
      
      if (categoryAssessments.length > 0) {
        const avgCurrent = categoryAssessments.reduce((sum, a) => sum + maturityToPercent(a.maturity_level), 0) / categoryAssessments.length;
        const avgTarget = categoryAssessments.reduce((sum, a) => sum + maturityToPercent(a.target_maturity), 0) / categoryAssessments.length;
        
        chartData.push({
          category: category.length > 15 ? category.substring(0, 15) + '...' : category,
          fullCategory: category,
          current: Math.round(avgCurrent),
          target: Math.round(avgTarget),
          gap: Math.round(avgTarget - avgCurrent),
        });
      }
    });

    return chartData;
  }, [controls, assessments]);

  const handleClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload?.fullCategory) {
      const category = data.activePayload[0].payload.fullCategory;
      navigate(`/diagnostico?category=${encodeURIComponent(category)}`);
    }
  };

  if (data.length === 0) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Maturidade por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-sm text-muted-foreground text-center">
            Avalie controles no Diagnóstico para visualizar a maturidade por categoria.
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{item?.fullCategory}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-muted-foreground">Atual:</span>
            <span className="font-medium">{item?.current}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted-foreground" />
            <span className="text-muted-foreground">Meta:</span>
            <span className="font-medium">{item?.target}%</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <span className="text-muted-foreground">Gap:</span>
            <span className={`font-medium ${item?.gap > 0 ? 'text-[hsl(var(--warning))]' : 'text-[hsl(var(--success))]'}`}>
              {item?.gap > 0 ? `+${item?.gap}%` : `${item?.gap}%`}
            </span>
          </div>
        </div>
        <p className="text-xs text-primary mt-2">Clique para filtrar diagnóstico</p>
      </div>
    );
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Maturidade por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data} onClick={handleClick} style={{ cursor: 'pointer' }}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Meta"
              dataKey="target"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.1}
              strokeDasharray="5 5"
            />
            <Radar
              name="Atual"
              dataKey="current"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
