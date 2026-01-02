import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "cosmic" | "pulse" | "shimmer";
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted relative overflow-hidden",
        variant === "default" && "animate-pulse",
        variant === "cosmic" && "animate-pulse bg-gradient-to-r from-muted via-primary/10 to-muted dark:from-muted dark:via-primary/20 dark:to-muted",
        variant === "pulse" && "animate-cosmic-pulse",
        variant === "shimmer" && "after:absolute after:inset-0 after:translate-x-[-100%] after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent dark:after:via-white/5",
        className
      )}
      {...props}
    />
  );
}

interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  lastLineWidth?: string;
}

function SkeletonText({ lines = 3, lastLineWidth = "60%", className, ...props }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="shimmer"
          className="h-4"
          style={{ width: i === lines - 1 ? lastLineWidth : "100%" }}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm p-6 space-y-4",
        "dark:border-primary/10",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <Skeleton variant="cosmic" className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="shimmer" className="h-4 w-1/2" />
          <Skeleton variant="shimmer" className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

function SkeletonChart({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm p-6",
        "dark:border-primary/10",
        className
      )}
      {...props}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton variant="shimmer" className="h-5 w-32" />
          <Skeleton variant="shimmer" className="h-8 w-24 rounded-lg" />
        </div>
        <div className="flex items-end gap-2 h-48">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="cosmic"
              className="flex-1 rounded-t-md"
              style={{
                height: `${Math.random() * 60 + 40}%`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} variant="shimmer" className="h-3 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5, columns = 4, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { rows?: number; columns?: number }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm overflow-hidden",
        "dark:border-primary/10",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-border bg-muted/30">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="shimmer" className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-4 border-b border-border/50 last:border-0"
          style={{ animationDelay: `${rowIndex * 50}ms` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="shimmer"
              className="h-4 flex-1"
              style={{ animationDelay: `${(rowIndex * columns + colIndex) * 30}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonMetric({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm p-6",
        "dark:border-primary/10",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="shimmer" className="h-3 w-20" />
          <Skeleton variant="cosmic" className="h-8 w-16" />
        </div>
        <Skeleton variant="cosmic" className="h-12 w-12 rounded-full" />
      </div>
      <div className="mt-4">
        <Skeleton variant="shimmer" className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

function CosmicLoader({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: "3s" }} />
      {/* Middle ring */}
      <div className="absolute inset-1 rounded-full border-2 border-secondary/40 animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
      {/* Inner core */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse" />
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      </div>
    </div>
  );
}

function PageLoader({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <CosmicLoader size="lg" />
      <p className="text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonChart, 
  SkeletonTable, 
  SkeletonMetric,
  CosmicLoader,
  PageLoader
};
