import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  SlidersHorizontal,
  X,
  AlertTriangle,
  Shield,
  FileCheck,
  ClipboardList,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

export interface AdvancedFilters {
  riskScore: ('baixo' | 'medio' | 'alto' | 'critico')[];
  weight: (1 | 2 | 3)[];
  hasEvidence: boolean | null;
  hasActionPlan: boolean | null;
}

interface AdvancedFiltersPanelProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  evidenceCounts: { with: number; without: number };
  actionPlanCounts: { with: number; without: number };
}

const RISK_SCORE_OPTIONS = [
  { value: 'baixo' as const, label: 'Baixo', color: 'bg-green-500', range: '0-2' },
  { value: 'medio' as const, label: 'Médio', color: 'bg-yellow-500', range: '3-5' },
  { value: 'alto' as const, label: 'Alto', color: 'bg-orange-500', range: '6-9' },
  { value: 'critico' as const, label: 'Crítico', color: 'bg-red-500', range: '≥10' },
];

const WEIGHT_OPTIONS = [
  { value: 1 as const, label: 'Peso 1', description: 'Baixa criticidade' },
  { value: 2 as const, label: 'Peso 2', description: 'Média criticidade' },
  { value: 3 as const, label: 'Peso 3', description: 'Alta criticidade' },
];

export function AdvancedFiltersPanel({
  filters,
  onChange,
  evidenceCounts,
  actionPlanCounts,
}: AdvancedFiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount =
    filters.riskScore.length +
    filters.weight.length +
    (filters.hasEvidence !== null ? 1 : 0) +
    (filters.hasActionPlan !== null ? 1 : 0);

  const handleRiskScoreChange = (value: 'baixo' | 'medio' | 'alto' | 'critico', checked: boolean) => {
    const newRiskScore = checked
      ? [...filters.riskScore, value]
      : filters.riskScore.filter((v) => v !== value);
    onChange({ ...filters, riskScore: newRiskScore });
  };

  const handleWeightChange = (value: 1 | 2 | 3, checked: boolean) => {
    const newWeight = checked
      ? [...filters.weight, value]
      : filters.weight.filter((v) => v !== value);
    onChange({ ...filters, weight: newWeight });
  };

  const handleEvidenceChange = (value: boolean | null) => {
    onChange({ ...filters, hasEvidence: value });
  };

  const handleActionPlanChange = (value: boolean | null) => {
    onChange({ ...filters, hasActionPlan: value });
  };

  const clearFilters = () => {
    onChange({
      riskScore: [],
      weight: [],
      hasEvidence: null,
      hasActionPlan: null,
    });
  };

  const removeFilter = (type: string, value?: any) => {
    switch (type) {
      case 'riskScore':
        onChange({ ...filters, riskScore: filters.riskScore.filter((v) => v !== value) });
        break;
      case 'weight':
        onChange({ ...filters, weight: filters.weight.filter((v) => v !== value) });
        break;
      case 'evidence':
        onChange({ ...filters, hasEvidence: null });
        break;
      case 'actionPlan':
        onChange({ ...filters, hasActionPlan: null });
        break;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'gap-2 h-8',
                activeFiltersCount > 0 && 'border-primary bg-primary/5'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros Avançados
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs bg-primary text-primary-foreground">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filtros Avançados</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 px-2 text-xs gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {/* Risk Score Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  Risk Score
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {RISK_SCORE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors',
                        filters.riskScore.includes(option.value)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      <Checkbox
                        checked={filters.riskScore.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleRiskScoreChange(option.value, checked as boolean)
                        }
                      />
                      <div className="flex items-center gap-1.5">
                        <div className={cn('w-2 h-2 rounded-full', option.color)} />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Weight Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Peso do Controle
                </div>
                <div className="space-y-1.5">
                  {WEIGHT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors',
                        filters.weight.includes(option.value)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      <Checkbox
                        checked={filters.weight.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleWeightChange(option.value, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({option.description})
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Evidence Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                  Evidências
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filters.hasEvidence === true ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleEvidenceChange(filters.hasEvidence === true ? null : true)}
                    className="flex-1 h-8 text-xs"
                  >
                    Com ({evidenceCounts.with})
                  </Button>
                  <Button
                    variant={filters.hasEvidence === false ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleEvidenceChange(filters.hasEvidence === false ? null : false)}
                    className="flex-1 h-8 text-xs"
                  >
                    Sem ({evidenceCounts.without})
                  </Button>
                </div>
              </div>

              {/* Action Plan Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  Planos de Ação
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filters.hasActionPlan === true ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleActionPlanChange(filters.hasActionPlan === true ? null : true)}
                    className="flex-1 h-8 text-xs"
                  >
                    Com ({actionPlanCounts.with})
                  </Button>
                  <Button
                    variant={filters.hasActionPlan === false ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleActionPlanChange(filters.hasActionPlan === false ? null : false)}
                    className="flex-1 h-8 text-xs"
                  >
                    Sem ({actionPlanCounts.without})
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filter Chips */}
        {filters.riskScore.map((risk) => {
          const option = RISK_SCORE_OPTIONS.find((o) => o.value === risk);
          return (
            <Badge
              key={`risk-${risk}`}
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-1 h-7"
            >
              <div className={cn('w-2 h-2 rounded-full', option?.color)} />
              {option?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('riskScore', risk)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}

        {filters.weight.map((w) => (
          <Badge
            key={`weight-${w}`}
            variant="secondary"
            className="gap-1 pl-2 pr-1 py-1 h-7"
          >
            Peso {w}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter('weight', w)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {filters.hasEvidence !== null && (
          <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1 h-7">
            <FileCheck className="h-3 w-3" />
            {filters.hasEvidence ? 'Com evidências' : 'Sem evidências'}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter('evidence')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {filters.hasActionPlan !== null && (
          <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1 h-7">
            <ClipboardList className="h-3 w-3" />
            {filters.hasActionPlan ? 'Com planos' : 'Sem planos'}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter('actionPlan')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-xs gap-1 text-muted-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Limpar todos
          </Button>
        )}
      </div>
    </div>
  );
}
