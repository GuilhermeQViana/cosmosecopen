import { Badge } from '@/components/ui/badge';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import type { WorkflowApprover } from '@/hooks/usePolicyWorkflows';

interface WorkflowStepsPreviewProps {
  levels: number;
  approvers?: WorkflowApprover[];
  compact?: boolean;
  memberNames?: Record<string, string>;
}

export function WorkflowStepsPreview({ levels, approvers, compact = false, memberNames = {} }: WorkflowStepsPreviewProps) {
  const effectiveApprovers = approvers && approvers.length > 0 ? approvers : null;
  const stepCount = effectiveApprovers ? effectiveApprovers.length : levels;

  const steps = [
    ...Array.from({ length: stepCount }, (_, i) => {
      const approver = effectiveApprovers?.[i];
      const name = approver?.approver_id ? memberNames[approver.approver_id] : null;
      const dept = approver?.department;
      let label: string;
      if (compact) {
        label = dept || `N${i + 1}`;
      } else {
        label = name || dept || `Nível ${i + 1}`;
      }
      return {
        label,
        sublabel: !compact && name && dept ? dept : undefined,
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      };
    }),
    {
      label: compact ? '✓' : 'Aprovada',
      sublabel: undefined as string | undefined,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
  ];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1">
          {i === steps.length - 1 ? (
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${step.color}`}>
              <CheckCircle2 className="w-3 h-3" />
              {step.label}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Badge variant="outline" className={`text-xs ${step.color}`}>
                {step.label}
              </Badge>
              {step.sublabel && (
                <span className="text-[9px] text-muted-foreground/70 mt-0.5">{step.sublabel}</span>
              )}
            </div>
          )}
          {i < steps.length - 1 && (
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          )}
        </div>
      ))}
    </div>
  );
}
