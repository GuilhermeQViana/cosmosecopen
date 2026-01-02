import { ReactNode, Children, isValidElement, cloneElement } from 'react';
import { cn } from '@/lib/utils';

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number; // delay between each item in ms
  initialDelay?: number; // initial delay before first item
  animation?: 'fade-up' | 'fade-in' | 'scale-in' | 'slide-right';
}

export function StaggeredList({
  children,
  className,
  staggerDelay = 50,
  initialDelay = 0,
  animation = 'fade-up',
}: StaggeredListProps) {
  const animationClasses = {
    'fade-up': 'animate-stagger-fade-up',
    'fade-in': 'animate-stagger-fade-in',
    'scale-in': 'animate-stagger-scale-in',
    'slide-right': 'animate-stagger-slide-right',
  };

  const childrenArray = Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => {
        if (!isValidElement(child)) return child;

        const delay = initialDelay + index * staggerDelay;

        return (
          <div
            key={index}
            className={cn(animationClasses[animation], 'opacity-0')}
            style={{
              animationDelay: `${delay}ms`,
              animationFillMode: 'forwards',
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

interface StaggeredGridProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  animation?: 'fade-up' | 'fade-in' | 'scale-in' | 'slide-right';
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function StaggeredGrid({
  children,
  className,
  staggerDelay = 75,
  initialDelay = 0,
  animation = 'fade-up',
  columns = 3,
}: StaggeredGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <StaggeredList
      className={cn('grid gap-4', columnClasses[columns], className)}
      staggerDelay={staggerDelay}
      initialDelay={initialDelay}
      animation={animation}
    >
      {children}
    </StaggeredList>
  );
}

interface AnimatedItemProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-up' | 'fade-in' | 'scale-in' | 'slide-right';
}

export function AnimatedItem({
  children,
  className,
  delay = 0,
  animation = 'fade-up',
}: AnimatedItemProps) {
  const animationClasses = {
    'fade-up': 'animate-stagger-fade-up',
    'fade-in': 'animate-stagger-fade-in',
    'scale-in': 'animate-stagger-scale-in',
    'slide-right': 'animate-stagger-slide-right',
  };

  return (
    <div
      className={cn(animationClasses[animation], 'opacity-0', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {children}
    </div>
  );
}
