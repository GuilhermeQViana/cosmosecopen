import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
  type: 'star' | 'dust';
}

interface StarFieldProps {
  starCount?: number;
  dustCount?: number;
  className?: string;
}

export function StarField({ starCount = 50, dustCount = 30, className }: StarFieldProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => {
    const stars: Star[] = [];
    
    // Generate stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        animationDuration: Math.random() * 4 + 3,
        animationDelay: Math.random() * 5,
        type: 'star',
      });
    }
    
    // Generate cosmic dust
    for (let i = 0; i < dustCount; i++) {
      stars.push({
        id: starCount + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.15 + 0.05,
        animationDuration: Math.random() * 8 + 10,
        animationDelay: Math.random() * 8,
        type: 'dust',
      });
    }
    
    return stars;
  }, [starCount, dustCount]);

  if (!mounted) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 pointer-events-none overflow-hidden z-0 dark:block hidden",
        className
      )}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            "absolute rounded-full",
            particle.type === 'star' 
              ? "bg-secondary animate-twinkle" 
              : "bg-primary/30 animate-float-slow"
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.animationDuration}s`,
            animationDelay: `${particle.animationDelay}s`,
            boxShadow: particle.type === 'star' 
              ? `0 0 ${particle.size * 2}px hsl(var(--secondary) / 0.6)` 
              : 'none',
          }}
        />
      ))}
      
      {/* Nebula gradient overlays */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-1/2 opacity-[0.03] blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at top right, hsl(var(--primary)), transparent 70%)',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-1/3 h-1/3 opacity-[0.02] blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at bottom left, hsl(var(--secondary)), transparent 70%)',
        }}
      />
    </div>
  );
}