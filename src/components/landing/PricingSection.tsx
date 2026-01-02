import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    description: 'Ideal para pequenas empresas iniciando na jornada de conformidade',
    price: 'R$ 497',
    period: '/mês',
    features: [
      '1 framework ativo',
      'Até 3 usuários',
      '100 controles',
      'Gestão básica de riscos',
      'Armazenamento de 5GB para evidências',
      'Relatórios em PDF',
      'Suporte por email',
    ],
    cta: 'Começar Grátis',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'Para empresas que precisam de conformidade completa e colaboração',
    price: 'R$ 1.497',
    period: '/mês',
    features: [
      'Todos os frameworks disponíveis',
      'Até 15 usuários',
      'Controles ilimitados',
      'Matriz de riscos avançada',
      'Armazenamento de 50GB para evidências',
      'Mapeamento entre frameworks',
      'Planos de ação com IA',
      'Relatórios personalizados',
      'Trilha de auditoria completa',
      'Suporte prioritário',
    ],
    cta: 'Experimentar 14 dias',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Solução completa para grandes organizações com requisitos específicos',
    price: 'Personalizado',
    period: '',
    features: [
      'Tudo do Professional',
      'Usuários ilimitados',
      'Armazenamento ilimitado',
      'SSO/SAML integrado',
      'API de integração',
      'Ambiente dedicado',
      'SLA garantido de 99.9%',
      'Onboarding personalizado',
      'Customer Success dedicado',
      'Consultoria de conformidade',
    ],
    cta: 'Falar com Vendas',
    popular: false,
  },
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
            Planos e Preços
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-space">
            Escolha o plano <span className="text-gradient-cosmic">ideal</span> para sua organização
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente e escale conforme sua necessidade de conformidade evolui
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={cn(
                'relative flex flex-col transition-all duration-300 hover:shadow-xl animate-fade-in bg-card/80 dark:bg-card/60 backdrop-blur-sm',
                plan.popular 
                  ? 'border-2 border-primary dark:border-secondary shadow-lg dark:shadow-glow-md scale-105 z-10' 
                  : 'border border-primary/10 dark:border-primary/20 hover:border-secondary/50'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-glow-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8 pt-6">
                <CardTitle className="text-2xl font-bold font-space">{plan.name}</CardTitle>
                <CardDescription className="mt-2 min-h-[48px]">
                  {plan.description}
                </CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-gradient-cosmic font-space">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-gradient-to-br from-success to-success/70 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-success-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  className="w-full"
                  variant={plan.popular ? 'cosmic' : 'outline'}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          Todos os planos incluem atualizações gratuitas e acesso às novas funcionalidades.
          <br />
          Precisa de algo diferente?{' '}
          <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors">
            Entre em contato
          </a>
          .
        </p>
      </div>
    </section>
  );
}