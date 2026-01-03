import { Shield, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ModulesSection() {
  const modules = [
    {
      icon: Shield,
      title: 'GRC Frameworks',
      subtitle: 'Conformidade com Frameworks de Segurança',
      description: 'Gerencie a conformidade da sua organização com os principais frameworks de cibersegurança do mercado.',
      features: [
        'Dashboard executivo com métricas em tempo real',
        'Diagnóstico de controles com Risk Score',
        'Matriz de riscos 5x5 completa',
        'Cofre de evidências seguro',
        'Planos de ação com IA generativa',
        'Mapeamento entre frameworks',
        'Relatórios executivos em PDF',
        'Trilha de auditoria completa',
      ],
      badges: ['NIST CSF 2.0', 'ISO 27001', 'BCB/CMN 4.893', 'Custom'],
      gradient: 'from-primary to-secondary',
      href: '#frameworks',
    },
    {
      icon: Building2,
      title: 'Gestão de Fornecedores',
      subtitle: 'Vendor Risk Management (VRM)',
      description: 'Avalie e monitore os riscos de terceiros com uma metodologia completa de due diligence de segurança.',
      features: [
        'Dashboard de riscos de terceiros',
        '45+ requisitos de segurança padrão',
        'Avaliações em 4 domínios críticos',
        'Workflow de aprovação de avaliações',
        'Radar de conformidade por domínio',
        'Heat Map de riscos de fornecedores',
        'Agenda de reavaliação automática',
        'Relatórios PDF de fornecedores',
      ],
      badges: ['Segurança da Informação', 'Cyber Security', 'Privacidade (LGPD)', 'BCN'],
      gradient: 'from-secondary to-primary',
      href: '#features',
    },
  ];

  return (
    <section id="modules" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Nebula effects */}
      <div 
        className="absolute top-1/4 left-0 w-[600px] h-[600px] opacity-10 dark:opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.3), transparent 60%)',
        }}
      />
      <div 
        className="absolute bottom-1/4 right-0 w-[500px] h-[500px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.2), transparent 60%)',
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="outline" className="mb-4 border-primary/30 dark:border-primary/50 text-primary">
            Dois Módulos, Uma Plataforma
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-space">
            Escolha seu <span className="text-gradient-cosmic">Escopo de Trabalho</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gerencie a conformidade interna com frameworks ou avalie riscos de terceiros - 
            ou utilize ambos os módulos de forma integrada.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {modules.map((module, index) => (
            <Card 
              key={module.title}
              className="group border border-primary/10 dark:border-primary/20 hover:border-secondary/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-glow-md animate-fade-in bg-card/80 dark:bg-card/60 backdrop-blur-sm overflow-hidden"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="p-8 relative">
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.1), transparent 50%)',
                  }}
                />
                
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${module.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground font-space">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.subtitle}</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{module.description}</p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {module.badges.map((badge) => (
                    <Badge 
                      key={badge} 
                      variant="secondary" 
                      className="text-xs bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:border-primary/30"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {module.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-between group/btn hover:bg-primary/10 dark:hover:bg-primary/20"
                  asChild
                >
                  <a href={module.href}>
                    <span>Saiba mais</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
