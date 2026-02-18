import { Handshake, MonitorSmartphone, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const audiences = [
  {
    icon: Handshake,
    title: 'Consultoria Completa',
    subtitle: 'Nossos especialistas conduzem sua jornada de conformidade usando a plataforma CosmoSec',
    badge: 'Consultoria + Plataforma',
    cta: 'Falar com Especialista',
    gradient: 'from-primary to-primary/70',
    benefits: [
      'Diagnóstico de maturidade conduzido por especialistas',
      'Implementação de frameworks (NIST, ISO 27001, BCB/CMN)',
      'Criação e revisão de políticas de segurança',
      'Due Diligence e gestão de fornecedores como serviço',
      'Relatórios executivos periódicos e acompanhamento contínuo',
      'Acesso completo à plataforma CosmoSec incluído',
    ],
  },
  {
    icon: MonitorSmartphone,
    title: 'Plataforma SaaS',
    subtitle: 'Para empresas com equipe interna de GRC que precisam de uma ferramenta poderosa',
    badge: 'Apenas a Plataforma',
    cta: 'Conhecer a Plataforma',
    gradient: 'from-secondary to-secondary/70',
    benefits: [
      'Acesso completo a todos os módulos (GRC, VRM, Políticas, IA)',
      'Onboarding assistido pela nossa equipe',
      'Suporte técnico dedicado',
      'Diagnóstico de controles com frameworks reconhecidos e customizáveis',
      'Gestão de riscos, evidências e planos de ação',
      'Relatórios automatizados e exportação PDF',
    ],
  },
];

export function AudienceSection() {
  return (
    <section id="audience" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      {/* Nebula */}
      <div
        className="absolute top-1/3 left-1/4 w-[600px] h-[600px] opacity-10 dark:opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.3), transparent 60%)',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <UserCheck className="w-4 h-4" />
            <span className="text-sm font-medium">Para Quem</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight font-space">
            Uma plataforma,{' '}
            <span className="text-gradient-cosmic">dois perfis</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Seja para governança interna ou para gestão de múltiplos clientes, a CosmoSec se adapta ao seu modelo de operação.
          </p>
        </div>

        {/* Audience Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {audiences.map((audience) => (
            <div
              key={audience.title}
              className="group relative bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-primary/20 dark:border-primary/30 rounded-2xl p-8 transition-all duration-500 hover:border-secondary/50 hover:shadow-[0_0_40px_hsl(var(--secondary)/0.15)]"
            >
              {/* Glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                  background: 'radial-gradient(circle at 50% 0%, hsl(var(--secondary) / 0.1), transparent 60%)',
                }}
              />

              {/* Icon + Badge */}
              <div className="flex items-center justify-between mb-6 relative">
                <div className={`w-14 h-14 bg-gradient-to-br ${audience.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <audience.icon className="w-7 h-7 text-white" />
                </div>
                <Badge variant="outline" className="border-secondary/40 text-secondary text-xs">
                  {audience.badge}
                </Badge>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-foreground mb-2 font-space relative">
                {audience.title}
              </h3>
              <p className="text-muted-foreground mb-6 relative">
                {audience.subtitle}
              </p>

              {/* Benefits */}
              <ul className="space-y-3 mb-8 relative">
                {audience.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant="outline"
                className="w-full border-secondary/30 hover:border-secondary/50 hover:bg-secondary/10 group/btn relative"
                asChild
              >
                <a href="#contact">
                  {audience.cta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
