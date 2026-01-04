import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryData {
  category: string;
  avgMaturity: number;
  avgTarget: number;
  gap: number;
  controlCount: number;
}

interface MaturityComparisonChartProps {
  categories: CategoryData[];
  benchmark?: number;
}

export function MaturityComparisonChart({
  categories,
  benchmark = 3,
}: MaturityComparisonChartProps) {
  const chartData = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.category.length > 15 ? cat.category.slice(0, 15) + "..." : cat.category,
      fullName: cat.category,
      atual: parseFloat(cat.avgMaturity.toFixed(1)),
      meta: parseFloat(cat.avgTarget.toFixed(1)),
      benchmark,
      gap: parseFloat(cat.gap.toFixed(1)),
      controlCount: cat.controlCount,
    }));
  }, [categories, benchmark]);

  const overallStats = useMemo(() => {
    if (categories.length === 0) return null;
    
    const totalGap = categories.reduce((acc, c) => acc + c.gap, 0);
    const avgGap = totalGap / categories.length;
    const avgMaturity = categories.reduce((acc, c) => acc + c.avgMaturity, 0) / categories.length;
    const avgTarget = categories.reduce((acc, c) => acc + c.avgTarget, 0) / categories.length;
    const categoriesAboveBenchmark = categories.filter(c => c.avgMaturity >= benchmark).length;

    return {
      avgGap: avgGap.toFixed(1),
      avgMaturity: avgMaturity.toFixed(1),
      avgTarget: avgTarget.toFixed(1),
      categoriesAboveBenchmark,
      percentAboveBenchmark: ((categoriesAboveBenchmark / categories.length) * 100).toFixed(0),
    };
  }, [categories, benchmark]);

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Sem dados para exibir</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Comparação de Maturidade por Categoria
          </CardTitle>
          {overallStats && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                Gap Médio: {overallStats.avgGap}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  parseFloat(overallStats.percentAboveBenchmark) >= 70 && "border-green-500 text-green-600",
                  parseFloat(overallStats.percentAboveBenchmark) < 50 && "border-red-500 text-red-600"
                )}
              >
                {overallStats.percentAboveBenchmark}% acima do benchmark
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
                      <p className="font-medium mb-2">{data.fullName}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Maturidade Atual:</span>
                          <span className="font-medium text-primary">{data.atual}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Meta:</span>
                          <span className="font-medium text-chart-2">{data.meta}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Gap:</span>
                          <span className={cn(
                            "font-medium",
                            data.gap > 0 ? "text-red-500" : "text-green-500"
                          )}>
                            {data.gap > 0 ? `+${data.gap}` : data.gap}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t">
                          <span className="text-muted-foreground">Controles:</span>
                          <span>{data.controlCount}</span>
                        </div>
                      </div>
                      {data.gap > 1 && (
                        <div className="mt-2 pt-2 border-t text-xs text-amber-600">
                          ⚠️ Gap significativo - ação recomendada
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Legend />
              <ReferenceLine
                y={benchmark}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                label={{ value: `Benchmark (${benchmark})`, position: "right", fontSize: 10 }}
              />
              <Bar 
                dataKey="atual" 
                name="Maturidade Atual" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="meta" 
                name="Meta" 
                fill="hsl(var(--chart-2))" 
                radius={[4, 4, 0, 0]}
                fillOpacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gap Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {chartData
            .filter(d => d.gap > 0)
            .sort((a, b) => b.gap - a.gap)
            .slice(0, 4)
            .map((cat) => (
              <div
                key={cat.fullName}
                className="p-2 rounded-lg bg-muted/50 border"
              >
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-xs font-medium truncate">{cat.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Gap:</span>
                  <Badge variant="outline" className="text-xs border-red-500/50 text-red-500">
                    -{cat.gap}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function useMaturityComparison(
  controls: Array<{ id: string; category: string | null }>,
  assessments: Array<{ control_id: string; maturity_level: string; target_maturity: string }>
) {
  return useMemo(() => {
    const categoryMap = new Map<string, { maturities: number[]; targets: number[] }>();

    controls.forEach((control) => {
      const category = control.category || "Sem Categoria";
      const assessment = assessments.find((a) => a.control_id === control.id);
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { maturities: [], targets: [] });
      }

      const data = categoryMap.get(category)!;
      const maturity = assessment ? parseInt(assessment.maturity_level) : 0;
      const target = assessment ? parseInt(assessment.target_maturity) : 3;
      
      data.maturities.push(maturity);
      data.targets.push(target);
    });

    const categories: CategoryData[] = Array.from(categoryMap.entries()).map(([category, data]) => {
      const avgMaturity = data.maturities.reduce((a, b) => a + b, 0) / data.maturities.length;
      const avgTarget = data.targets.reduce((a, b) => a + b, 0) / data.targets.length;
      
      return {
        category,
        avgMaturity,
        avgTarget,
        gap: avgTarget - avgMaturity,
        controlCount: data.maturities.length,
      };
    });

    return categories.sort((a, b) => b.gap - a.gap);
  }, [controls, assessments]);
}
