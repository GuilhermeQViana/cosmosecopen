import { TrendingDown, Clock, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function BenefitsSection() {
  const benefits = [
    {
      icon: TrendingDown,
      metric: '70%',
      title: 'Reduza Riscos de Conformidade',
      description: 'Identifique e trate gaps de conformidade de forma proativa com nossa plataforma.',
      color: 'text-status-success',
      bgColor: 'bg-status-success/10',
    },
    {
      icon: Clock,
      metric: '50h',
      title: 'Economize Horas de Trabalho',
      description: 'Automatize tarefas manuais e centralize informações para maior produtividade.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Eye,
      metric: '100%',
      title: 'Visão Executiva em Tempo Real',
      description: 'Dashboards interativos e relatórios prontos para apresentação à diretoria.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Sparkles,
      metric: 'IA',
      title: 'Planos de Ação Automáticos',
      description: 'Geração inteligente de recomendações baseadas nos gaps identificados.',
      color: 'text-status-warning',
      bgColor: 'bg-status-warning/10',
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
    <section id="benefits" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={benefit.title}
                className="border-0 shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${benefit.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                    <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <div className={`text-3xl font-bold ${benefit.color} mb-2`}>{benefit.metric}</div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
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
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  <div className="w-6 h-6 bg-status-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
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