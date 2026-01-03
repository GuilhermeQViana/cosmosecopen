import { Building2, Shield, ClipboardCheck, AlertTriangle, ListTodo, Users } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      icon: Building2,
      number: '01',
      title: 'Cadastre sua Organização',
      description: 'Crie sua conta e configure sua organização com as informações básicas.',
    },
    {
      icon: Shield,
      number: '02',
      title: 'Escolha o Módulo',
      description: 'Selecione GRC Frameworks para conformidade interna ou VRM para gestão de fornecedores.',
    },
    {
      icon: ClipboardCheck,
      number: '03',
      title: 'Realize Avaliações',
      description: 'Avalie controles internos ou fornecedores com metodologias completas e Risk Score.',
    },
    {
      icon: AlertTriangle,
      number: '04',
      title: 'Gerencie Riscos',
      description: 'Identifique gaps, documente evidências e vincule riscos aos controles ou fornecedores.',
    },
    {
      icon: ListTodo,
      number: '05',
      title: 'Execute Planos de Ação',
      description: 'Crie e monitore planos de ação para mitigação, com suporte de IA e notificações.',
    },
    {
      icon: Users,
      number: '06',
      title: 'Monitore e Reavalie',
      description: 'Acompanhe dashboards executivos e programe reavaliações automáticas.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30 dark:bg-muted/10 relative overflow-hidden">
      {/* Constellation-like connection line effect */}
      <div 
        className="absolute top-1/2 left-0 right-0 h-px opacity-30 dark:opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)), transparent)',
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-space">
            Como <span className="text-gradient-cosmic">Funciona</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Em 6 passos simples, comece a gerenciar a conformidade 
            e os riscos de terceiros da sua organização.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line - Desktop with gradient */}
          <div 
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
            style={{
              background: 'linear-gradient(90deg, transparent 3%, hsl(var(--primary) / 0.5) 15%, hsl(var(--secondary) / 0.5) 50%, hsl(var(--primary) / 0.5) 85%, transparent 97%)',
            }}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Step Card */}
                <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border border-primary/10 dark:border-primary/20 rounded-2xl p-5 text-center hover:border-secondary/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-glow-sm group h-full">
                  {/* Number Badge */}
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg dark:shadow-glow-sm group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-card border-2 border-secondary dark:border-primary rounded-full flex items-center justify-center text-[10px] font-bold text-gradient-cosmic font-space">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-foreground mb-2 font-space">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Constellation dot */}
                <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-secondary rounded-full shadow-glow-nebula z-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
