import { useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  BarChart3,
  FileText,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

interface ControlData {
  id: string;
  code: string;
  name: string;
  weight: number;
  maturity_level: string;
  target_maturity: string;
  status: string;
  riskScore: number;
}

interface CategoryDashboardProps {
  categoryName: string;
  controls: ControlData[];
  onControlClick?: (controlId: string) => void;
  onExportCategory?: () => void;
}

export function CategoryDashboard({
  categoryName,
  controls,
  onControlClick,
  onExportCategory,
}: CategoryDashboardProps) {
  const metrics = useMemo(() => {
    if (!controls.length) return null;

    const totalControls = controls.length;
    const avgMaturity = controls.reduce((acc, c) => acc + (parseInt(c.maturity_level) || 0), 0) / totalControls;
    const avgTarget = controls.reduce((acc, c) => acc + (parseInt(c.target_maturity) || 3), 0) / totalControls;
    const conformeCount = controls.filter(c => c.status === "conforme").length;
    const parcialCount = controls.filter(c => c.status === "parcial").length;
    const naoConformeCount = controls.filter(c => c.status === "nao_conforme").length;
    const naCount = controls.filter(c => c.status === "nao_aplicavel").length;
    const avgRiskScore = controls.reduce((acc, c) => acc + c.riskScore, 0) / totalControls;
    const criticalControls = controls.filter(c => c.riskScore >= 10);
    const highRiskControls = controls.filter(c => c.riskScore >= 6 && c.riskScore < 10);

    const conformityRate = ((conformeCount + parcialCount * 0.5) / (totalControls - naCount)) * 100 || 0;
    const maturityGap = avgTarget - avgMaturity;

    return {
      totalControls,
      avgMaturity: avgMaturity.toFixed(1),
      avgTarget: avgTarget.toFixed(1),
      conformeCount,
      parcialCount,
      naoConformeCount,
      naCount,
      conformityRate: conformityRate.toFixed(0),
      maturityGap: maturityGap.toFixed(1),
      avgRiskScore: avgRiskScore.toFixed(1),
      criticalControls,
      highRiskControls,
    };
  }, [controls]);

  const radarData = useMemo(() => {
    // Group by subcategory or use first 6 controls
    const dataPoints = controls.slice(0, 6).map(control => ({
      subject: control.code,
      atual: parseInt(control.maturity_level) || 0,
      meta: parseInt(control.target_maturity) || 3,
      fullMark: 5,
    }));
    return dataPoints;
  }, [controls]);

  const priorityActions = useMemo(() => {
    return controls
      .filter(c => c.status !== "conforme" && c.status !== "nao_aplicavel")
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        riskScore: c.riskScore,
        gap: (parseInt(c.target_maturity) || 3) - (parseInt(c.maturity_level) || 0),
      }));
  }, [controls]);

  if (!metrics) return null;

  return (
    <div className="p-4 bg-muted/30 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{categoryName}</h3>
          <p className="text-sm text-muted-foreground">
            {metrics.totalControls} controles nesta categoria
          </p>
        </div>
        {onExportCategory && (
          <Button variant="outline" size="sm" onClick={onExportCategory}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Maturidade Média"
          value={metrics.avgMaturity}
          suffix="/5"
          icon={BarChart3}
          trend={parseFloat(metrics.avgMaturity) >= parseFloat(metrics.avgTarget) ? "up" : "down"}
        />
        <MetricCard
          label="Taxa de Conformidade"
          value={metrics.conformityRate}
          suffix="%"
          icon={CheckCircle2}
          trend={parseInt(metrics.conformityRate) >= 80 ? "up" : parseInt(metrics.conformityRate) >= 50 ? "neutral" : "down"}
        />
        <MetricCard
          label="Gap de Maturidade"
          value={metrics.maturityGap}
          icon={Target}
          trend={parseFloat(metrics.maturityGap) <= 1 ? "up" : "down"}
        />
        <MetricCard
          label="Risk Score Médio"
          value={metrics.avgRiskScore}
          icon={AlertTriangle}
          trend={parseFloat(metrics.avgRiskScore) < 3 ? "up" : parseFloat(metrics.avgRiskScore) < 6 ? "neutral" : "down"}
        />
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-background/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribuição de Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatusBar label="Conforme" count={metrics.conformeCount} total={metrics.totalControls} color="bg-green-500" />
            <StatusBar label="Parcial" count={metrics.parcialCount} total={metrics.totalControls} color="bg-yellow-500" />
            <StatusBar label="Não Conforme" count={metrics.naoConformeCount} total={metrics.totalControls} color="bg-red-500" />
            <StatusBar label="N/A" count={metrics.naCount} total={metrics.totalControls} color="bg-muted" />
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="bg-background/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Radar de Maturidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Atual"
                    dataKey="atual"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Meta"
                    dataKey="meta"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.1}
                    strokeDasharray="5 5"
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Actions */}
      {priorityActions.length > 0 && (
        <Card className="bg-background/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Ações Prioritárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {priorityActions.map((action, index) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-2 rounded bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => onControlClick?.(action.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div>
                      <span className="text-sm font-medium">{action.code}</span>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {action.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        action.riskScore >= 10 && "border-red-500 text-red-500",
                        action.riskScore >= 6 && action.riskScore < 10 && "border-orange-500 text-orange-500",
                        action.riskScore < 6 && "border-muted"
                      )}
                    >
                      RS: {action.riskScore}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Alerts */}
      {metrics.criticalControls.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-500">
              {metrics.criticalControls.length} controle(s) com risco crítico
            </p>
            <p className="text-xs text-muted-foreground">
              Ação imediata requerida para: {metrics.criticalControls.map(c => c.code).join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}

function MetricCard({ label, value, suffix, icon: Icon, trend }: MetricCardProps) {
  return (
    <div className="p-3 rounded-lg bg-background/50 border">
      <div className="flex items-center justify-between mb-1">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {trend && (
          <div className={cn(
            trend === "up" && "text-green-500",
            trend === "down" && "text-red-500",
            trend === "neutral" && "text-yellow-500"
          )}>
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold">
        {value}
        {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

interface StatusBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function StatusBar({ label, count, total, color }: StatusBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
