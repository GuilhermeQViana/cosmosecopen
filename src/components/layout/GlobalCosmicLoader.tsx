import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function GlobalCosmicLoader() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading animation on route change
    setIsLoading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 20;
      });
    }, 50);

    // Complete the loading after a short delay
    const completeTimer = setTimeout(() => {
      setProgress(100);
      clearInterval(progressInterval);
      
      // Hide loader after completion animation
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    }, 400);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [location.pathname]);

  if (!isLoading) return null;

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1">
        <div 
          className="h-full bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
        {/* Glowing effect at the end */}
        <div 
          className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent to-white/50 blur-sm transition-all duration-200"
          style={{ left: `calc(${progress}% - 32px)` }}
        />
      </div>

      {/* Cosmic overlay - subtle */}
      <div 
        className={cn(
          "fixed inset-0 z-[99] pointer-events-none transition-opacity duration-300",
          progress < 100 ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Subtle cosmic dust particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: `${800 + Math.random() * 400}ms`,
              }}
            />
          ))}
        </div>

        {/* Cosmic glow in center */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse"
          style={{ animationDuration: '1s' }}
        />
      </div>
    </>
  );
}

// Compact loader for smaller loading states
export function CosmicSpinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer orbital ring */}
      <div 
        className="absolute inset-0 rounded-full border-2 border-primary/30"
        style={{
          animation: 'spin 3s linear infinite',
        }}
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
      </div>

      {/* Middle ring */}
      <div 
        className="absolute inset-1 rounded-full border border-secondary/40"
        style={{
          animation: 'spin 2s linear infinite reverse',
        }}
      >
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-secondary" />
      </div>

      {/* Core */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 animate-pulse" />

      {/* Center star */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
      </div>
    </div>
  );
}

// Full page loader for initial app loading
export function CosmicPageLoader({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
      {/* Cosmic background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Nebula blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />

        {/* Stars */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white/60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${1 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Loader content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <CosmicSpinner size="lg" />
        <p className="text-muted-foreground text-sm animate-pulse">{message}</p>
      </div>
    </div>
  );
}
