import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

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

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="text-center">
          {/* Animated entrance for headline */}
          <div className="animate-fade-in" style={{ animationDuration: '0.8s' }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 font-space tracking-tight">
              Consultoria em GRC com{' '}
              <span className="text-gradient-cosmic">Tecnologia Própria.</span>
            </h1>
          </div>

          {/* Subheadline with delay */}
          <div className="animate-fade-in" style={{ animationDuration: '0.8s', animationDelay: '0.2s', animationFillMode: 'backwards' }}>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Somos especialistas em conformidade e segurança da informação. Usamos nossa própria plataforma para entregar resultados — ou disponibilizamos ela para sua equipe.
            </p>
          </div>

          {/* CTAs with delay */}
          <div className="animate-fade-in" style={{ animationDuration: '0.8s', animationDelay: '0.4s', animationFillMode: 'backwards' }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
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

          {/* Trust Indicator with delay */}
          <div className="animate-fade-in" style={{ animationDuration: '0.8s', animationDelay: '0.6s', animationFillMode: 'backwards' }}>
            <p className="text-sm text-muted-foreground">
              NIST CSF 2.0 • ISO 27001:2022 • BCB/CMN 4.893 • Frameworks Custom • Consultoria Especializada
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
