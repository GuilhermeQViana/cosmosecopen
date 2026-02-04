import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, theme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 rounded-full overflow-hidden",
        "hover:bg-accent/50 transition-colors duration-300",
        "group",
        className
      )}
      aria-label="Alternar tema"
    >
      {/* Sun icon */}
      <Sun 
        className={cn(
          "h-4 w-4 absolute transition-all duration-500 ease-in-out",
          "text-amber-500",
          resolvedTheme === 'dark' 
            ? "rotate-90 scale-0 opacity-0" 
            : "rotate-0 scale-100 opacity-100"
        )} 
      />
      
      {/* Moon icon */}
      <Moon 
        className={cn(
          "h-4 w-4 absolute transition-all duration-500 ease-in-out",
          "text-primary",
          resolvedTheme === 'dark' 
            ? "rotate-0 scale-100 opacity-100" 
            : "-rotate-90 scale-0 opacity-0"
        )} 
      />
      
      {/* Glow effect on hover */}
      <span 
        className={cn(
          "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100",
          "transition-opacity duration-300",
          resolvedTheme === 'dark' 
            ? "bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.3)]" 
            : "bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
        )}
      />
    </Button>
  );
}
