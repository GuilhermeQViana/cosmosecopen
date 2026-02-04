import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Lock, CheckCircle2, Sparkles, Building2, Users } from 'lucide-react';

export function HeroSection() {
  const trustBadges = [
    { label: 'NIST CSF 2.0', isNew: false },
    { label: 'ISO 27001:2022', isNew: false },
    { label: 'BCB/CMN 4.893', isNew: false },
    { label: 'VRM', isNew: true },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Cosmic Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10" />
      
      {/* Nebula Effects */}
      <div 
        className="absolute top-0 right-0 w-[800px] h-[800px] opacity-20 dark:opacity-30 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.4), transparent 60%)',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-15 dark:opacity-25 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.3), transparent 60%)',
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.1), transparent 70%)',
        }}
      />
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-[10%] w-3 h-3 bg-secondary rounded-full animate-pulse-glow opacity-60" style={{ animationDelay: '0s' }} />
      <div className="absolute top-1/3 right-[15%] w-2 h-2 bg-primary rounded-full animate-pulse-glow opacity-50" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/3 left-[20%] w-2 h-2 bg-secondary rounded-full animate-pulse-glow opacity-40" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 right-[25%] w-3 h-3 bg-primary rounded-full animate-pulse-glow opacity-50" style={{ animationDelay: '1.5s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
              {trustBadges.map((badge) => (
                <Badge 
                  key={badge.label} 
                  variant="secondary" 
                  className={`px-3 py-1 text-xs font-medium border ${
                    badge.isNew 
                      ? 'bg-secondary/20 text-secondary border-secondary/30 dark:bg-secondary/30 dark:border-secondary/50' 
                      : 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {badge.label}
                  {badge.isNew && <span className="ml-1 text-[10px] font-bold">NOVO</span>}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 font-space">
              Governança de Segurança e{' '}
              <span className="text-gradient-cosmic">Gestão de Fornecedores</span>{' '}
              em uma só plataforma
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              Plataforma completa de GRC para conformidade com frameworks de cibersegurança 
              e avaliação de riscos de terceiros. Gerencie controles, evidências e fornecedores em um só lugar.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" variant="cosmic" asChild className="text-base px-8 group">
                <a href="#contact">
                  <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                  Falar com Especialista
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-base px-8 border-primary/30 hover:border-secondary/50 hover:bg-secondary/10 dark:border-primary/40 dark:hover:border-secondary/60"
              >
                <Link to="/tour">Conhecer a Plataforma</Link>
              </Button>
            </div>

            {/* Contact info */}
            <p className="text-sm text-muted-foreground mt-4">
              Solicite uma demonstração personalizada para sua empresa
            </p>

            {/* Stats with Glow */}
            <div className="grid grid-cols-4 gap-4 mt-12 pt-8 border-t border-primary/20 dark:border-primary/30">
              <div className="group">
                <div className="text-2xl sm:text-3xl font-bold text-gradient-cosmic font-space group-hover:scale-105 transition-transform">70%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Redução de Riscos</div>
              </div>
              <div className="group">
                <div className="text-2xl sm:text-3xl font-bold text-gradient-cosmic font-space group-hover:scale-105 transition-transform">50h</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Economia Mensal</div>
              </div>
              <div className="group">
                <div className="text-2xl sm:text-3xl font-bold text-gradient-cosmic font-space group-hover:scale-105 transition-transform">100%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Compliance</div>
              </div>
              <div className="group">
                <div className="text-2xl sm:text-3xl font-bold text-gradient-cosmic font-space group-hover:scale-105 transition-transform">+45</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Requisitos VRM</div>
              </div>
            </div>
          </div>

          {/* Right Visual - Cosmic Dashboard Card */}
          <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              {/* Glow behind main card */}
              <div 
                className="absolute inset-0 blur-2xl opacity-30 dark:opacity-50 -z-10"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(var(--secondary) / 0.3))',
                  transform: 'scale(1.1)',
                }}
              />
              
              {/* Main Card - Glassmorphism */}
              <div className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-primary/20 dark:border-primary/30 rounded-2xl p-6 shadow-2xl dark:shadow-glow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-glow-sm">
                    <Shield className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground font-space">Dashboard de Conformidade</div>
                    <div className="text-sm text-muted-foreground">Visão executiva em tempo real</div>
                  </div>
                </div>
                
                {/* Progress Bars with Cosmic Colors */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">NIST CSF 2.0</span>
                    <span className="text-sm font-medium text-foreground">87%</span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80" 
                      style={{ width: '87%', boxShadow: '0 0 10px hsl(var(--primary) / 0.5)' }} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ISO 27001</span>
                    <span className="text-sm font-medium text-foreground">72%</span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-secondary to-secondary/80" 
                      style={{ width: '72%', boxShadow: '0 0 10px hsl(var(--secondary) / 0.5)' }} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">BCB/CMN 4.893</span>
                    <span className="text-sm font-medium text-foreground">94%</span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-success to-success/80" 
                      style={{ width: '94%', boxShadow: '0 0 10px hsl(var(--success) / 0.5)' }} 
                    />
                  </div>
                </div>

                {/* VRM Preview */}
                <div className="mt-6 pt-4 border-t border-primary/10 dark:border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium text-foreground">Fornecedores</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-success/20 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-success">12</div>
                      <div className="text-[10px] text-muted-foreground">Baixo</div>
                    </div>
                    <div className="bg-warning/20 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-warning">8</div>
                      <div className="text-[10px] text-muted-foreground">Médio</div>
                    </div>
                    <div className="bg-destructive/20 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-destructive">3</div>
                      <div className="text-[10px] text-muted-foreground">Alto</div>
                    </div>
                    <div className="bg-primary/20 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-primary">23</div>
                      <div className="text-[10px] text-muted-foreground">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards with Glow */}
              <div className="absolute -top-4 -right-4 bg-card/90 dark:bg-card/70 backdrop-blur-lg border border-secondary/30 rounded-xl p-4 shadow-lg dark:shadow-glow-nebula animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-success to-success/70 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-success-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Controles Ativos</div>
                    <div className="font-semibold text-foreground font-space">247</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card/90 dark:bg-card/70 backdrop-blur-lg border border-primary/30 rounded-xl p-4 shadow-lg dark:shadow-glow-sm animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Evidências</div>
                    <div className="font-semibold text-foreground font-space">1.2k+</div>
                  </div>
                </div>
              </div>

              {/* New VRM floating card */}
              <div className="absolute top-1/2 -right-8 bg-card/90 dark:bg-card/70 backdrop-blur-lg border border-secondary/30 rounded-xl p-3 shadow-lg dark:shadow-glow-nebula animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Avaliações VRM</div>
                    <div className="font-semibold text-foreground font-space text-sm">45+</div>
                  </div>
                </div>
              </div>

              {/* Extra floating orb */}
              <div 
                className="absolute -top-8 left-1/2 w-16 h-16 rounded-full opacity-40 blur-xl animate-pulse"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--secondary)), transparent)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
