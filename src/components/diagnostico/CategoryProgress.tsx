import { Progress } from '@/components/ui/progress';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';

interface CategoryProgressProps {
  category: string;
  controls: Control[];
  assessments: Assessment[];
}

export function CategoryProgress({ category, controls, assessments }: CategoryProgressProps) {
  const assessmentMap = new Map(assessments.map((a) => [a.control_id, a]));
  
  const categoryControls = controls.filter((c) => c.category === category);
  const totalControls = categoryControls.length;
  
  const conformeCount = categoryControls.filter((c) => {
    const assessment = assessmentMap.get(c.id);
    return assessment?.status === 'conforme';
  }).length;
  
  const assessedCount = categoryControls.filter((c) => assessmentMap.has(c.id)).length;
  
  const conformePercent = totalControls > 0 ? Math.round((conformeCount / totalControls) * 100) : 0;
  const assessedPercent = totalControls > 0 ? Math.round((assessedCount / totalControls) * 100) : 0;

  return (
    <div className="flex items-center gap-3 ml-auto">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{assessedCount}/{totalControls} avaliados</span>
        <Progress value={assessedPercent} className="h-1.5 w-16" />
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[hsl(var(--conforme))]">{conformePercent}% conforme</span>
        <Progress 
          value={conformePercent} 
          className="h-1.5 w-16 [&>div]:bg-[hsl(var(--conforme))]" 
        />
      </div>
    </div>
  );
}
