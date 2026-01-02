import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        space: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Status colors
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        // Risk levels
        risk: {
          critical: "hsl(var(--risk-critical))",
          high: "hsl(var(--risk-high))",
          medium: "hsl(var(--risk-medium))",
          low: "hsl(var(--risk-low))",
          "very-low": "hsl(var(--risk-very-low))",
        },
        // Maturity levels
        maturity: {
          0: "hsl(var(--maturity-0))",
          1: "hsl(var(--maturity-1))",
          2: "hsl(var(--maturity-2))",
          3: "hsl(var(--maturity-3))",
          4: "hsl(var(--maturity-4))",
          5: "hsl(var(--maturity-5))",
        },
        // Conformity status
        conforme: "hsl(var(--conforme))",
        parcial: "hsl(var(--parcial))",
        "nao-conforme": "hsl(var(--nao-conforme))",
        // Charts
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
          6: "hsl(var(--chart-6))",
        },
        // Cosmic glow colors
        glow: {
          primary: "hsl(var(--glow-primary))",
          nebula: "hsl(var(--glow-nebula))",
        },
        // Nebula accent color
        nebula: "hsl(var(--nebula))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px hsl(var(--primary) / 0.3)" },
          "50%": { boxShadow: "0 0 30px hsl(var(--primary) / 0.6)" },
        },
        "twinkle": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "33%": { transform: "translateY(-10px) translateX(5px)" },
          "66%": { transform: "translateY(5px) translateX(-5px)" },
        },
        "shooting-star": {
          "0%": { 
            opacity: "0", 
            transform: "translateX(0) translateY(0) rotate(var(--tw-rotate))" 
          },
          "10%": { 
            opacity: "1" 
          },
          "70%": { 
            opacity: "1" 
          },
          "100%": { 
            opacity: "0", 
            transform: "translateX(300px) translateY(300px) rotate(var(--tw-rotate))" 
          },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "cosmic-pulse": {
          "0%, 100%": { 
            opacity: "0.4",
            boxShadow: "0 0 10px hsl(var(--primary) / 0.2)" 
          },
          "50%": { 
            opacity: "0.8",
            boxShadow: "0 0 20px hsl(var(--secondary) / 0.3)" 
          },
        },
        "stagger-fade-up": {
          "0%": { 
            opacity: "0", 
            transform: "translateY(20px)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        "stagger-fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "stagger-scale-in": {
          "0%": { 
            opacity: "0", 
            transform: "scale(0.9)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "scale(1)" 
          },
        },
        "stagger-slide-right": {
          "0%": { 
            opacity: "0", 
            transform: "translateX(-20px)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "translateX(0)" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "float-slow": "float-slow 10s ease-in-out infinite",
        "shooting-star": "shooting-star 2s ease-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "cosmic-pulse": "cosmic-pulse 2s ease-in-out infinite",
        "stagger-fade-up": "stagger-fade-up 0.5s ease-out",
        "stagger-fade-in": "stagger-fade-in 0.4s ease-out",
        "stagger-scale-in": "stagger-scale-in 0.4s ease-out",
        "stagger-slide-right": "stagger-slide-right 0.5s ease-out",
      },
      boxShadow: {
        "glow-sm": "0 0 10px hsl(var(--primary) / 0.3)",
        "glow-md": "0 0 20px hsl(var(--primary) / 0.4)",
        "glow-lg": "0 0 30px hsl(var(--primary) / 0.5)",
        "glow-nebula": "0 0 20px hsl(var(--secondary) / 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;