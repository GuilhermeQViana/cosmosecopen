import { cn } from "@/lib/utils";

interface CosmoSecLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "full" | "icon";
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 40, text: "text-2xl" },
  xl: { icon: 56, text: "text-3xl" },
};

export const CosmoSecLogo = ({ 
  className, 
  size = "md", 
  showText = true,
  variant = "full" 
}: CosmoSecLogoProps) => {
  const { icon, text } = sizeMap[size];
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer orbit ring */}
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="url(#orbitGradient)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          className="animate-[spin_30s_linear_infinite]"
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Middle orbit ring */}
        <circle
          cx="32"
          cy="32"
          r="20"
          stroke="url(#orbitGradient2)"
          strokeWidth="1"
          strokeDasharray="3 5"
          className="animate-[spin_20s_linear_infinite_reverse]"
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Central shield/star shape */}
        <path
          d="M32 8L36.5 24.5L52 20L43.5 32L52 44L36.5 39.5L32 56L27.5 39.5L12 44L20.5 32L12 20L27.5 24.5L32 8Z"
          fill="url(#starGradient)"
          className="drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]"
        />
        
        {/* Inner core */}
        <circle
          cx="32"
          cy="32"
          r="8"
          fill="url(#coreGradient)"
          className="drop-shadow-[0_0_12px_rgba(147,197,253,0.8)]"
        />
        
        {/* Central dot */}
        <circle
          cx="32"
          cy="32"
          r="3"
          fill="white"
          className="drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
        />
        
        {/* Constellation dots */}
        <circle cx="10" cy="18" r="1.5" fill="hsl(var(--nebula))" className="animate-pulse" />
        <circle cx="54" cy="14" r="1" fill="hsl(var(--nebula))" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        <circle cx="58" cy="42" r="1.5" fill="hsl(var(--nebula))" className="animate-pulse" style={{ animationDelay: '1s' }} />
        <circle cx="8" cy="48" r="1" fill="hsl(var(--nebula))" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
        <circle cx="48" cy="56" r="1" fill="hsl(var(--nebula))" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
        <circle cx="16" cy="8" r="1" fill="hsl(var(--nebula))" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
        
        {/* Constellation lines */}
        <line x1="10" y1="18" x2="16" y2="8" stroke="hsl(var(--nebula))" strokeWidth="0.5" opacity="0.4" />
        <line x1="54" y1="14" x2="58" y2="42" stroke="hsl(var(--nebula))" strokeWidth="0.5" opacity="0.4" />
        <line x1="8" y1="48" x2="48" y2="56" stroke="hsl(var(--nebula))" strokeWidth="0.5" opacity="0.4" />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(217, 91%, 60%)" />
            <stop offset="100%" stopColor="hsl(199, 89%, 70%)" />
          </linearGradient>
          
          <linearGradient id="orbitGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(199, 89%, 70%)" />
            <stop offset="100%" stopColor="hsl(217, 91%, 60%)" />
          </linearGradient>
          
          <linearGradient id="starGradient" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(217, 91%, 60%)" />
            <stop offset="50%" stopColor="hsl(210, 80%, 55%)" />
            <stop offset="100%" stopColor="hsl(199, 89%, 48%)" />
          </linearGradient>
          
          <radialGradient id="coreGradient" cx="32" cy="32" r="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(199, 89%, 80%)" />
            <stop offset="100%" stopColor="hsl(217, 91%, 60%)" />
          </radialGradient>
        </defs>
      </svg>
      
      {showText && variant === "full" && (
        <span className={cn(
          "font-bold tracking-tight font-['Space_Grotesk',sans-serif]",
          text
        )}>
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Cosmo
          </span>
          <span className="text-foreground">Sec</span>
        </span>
      )}
    </div>
  );
};
