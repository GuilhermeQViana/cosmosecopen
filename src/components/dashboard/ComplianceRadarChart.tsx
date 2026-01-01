import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import type { Assessment } from '@/hooks/useAssessments';

interface Control {
  id: string;
  category: string | null;
}

interface ComplianceRadarChartProps {
  controls: Control[];
  assessments: Assessment[];
}

// Convert maturity level to percentage
function maturityToPercent(level: string): number {
  const numLevel = parseInt(level, 10);
  return (numLevel / 5) * 100;
}

export function ComplianceRadarChart({ controls, assessments }: ComplianceRadarChartProps) {
  const data = useMemo(() => {
    // Group controls by category
    const categoryMap = new Map<string, { controlIds: Set<string> }>();
    
    controls.forEach(control => {
      const category = control.category || 'Outros';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { controlIds: new Set() });
      }
      categoryMap.get(category)!.controlIds.add(control.id);
    });

    // Calculate average maturity per category
    const chartData: { category: string; current: number; target: number }[] = [];

    categoryMap.forEach((value, category) => {
      const categoryAssessments = assessments.filter(a => value.controlIds.has(a.control_id));
      
      if (categoryAssessments.length > 0) {
        const avgCurrent = categoryAssessments.reduce((sum, a) => sum + maturityToPercent(a.maturity_level), 0) / categoryAssessments.length;
        const avgTarget = categoryAssessments.reduce((sum, a) => sum + maturityToPercent(a.target_maturity), 0) / categoryAssessments.length;
        
        chartData.push({
          category: category.length > 15 ? category.substring(0, 15) + '...' : category,
          current: Math.round(avgCurrent),
          target: Math.round(avgTarget),
        });
      }
    });

    return chartData;
  }, [controls, assessments]);

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

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Maturidade por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
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
