import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TourProgressBarProps {
  progress: number;
  className?: string;
}

export function TourProgressBar({ progress, className }: TourProgressBarProps) {
  return (
    <div className={cn('fixed top-16 lg:top-20 left-0 right-0 z-40', className)}>
      <Progress 
        value={progress} 
        className="h-1 rounded-none bg-muted/50"
      />
    </div>
  );
}
