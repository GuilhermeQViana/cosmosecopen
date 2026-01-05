import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartSkeletonProps {
  type?: 'bar' | 'pie' | 'radar' | 'area' | 'list' | 'custom';
  height?: number;
  title?: boolean;
  description?: boolean;
}

export function ChartSkeleton({ 
  type = 'bar', 
  height = 250, 
  title = true,
  description = false 
}: ChartSkeletonProps) {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        {title && <Skeleton className="h-5 w-40" />}
        {description && <Skeleton className="h-4 w-56 mt-1" />}
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="flex items-end justify-center gap-2">
          {type === 'bar' && (
            <>
              <Skeleton className="w-10 h-[30%]" />
              <Skeleton className="w-10 h-[60%]" />
              <Skeleton className="w-10 h-[80%]" />
              <Skeleton className="w-10 h-[45%]" />
              <Skeleton className="w-10 h-[70%]" />
              <Skeleton className="w-10 h-[55%]" />
            </>
          )}
          {type === 'pie' && (
            <div className="flex items-center justify-center w-full h-full">
              <Skeleton className="w-40 h-40 rounded-full" />
            </div>
          )}
          {type === 'radar' && (
            <div className="flex items-center justify-center w-full h-full">
              <Skeleton className="w-48 h-48 rounded-full" />
            </div>
          )}
          {type === 'area' && (
            <div className="w-full h-full flex flex-col justify-end">
              <Skeleton className="w-full h-[70%] rounded-t-lg" />
            </div>
          )}
          {type === 'list' && (
            <div className="w-full h-full flex flex-col gap-3 justify-start pt-2">
              <Skeleton className="w-full h-12 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-lg" />
            </div>
          )}
          {type === 'custom' && (
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton className="w-32 h-32 rounded-full" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
