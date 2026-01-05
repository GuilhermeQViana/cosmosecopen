import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartSkeleton } from './ChartSkeleton';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';
import type { Risk } from '@/hooks/useRisks';

interface TopThreatsWidgetProps {
  risks: Risk[];
  isLoading?: boolean;
}

function getRiskLevel(probability: number, impact: number): { level: string; color: string; score: number } {
  const score = probability * impact;
  if (score >= 20) return { level: 'Crítico', color: 'hsl(var(--risk-critical))', score };
  if (score >= 12) return { level: 'Alto', color: 'hsl(var(--risk-high))', score };
  if (score >= 6) return { level: 'Médio', color: 'hsl(var(--risk-medium))', score };
  return { level: 'Baixo', color: 'hsl(var(--risk-low))', score };
}

export function TopThreatsWidget({ risks, isLoading }: TopThreatsWidgetProps) {
  const navigate = useNavigate();

  const topRisks = useMemo(() => {
    return [...risks]
      .map(risk => {
        const { level, color, score } = getRiskLevel(risk.inherent_probability, risk.inherent_impact);
        const daysOpen = differenceInDays(new Date(), parseISO(risk.created_at));
        
        // Calculate trend based on residual vs inherent
        let trend: 'improving' | 'worsening' | 'stable' = 'stable';
        if (risk.residual_probability && risk.residual_impact) {
          const residualScore = risk.residual_probability * risk.residual_impact;
          if (residualScore < score * 0.7) trend = 'improving';
          else if (residualScore > score) trend = 'worsening';
        }

        return {
          ...risk,
          level,
          color,
          score,
          daysOpen,
          trend,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [risks]);

  if (isLoading) {
    return <ChartSkeleton type="custom" height={280} />;
  }

  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Top Ameaças
          </CardTitle>
          <CardDescription>Os 5 riscos mais críticos</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-muted-foreground text-center">
            Nenhum risco cadastrado.<br />
            Acesse a página de Riscos para adicionar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--risk-critical))]" />
              Top Ameaças
            </CardTitle>
            <CardDescription>Os 5 riscos mais críticos</CardDescription>
          </div>
          <button
            onClick={() => navigate('/riscos')}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Ver todos
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topRisks.map((risk, index) => (
            <button
              key={risk.id}
              onClick={() => navigate(`/riscos?selected=${risk.id}`)}
              className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: risk.color }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{risk.code}</span>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-1.5"
                        style={{ 
                          borderColor: `${risk.color}50`,
                          color: risk.color,
                          backgroundColor: `${risk.color}10`
                        }}
                      >
                        {risk.level}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {risk.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="font-mono">Score: {risk.score}</span>
                      <span>•</span>
                      <span>{risk.daysOpen}d aberto</span>
                      {risk.category && (
                        <>
                          <span>•</span>
                          <span>{risk.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {risk.trend === 'improving' && (
                    <TrendingDown className="h-4 w-4 text-[hsl(var(--success))]" />
                  )}
                  {risk.trend === 'worsening' && (
                    <TrendingUp className="h-4 w-4 text-[hsl(var(--risk-high))]" />
                  )}
                  {risk.trend === 'stable' && (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
