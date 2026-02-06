import { Shield, Building2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

const platforms = [
  {
    icon: Shield,
    title: 'GRC Frameworks',
    description: 'Diagnóstico completo de controles de segurança com frameworks reconhecidos.',
    features: [
      'NIST CSF 2.0, ISO 27001, BCB/CMN',
      'Risk Score automático',
      'Matriz de riscos integrada',
      'Gestão de evidências',
    ],
    gradient: 'from-primary to-primary/70',
  },
  {
    icon: Building2,
    title: 'VRM Fornecedores',
    description: 'Avaliação e monitoramento contínuo de riscos de terceiros.',
    features: [
      '45+ requisitos de avaliação',
      'Radar de conformidade',
      'Workflow de aprovação',
      'Agenda de reavaliação',
    ],
    gradient: 'from-secondary to-secondary/70',
  },
  {
    icon: Sparkles,
    title: 'IA Generativa',
    description: 'Automação inteligente para acelerar sua jornada de conformidade.',
    features: [
      'Planos de ação automáticos',
      'Guias de implementação',
      'Análise de gaps',
      'Recomendações priorizadas',
    ],
    gradient: 'from-primary via-secondary to-primary',
  },
];

export function PlatformSection() {
  return (
    <section id="platform" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-space tracking-tight">
            Uma Plataforma.{' '}
            <span className="text-gradient-cosmic">Segurança Completa.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Consolide sua governança de segurança e gestão de fornecedores em uma única solução.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {platforms.map((platform) => (
            <div
              key={platform.title}
              className="group relative bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-primary/20 dark:border-primary/30 rounded-2xl p-8 transition-all duration-500 hover:border-secondary/50 hover:shadow-[0_0_40px_hsl(var(--secondary)/0.15)] overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 0%, hsl(var(--secondary) / 0.1), transparent 60%)',
                }}
              />
              
              {/* Icon */}
              <div className={`w-14 h-14 bg-gradient-to-br ${platform.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <platform.icon className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-3 font-space">
                {platform.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                {platform.description}
              </p>

              {/* Features */}
              <ul className="space-y-3">
                {platform.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Hover Arrow */}
              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-5 h-5 text-secondary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
