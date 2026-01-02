import { Risk, calculateRiskLevel, getRiskLevelColor, getRiskLevelLabel, TREATMENT_OPTIONS } from '@/hooks/useRisks';
import { useRiskHistory, getRiskTrend } from '@/hooks/useRiskHistory';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Edit, Trash2, Link2, TrendingDown, TrendingUp, Minus, Eye, User } from 'lucide-react';

interface RiskCardProps {
  risk: Risk;
  onEdit: (risk: Risk) => void;
  onDelete: (risk: Risk) => void;
  onLinkControls: (risk: Risk) => void;
  onViewDetails?: (risk: Risk) => void;
}

export function RiskCard({ risk, onEdit, onDelete, onLinkControls, onViewDetails }: RiskCardProps) {
  const { data: history } = useRiskHistory(risk.id);
  const trend = history ? getRiskTrend(history) : null;
  
  const inherentLevel = calculateRiskLevel(risk.inherent_probability, risk.inherent_impact);
  const residualLevel = risk.residual_probability && risk.residual_impact
    ? calculateRiskLevel(risk.residual_probability, risk.residual_impact)
    : null;

  const treatmentLabel = TREATMENT_OPTIONS.find(t => t.value === risk.treatment)?.label || risk.treatment;

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Card className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails?.(risk)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs">
                {risk.code}
              </Badge>
              {risk.category && (
                <Badge variant="secondary" className="text-xs">
                  {risk.category}
                </Badge>
              )}
              {/* Controls count badge */}
              {(risk.controls_count ?? 0) > 0 && (
                <Badge variant="outline" className="gap-1 text-xs border-primary/30 text-primary">
                  <Link2 className="h-3 w-3" />
                  {risk.controls_count}
                </Badge>
              )}
              {/* Trend indicator */}
              {trend && trend !== 'stable' && (
                <Badge
                  variant="outline"
                  className={cn(
                    'gap-1 text-xs',
                    trend === 'improving' && 'border-green-500/50 text-green-600',
                    trend === 'worsening' && 'border-red-500/50 text-red-600'
                  )}
                >
                  {trend === 'improving' && <TrendingDown className="h-3 w-3" />}
                  {trend === 'worsening' && <TrendingUp className="h-3 w-3" />}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm leading-tight">{risk.title}</h3>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onViewDetails && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); onViewDetails(risk); }}
                title="Ver detalhes"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onLinkControls(risk); }}
              title="Vincular controles"
            >
              <Link2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onEdit(risk); }}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(risk); }}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {risk.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {risk.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Risco Inerente */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Risco Inerente</span>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold',
                  getRiskLevelColor(inherentLevel)
                )}
              >
                {inherentLevel}
              </div>
              <div className="text-xs">
                <div className="font-medium">{getRiskLevelLabel(inherentLevel)}</div>
                <div className="text-muted-foreground">
                  P:{risk.inherent_probability} × I:{risk.inherent_impact}
                </div>
              </div>
            </div>
          </div>

          {/* Risco Residual */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Risco Residual</span>
            {residualLevel !== null ? (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold',
                    getRiskLevelColor(residualLevel)
                  )}
                >
                  {residualLevel}
                </div>
                <div className="text-xs">
                  <div className="font-medium flex items-center gap-1">
                    {getRiskLevelLabel(residualLevel)}
                    {residualLevel < inherentLevel && (
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    P:{risk.residual_probability} × I:{risk.residual_impact}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">
                Não avaliado
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              risk.treatment === 'mitigar' && 'border-blue-500 text-blue-600',
              risk.treatment === 'aceitar' && 'border-yellow-500 text-yellow-600',
              risk.treatment === 'transferir' && 'border-purple-500 text-purple-600',
              risk.treatment === 'evitar' && 'border-red-500 text-red-600'
            )}
          >
            {treatmentLabel}
          </Badge>
          
          {/* Owner display */}
          {risk.owner && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={risk.owner.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(risk.owner.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {risk.owner.full_name || 'Sem nome'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
