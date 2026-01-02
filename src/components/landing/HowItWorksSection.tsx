import { Building2, Shield, ClipboardCheck, AlertTriangle, ListTodo } from 'lucide-react';

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
      title: 'Selecione o Framework',
      description: 'Escolha o framework de conformidade adequado: NIST CSF, ISO 27001 ou BCB/CMN.',
    },
    {
      icon: ClipboardCheck,
      number: '03',
      title: 'Avalie seus Controles',
      description: 'Realize o diagnóstico de maturidade dos controles de segurança da sua organização.',
    },
    {
      icon: AlertTriangle,
      number: '04',
      title: 'Gerencie Riscos e Evidências',
      description: 'Identifique riscos, documente evidências e vincule-os aos controles avaliados.',
    },
    {
      icon: ListTodo,
      number: '05',
      title: 'Acompanhe Planos de Ação',
      description: 'Crie e monitore planos de ação para correção de gaps, com suporte de IA.',
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
            Em apenas 5 passos, comece a gerenciar a conformidade 
            de segurança da sua organização.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line - Desktop with gradient */}
          <div 
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
            style={{
              background: 'linear-gradient(90deg, transparent 5%, hsl(var(--primary) / 0.5) 20%, hsl(var(--secondary) / 0.5) 50%, hsl(var(--primary) / 0.5) 80%, transparent 95%)',
            }}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Step Card */}
                <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border border-primary/10 dark:border-primary/20 rounded-2xl p-6 text-center hover:border-secondary/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-glow-sm group">
                  {/* Number Badge */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg dark:shadow-glow-sm group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-card border-2 border-secondary dark:border-primary rounded-full flex items-center justify-center text-xs font-bold text-gradient-cosmic font-space">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2 font-space">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Constellation dot */}
                <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-secondary rounded-full shadow-glow-nebula z-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}