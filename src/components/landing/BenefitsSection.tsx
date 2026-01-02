import { TrendingDown, Clock, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function BenefitsSection() {
  const benefits = [
    {
      icon: TrendingDown,
      metric: '70%',
      title: 'Reduza Riscos de Conformidade',
      description: 'Identifique e trate gaps de conformidade de forma proativa com nossa plataforma.',
      gradient: 'from-success to-success/70',
    },
    {
      icon: Clock,
      metric: '50h',
      title: 'Economize Horas de Trabalho',
      description: 'Automatize tarefas manuais e centralize informações para maior produtividade.',
      gradient: 'from-primary to-primary/70',
    },
    {
      icon: Eye,
      metric: '100%',
      title: 'Visão Executiva em Tempo Real',
      description: 'Dashboards interativos e relatórios prontos para apresentação à diretoria.',
      gradient: 'from-secondary to-secondary/70',
    },
    {
      icon: Sparkles,
      metric: 'IA',
      title: 'Planos de Ação Automáticos',
      description: 'Geração inteligente de recomendações baseadas nos gaps identificados.',
      gradient: 'from-warning to-warning/70',
    },
  ];

  const checklistItems = [
    'Conformidade com múltiplos frameworks simultaneamente',
    'Mapeamento automático entre controles',
    'Gestão centralizada de evidências',
    'Trilha de auditoria completa',
    'Suporte a múltiplas organizações',
    'Exportação de relatórios em PDF',
  ];

  return (
    <section id="benefits" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Nebula effects */}
      <div 
        className="absolute top-1/4 right-0 w-[600px] h-[600px] opacity-10 dark:opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.3), transparent 60%)',
        }}
      />
      <div 
        className="absolute bottom-1/4 left-0 w-[500px] h-[500px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.2), transparent 60%)',
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={benefit.title}
                className="group border-0 shadow-lg dark:shadow-none hover:shadow-xl dark:hover:shadow-glow-sm transition-all duration-300 animate-fade-in bg-card/80 dark:bg-card/60 backdrop-blur-sm overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 relative">
                  {/* Glow effect on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.1), transparent 60%)',
                    }}
                  />
                  
                  <div className={`w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-gradient-cosmic mb-2 font-space">{benefit.metric}</div>
                  <h3 className="font-semibold text-foreground mb-2 font-space">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right - Content */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 font-space">
              Por que escolher o{' '}
              <span className="text-gradient-cosmic">CosmoSec</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Uma plataforma completa desenvolvida por especialistas em segurança da informação 
              e conformidade regulatória, pensada para simplificar seu dia a dia.
            </p>

            <ul className="space-y-4">
              {checklistItems.map((item, index) => (
                <li 
                  key={index}
                  className="flex items-center gap-3 animate-fade-in group"
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-success to-success/70 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}