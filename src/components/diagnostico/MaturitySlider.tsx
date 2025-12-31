import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const MATURITY_LABELS = [
  { level: 0, label: 'Inexistente', description: 'Não existe processo definido' },
  { level: 1, label: 'Inicial', description: 'Processos ad-hoc e reativos' },
  { level: 2, label: 'Gerenciado', description: 'Processos planejados e documentados' },
  { level: 3, label: 'Definido', description: 'Processos padronizados na organização' },
  { level: 4, label: 'Gerenciado Quantitativamente', description: 'Processos medidos e controlados' },
  { level: 5, label: 'Otimizado', description: 'Melhoria contínua baseada em métricas' },
];

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
}

export function MaturitySlider({
  value,
  target = 3,
  onChange,
  disabled = false,
  showLabels = true,
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

  const currentMaturity = MATURITY_LABELS[localValue];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm',
              MATURITY_COLORS[localValue]
            )}
          >
            {localValue}
          </div>
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
            <div
              key={level}
              className={cn(
                'text-[10px] font-medium transition-colors',
                localValue === level
                  ? 'text-primary'
                  : 'text-muted-foreground/50'
              )}
            >
              {level}
            </div>
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
    </div>
  );
}
