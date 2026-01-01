import { Shield, FileCheck, Building2, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function FrameworksSection() {
  const frameworks = [
    {
      icon: Shield,
      name: 'NIST CSF 2.0',
      description: 'Framework de Cibersegurança do NIST com as 6 funções: Governar, Identificar, Proteger, Detectar, Responder e Recuperar.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: FileCheck,
      name: 'ISO 27001:2022',
      description: 'Padrão internacional para sistemas de gestão de segurança da informação com 93 controles em 4 categorias.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Building2,
      name: 'BCB/CMN 4.893',
      description: 'Resolução do Banco Central do Brasil para política de segurança cibernética em instituições financeiras.',
      color: 'text-status-success',
      bgColor: 'bg-status-success/10',
    },
  ];

  return (
    <section id="frameworks" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frameworks de Conformidade
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
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                <div className={`w-14 h-14 ${framework.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                  <framework.icon className={`w-7 h-7 ${framework.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{framework.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{framework.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mapping Feature */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="inline-flex items-center gap-4 bg-card border border-border rounded-2xl px-8 py-4 shadow-lg">
            <ArrowLeftRight className="w-6 h-6 text-primary" />
            <div className="text-left">
              <div className="font-semibold text-foreground">Mapeamento Automático</div>
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