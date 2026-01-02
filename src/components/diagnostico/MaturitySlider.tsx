import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MATURITY_LEVELS, getMaturityGapDescription } from '@/lib/risk-methodology';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

const MATURITY_COLORS = [
  'bg-[hsl(var(--maturity-0))]',
  'bg-[hsl(var(--maturity-1))]',
  'bg-[hsl(var(--maturity-2))]',
  'bg-[hsl(var(--maturity-3))]',
  'bg-[hsl(var(--maturity-4))]',
  'bg-[hsl(var(--maturity-5))]',
];

interface MaturitySliderProps {
  value: number;
  target?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showLabels?: boolean;
  showEvidence?: boolean;
}

export function MaturitySlider({
  value,
  target = 3,
  onChange,
  disabled = false,
  showLabels = true,
  showEvidence = false,
}: MaturitySliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (values: number[]) => {
    const newValue = values[0];
    setLocalValue(newValue);
  };

  const handleCommit = (values: number[]) => {
    onChange(values[0]);
  };

  const currentMaturity = MATURITY_LEVELS[localValue as keyof typeof MATURITY_LEVELS];
  const gap = Math.max(0, target - localValue);
  const gapDescription = getMaturityGapDescription(gap);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm cursor-help',
                  MATURITY_COLORS[localValue]
                )}
              >
                {localValue}
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <div className="space-y-1 text-xs">
                <div className="font-semibold">{currentMaturity.label}</div>
                <p className="text-muted-foreground">{currentMaturity.description}</p>
                <div className="flex items-center gap-1 text-muted-foreground pt-1 border-t">
                  <FileText className="w-3 h-3" />
                  <span>Evidências: {currentMaturity.evidence}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
          {showLabels && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {currentMaturity.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {currentMaturity.description}
              </span>
            </div>
          )}
        </div>
        {target !== undefined && (
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Meta:</span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded font-medium text-white',
                  MATURITY_COLORS[target]
                )}
              >
                {target}
              </span>
            </div>
            {gap > 0 && (
              <span className="text-[10px] text-muted-foreground">
                Gap: {gap} - {gapDescription}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="relative pt-1">
        <Slider
          value={[localValue]}
          min={0}
          max={5}
          step={1}
          onValueChange={handleChange}
          onValueCommit={handleCommit}
          disabled={disabled}
          className="cursor-pointer"
        />
        
        {/* Level indicators */}
        <div className="flex justify-between mt-1 px-1">
          {[0, 1, 2, 3, 4, 5].map((level) => (
            <Tooltip key={level}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'text-[10px] font-medium transition-colors cursor-help',
                    localValue === level
                      ? 'text-primary'
                      : 'text-muted-foreground/50'
                  )}
                >
                  {level}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {MATURITY_LEVELS[level as keyof typeof MATURITY_LEVELS].label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Progress bar visualization */}
      <div className="maturity-bar">
        <div
          className={cn('maturity-fill', MATURITY_COLORS[localValue])}
          style={{ width: `${(localValue / 5) * 100}%` }}
        />
      </div>

      {/* Evidence section (optional) */}
      {showEvidence && showLabels && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <FileText className="w-3 h-3 flex-shrink-0" />
          <span><strong>Evidências típicas:</strong> {currentMaturity.evidence}</span>
        </div>
      )}
    </div>
  );
}
