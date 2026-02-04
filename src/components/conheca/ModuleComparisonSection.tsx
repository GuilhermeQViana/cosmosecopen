import { Shield, Building2, Check, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ModuleComparisonSectionProps {
  onNavigate: (sectionId: string) => void;
}

const comparisonData = [
  {
    id: 'grc',
    icon: Shield,
    title: 'GRC Frameworks',
    subtitle: 'Governança, Risco e Conformidade',
    idealFor: [
      'Conformidade com ISO 27001',
      'Implementação NIST CSF',
      'Atendimento BCB 4893',
      'Gestão de controles internos',
      'Auditorias internas e externas',
    ],
    color: 'primary',
  },
  {
    id: 'vrm',
    icon: Building2,
    title: 'VRM Fornecedores',
    subtitle: 'Vendor Risk Management',
    idealFor: [
      'Due diligence de terceiros',
      'Avaliação de risco de fornecedores',
      'Monitoramento contínuo',
      'Gestão de contratos',
      'Compliance de parceiros',
    ],
    color: 'secondary',
  },
];

export function ModuleComparisonSection({ onNavigate }: ModuleComparisonSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Compare os Módulos
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-space">
            Qual módulo é <span className="text-gradient-cosmic">ideal para você</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Entenda as diferenças entre os módulos e escolha o que melhor atende 
            às necessidades da sua organização.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {comparisonData.map((module) => (
            <Card 
              key={module.id}
              className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all group"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                    <module.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{module.subtitle}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm font-medium text-foreground mb-4">Ideal para:</p>
                <ul className="space-y-3 mb-6">
                  {module.idealFor.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="outline" 
                  className="w-full group/btn"
                  onClick={() => onNavigate(module.id)}
                >
                  Explorar {module.title}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-muted-foreground mb-4">
            Ou use ambos os módulos com <span className="text-primary font-medium">integração nativa</span>
          </p>
          <Button variant="cosmic" asChild>
            <a href="#contact">
              Falar com Especialista
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
