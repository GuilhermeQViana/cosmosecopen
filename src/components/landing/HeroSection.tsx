import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Lock, BarChart3, Eye, FileCheck, Network } from 'lucide-react';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';

function HeroIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center">
      {/* Outer orbit */}
      <div 
        className="absolute w-[90%] h-[90%] rounded-full border border-primary/20 dark:border-primary/30 animate-[spin_40s_linear_infinite]"
        style={{ transformOrigin: 'center' }}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary/20 dark:bg-primary/30 backdrop-blur-sm flex items-center justify-center shadow-[0_0_12px_hsl(var(--primary)/0.4)]">
          <Lock className="w-3 h-3 text-primary" />
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-secondary/20 dark:bg-secondary/30 backdrop-blur-sm flex items-center justify-center shadow-[0_0_12px_hsl(var(--secondary)/0.4)]">
          <Eye className="w-3 h-3 text-secondary" />
        </div>
      </div>

      {/* Middle orbit */}
      <div 
        className="absolute w-[65%] h-[65%] rounded-full border border-secondary/20 dark:border-secondary/30 animate-[spin_25s_linear_infinite_reverse]"
        style={{ transformOrigin: 'center' }}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-secondary/20 dark:bg-secondary/30 backdrop-blur-sm flex items-center justify-center shadow-[0_0_14px_hsl(var(--secondary)/0.4)]">
          <BarChart3 className="w-3.5 h-3.5 text-secondary" />
        </div>
        <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-7 h-7 rounded-full bg-primary/20 dark:bg-primary/30 backdrop-blur-sm flex items-center justify-center shadow-[0_0_14px_hsl(var(--primary)/0.4)]">
          <FileCheck className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-primary/15 dark:bg-primary/25 backdrop-blur-sm flex items-center justify-center shadow-[0_0_10px_hsl(var(--primary)/0.3)]">
          <Network className="w-3 h-3 text-primary" />
        </div>
      </div>

      {/* Inner orbit */}
      <div className="absolute w-[40%] h-[40%] rounded-full border border-primary/15 dark:border-primary/25 animate-[spin_15s_linear_infinite]" style={{ transformOrigin: 'center' }} />

      {/* Central CosmoSec Logo */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 dark:from-primary/40 dark:to-secondary/40 blur-xl animate-pulse" />
        <div className="relative w-24 h-24 rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-md border border-primary/30 dark:border-primary/40 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
          <CosmoSecLogo variant="icon" size="xl" showText={false} />
        </div>
      </div>

      {/* Floating glassmorphism cards */}
      <div className="absolute top-[12%] right-[8%] px-3 py-2 rounded-lg bg-card/70 dark:bg-card/50 backdrop-blur-md border border-primary/20 dark:border-primary/30 shadow-lg animate-float-slow">
        <p className="text-[10px] font-medium text-primary">ISO 27001</p>
      </div>
      <div className="absolute bottom-[15%] left-[5%] px-3 py-2 rounded-lg bg-card/70 dark:bg-card/50 backdrop-blur-md border border-secondary/20 dark:border-secondary/30 shadow-lg animate-float-slow" style={{ animationDelay: '1.5s' }}>
        <p className="text-[10px] font-medium text-secondary">NIST CSF</p>
      </div>
      <div className="absolute bottom-[8%] right-[15%] px-3 py-1.5 rounded-lg bg-card/70 dark:bg-card/50 backdrop-blur-md border border-primary/20 dark:border-primary/30 shadow-lg animate-float-slow" style={{ animationDelay: '3s' }}>
        <p className="text-[10px] font-medium text-muted-foreground">98% Score</p>
      </div>
      <div className="absolute top-[18%] left-[5%] px-3 py-2 rounded-lg bg-card/70 dark:bg-card/50 backdrop-blur-md border border-primary/20 dark:border-primary/30 shadow-lg animate-float-slow" style={{ animationDelay: '4.5s' }}>
        <p className="text-[10px] font-medium text-primary">BCB/CMN</p>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Cosmic Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10" />
      
      {/* Animated Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Nebula Effects */}
      <div 
        className="absolute top-1/4 right-1/4 w-[800px] h-[800px] opacity-15 dark:opacity-25 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.4), transparent 60%)',
        }}
      />
      <div 
        className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] opacity-10 dark:opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.3), transparent 60%)',
        }}
      />
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-[15%] w-2 h-2 bg-secondary rounded-full animate-pulse-glow opacity-60" style={{ animationDelay: '0s' }} />
      <div className="absolute top-1/3 right-[20%] w-3 h-3 bg-primary rounded-full animate-pulse-glow opacity-50" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/3 left-[25%] w-2 h-2 bg-secondary rounded-full animate-pulse-glow opacity-40" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 right-[15%] w-2 h-2 bg-primary rounded-full animate-pulse-glow opacity-50" style={{ animationDelay: '1.5s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Text */}
          <div className="text-center lg:text-left">
            <div className="animate-fade-in" style={{ animationDuration: '0.8s' }}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold text-foreground leading-tight mb-6 font-space tracking-tight">
                Não Gerencie Compliance.{' '}
                <span className="text-gradient-cosmic">Domine.</span>
              </h1>
            </div>

            <div className="animate-fade-in" style={{ animationDuration: '0.8s', animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A plataforma GRC + VRM + Gestão de Políticas para empresas, consultorias e auditores que precisam dominar conformidade de ponta a ponta.
              </p>
            </div>

            <div className="animate-fade-in" style={{ animationDuration: '0.8s', animationDelay: '0.4s', animationFillMode: 'backwards' }}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-10">
                <Button size="lg" variant="cosmic" asChild className="text-base px-8 py-6 text-lg group">
                  <a href="#contact">
                    <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Agendar Demonstração
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild 
                  className="text-base px-8 py-6 text-lg border-primary/30 hover:border-secondary/50 hover:bg-secondary/10 dark:border-primary/40 dark:hover:border-secondary/60"
                >
                  <Link to="/tour">Conhecer a Plataforma</Link>
                </Button>
              </div>
            </div>

            <div className="animate-fade-in" style={{ animationDuration: '0.8s', animationDelay: '0.6s', animationFillMode: 'backwards' }}>
              <p className="text-sm text-muted-foreground">
                NIST CSF 2.0 • ISO 27001:2022 • Frameworks Custom • Consultoria Especializada
              </p>
            </div>
          </div>

          {/* Right column - Illustration */}
          <div className="animate-fade-in hidden sm:block" style={{ animationDuration: '1s', animationDelay: '0.5s', animationFillMode: 'backwards' }}>
            <HeroIllustration />
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
