import { Check, Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AUTH_ROUTE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  'Todos os frameworks disponíveis (NIST, ISO, BCB)',
  'Módulo VRM completo',
  'Usuários ilimitados',
  'Controles ilimitados',
  'Fornecedores ilimitados',
  'Frameworks customizados com importação CSV',
  'Matriz de riscos completa',
  'Armazenamento de 50GB para evidências',
  'Mapeamento entre frameworks',
  'Planos de ação com IA',
  'Workflow de aprovação VRM',
  'Notificações por email',
  'Relatórios PDF (GRC e Fornecedores)',
  'Trilha de auditoria completa',
  'Suporte prioritário',
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-muted/30 dark:bg-muted/10 relative overflow-hidden">
      {/* Nebula effects */}
      <div 
        className="absolute top-0 left-1/4 w-[600px] h-[600px] opacity-10 dark:opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.3), transparent 60%)',
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.2), transparent 60%)',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 dark:border-primary/50 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            Plano Único
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-space">
            Preço <span className="text-gradient-cosmic">simples e transparente</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Teste gratuitamente por 7 dias. Sem compromisso.
            <br />
            Cancele a qualquer momento.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="relative border-2 border-primary dark:border-secondary shadow-lg dark:shadow-glow-md animate-fade-in bg-card/80 dark:bg-card/60 backdrop-blur-sm">
            {/* Trial badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-glow-sm">
                <Clock className="w-3 h-3 mr-1" />
                7 dias grátis
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl font-bold font-space">Plano Completo</CardTitle>
              <CardDescription className="mt-2">
                GRC Frameworks + Gestão de Fornecedores
              </CardDescription>
              <div className="mt-6">
                <span className="text-5xl font-bold text-gradient-cosmic font-space">R$ 449,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Após o período de teste gratuito
              </p>
            </CardHeader>

            <CardContent className="pb-8">
              <ul className="space-y-2.5">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-success to-success/70 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-success-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-2 pb-8">
              <Button
                className="w-full"
                variant="cosmic"
                size="lg"
                asChild
              >
                <Link to={AUTH_ROUTE}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Começar Trial de 7 Dias
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          Todas as atualizações e novas funcionalidades estão incluídas.
          <br />
          Dúvidas?{' '}
          <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors">
            Entre em contato
          </a>
          .
        </p>
      </div>
    </section>
  );
}
