import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Lock, Shield, Sparkles, LogOut, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { StarField } from '@/components/ui/star-field';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const features = [
  'Todos os frameworks disponíveis',
  'Usuários ilimitados',
  'Controles ilimitados',
  'Matriz de riscos completa',
  'Armazenamento de 50GB para evidências',
  'Mapeamento entre frameworks',
  'Planos de ação com IA',
  'Relatórios personalizados',
  'Trilha de auditoria completa',
  'Suporte prioritário',
];

export function SubscriptionRequired() {
  const { createCheckout, isCheckoutLoading, trialEndsAt } = useSubscription();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const formattedTrialEnd = trialEndsAt 
    ? format(new Date(trialEndsAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <StarField starCount={40} dustCount={15} />
      
      {/* Nebula effects */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.4), transparent 60%)',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.3), transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 font-space">
            Seu período de teste expirou
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {formattedTrialEnd 
              ? `Seu trial expirou em ${formattedTrialEnd}. `
              : ''}
            Para continuar usando a plataforma e manter sua organização em conformidade, 
            assine o plano completo.
          </p>
        </div>

        <Card className="border-primary/20 shadow-lg dark:shadow-glow-md">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl font-space">Cora GovSec</CardTitle>
            </div>
            <CardDescription>Plano Completo</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gradient-cosmic font-space">R$ 449,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-success to-success/70 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-success-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button
              size="lg"
              variant="cosmic"
              className="w-full text-base gap-2"
              onClick={createCheckout}
              disabled={isCheckoutLoading}
            >
              {isCheckoutLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Assinar Agora
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Cancele a qualquer momento. Sem taxa de cancelamento.
            </p>
          </CardFooter>
        </Card>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Link 
            to="/configuracoes" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Acessar configurações da conta
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
