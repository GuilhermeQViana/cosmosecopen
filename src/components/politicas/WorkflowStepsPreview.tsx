import { Badge } from '@/components/ui/badge';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

interface WorkflowStepsPreviewProps {
  levels: number;
  compact?: boolean;
}

export function WorkflowStepsPreview({ levels, compact = false }: WorkflowStepsPreviewProps) {
  const steps = [
    ...Array.from({ length: levels }, (_, i) => ({
      label: compact ? `N${i + 1}` : `Nível ${i + 1}`,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    })),
    {
      label: compact ? '✓' : 'Aprovada',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
  ];

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1">
          {i === steps.length - 1 ? (
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${step.color}`}>
              <CheckCircle2 className="w-3 h-3" />
              {step.label}
            </div>
          ) : (
            <Badge variant="outline" className={`text-xs ${step.color}`}>
              {step.label}
            </Badge>
          )}
          {i < steps.length - 1 && (
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          )}
        </div>
      ))}
    </div>
  );
}
