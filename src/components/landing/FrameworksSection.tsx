import { Shield, FileCheck, Building2, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function FrameworksSection() {
  const frameworks = [
    {
      icon: Shield,
      name: 'NIST CSF 2.0',
      description: 'Framework de Cibersegurança do NIST com as 6 funções: Governar, Identificar, Proteger, Detectar, Responder e Recuperar.',
      gradient: 'from-primary to-primary/70',
      glowColor: 'primary',
    },
    {
      icon: FileCheck,
      name: 'ISO 27001:2022',
      description: 'Padrão internacional para sistemas de gestão de segurança da informação com 93 controles em 4 categorias.',
      gradient: 'from-secondary to-secondary/70',
      glowColor: 'secondary',
    },
    {
      icon: Building2,
      name: 'BCB/CMN 4.893',
      description: 'Resolução do Banco Central do Brasil para política de segurança cibernética em instituições financeiras.',
      gradient: 'from-success to-success/70',
      glowColor: 'success',
    },
  ];

  return (
    <section id="frameworks" className="py-20 lg:py-32 bg-muted/30 dark:bg-muted/10 relative overflow-hidden">
      {/* Nebula effects */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 dark:opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top right, hsl(var(--secondary) / 0.4), transparent 60%)',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at bottom left, hsl(var(--primary) / 0.3), transparent 60%)',
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-space">
            Frameworks de <span className="text-gradient-cosmic">Conformidade</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Suporte completo aos principais frameworks de cibersegurança do mercado, 
            com mapeamento automático entre eles.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {frameworks.map((framework, index) => (
            <Card 
              key={framework.name} 
              className="group border-0 shadow-lg hover:shadow-xl dark:shadow-none dark:hover:shadow-glow-sm transition-all duration-300 hover:-translate-y-2 animate-fade-in bg-card/80 dark:bg-card/60 backdrop-blur-sm overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 relative">
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, hsl(var(--${framework.glowColor}) / 0.15), transparent 60%)`,
                  }}
                />
                
                <div className={`w-14 h-14 bg-gradient-to-br ${framework.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <framework.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 font-space">{framework.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{framework.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mapping Feature */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="inline-flex items-center gap-4 bg-card/80 dark:bg-card/60 backdrop-blur-sm border border-primary/20 dark:border-primary/30 rounded-2xl px-8 py-4 shadow-lg dark:shadow-glow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground font-space">Mapeamento Automático</div>
              <div className="text-sm text-muted-foreground">
                Identifique equivalências entre controles de diferentes frameworks
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}