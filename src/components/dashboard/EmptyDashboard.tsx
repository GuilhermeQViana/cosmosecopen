import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardCheck, Shield, ArrowRight, Sparkles, Target, FileCheck } from 'lucide-react';

export function EmptyDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Cosmic Illustration */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 via-secondary/20 to-transparent flex items-center justify-center animate-pulse" style={{ animationDuration: '3s' }}>
            <Shield className="w-12 h-12 text-primary" />
          </div>
        </div>
        {/* Orbital dots */}
        <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-secondary animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-1 left-1/4 w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Message */}
      <div className="text-center max-w-lg space-y-3">
        <h2 className="text-2xl font-bold font-space text-foreground">
          Bem-vindo ao seu Dashboard
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          Comece avaliando seus controles no Diagnóstico para ver seus indicadores de conformidade, riscos e maturidade aqui.
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        <Card 
          className="group cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          onClick={() => navigate('/diagnostico')}
        >
          <CardContent className="p-5 flex flex-col items-center text-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <ClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Avaliar Controles</p>
              <p className="text-xs text-muted-foreground mt-1">Primeiro passo</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group cursor-pointer hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300"
          onClick={() => navigate('/riscos')}
        >
          <CardContent className="p-5 flex flex-col items-center text-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Registrar Riscos</p>
              <p className="text-xs text-muted-foreground mt-1">Mapeie ameaças</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          onClick={() => navigate('/evidencias')}
        >
          <CardContent className="p-5 flex flex-col items-center text-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Subir Evidências</p>
              <p className="text-xs text-muted-foreground mt-1">Comprove controles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary CTA */}
      <Button 
        size="lg" 
        variant="cosmic" 
        className="group text-base"
        onClick={() => navigate('/diagnostico')}
      >
        <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
        Começar Diagnóstico
        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
