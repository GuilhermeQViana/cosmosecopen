import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Lock, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  const trustBadges = [
    'NIST CSF 2.0',
    'ISO 27001:2022',
    'BCB/CMN 4.893',
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
              {trustBadges.map((badge) => (
                <Badge key={badge} variant="secondary" className="px-3 py-1 text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Simplifique a{' '}
              <span className="text-primary">Governança de Segurança</span>{' '}
              da sua Organização
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              Plataforma completa de GRC para conformidade com os principais frameworks de cibersegurança. 
              Gerencie riscos, controles e evidências em um só lugar.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" asChild className="text-base px-8">
                <Link to="/auth">
                  Começar Gratuitamente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <a href="#features">Ver Demonstração</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">70%</div>
                <div className="text-sm text-muted-foreground">Redução de Riscos</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">50h</div>
                <div className="text-sm text-muted-foreground">Economia Mensal</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">100%</div>
                <div className="text-sm text-muted-foreground">Compliance</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              {/* Main Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Dashboard de Conformidade</div>
                    <div className="text-sm text-muted-foreground">Visão executiva em tempo real</div>
                  </div>
                </div>
                
                {/* Mock Chart */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">NIST CSF 2.0</span>
                    <span className="text-sm font-medium text-foreground">87%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '87%' }} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ISO 27001</span>
                    <span className="text-sm font-medium text-foreground">72%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: '72%' }} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">BCB/CMN 4.893</span>
                    <span className="text-sm font-medium text-foreground">94%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-status-success rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl p-4 shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-status-success/10 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-status-success" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Controles Ativos</div>
                    <div className="font-semibold text-foreground">247</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Evidências</div>
                    <div className="font-semibold text-foreground">1.2k+</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}