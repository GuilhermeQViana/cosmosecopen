import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Clock, CreditCard, ExternalLink, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const features = [
  'Todos os frameworks disponíveis',
  'Usuários ilimitados',
  'Controles ilimitados',
  'Matriz de riscos completa',
  'Armazenamento de 50GB',
  'Planos de ação com IA',
  'Relatórios personalizados',
  'Suporte prioritário',
];

export function SubscriptionTab() {
  const { 
    subscriptionStatus, 
    isTrialing, 
    daysRemaining, 
    trialEndsAt,
    subscriptionEndsAt,
    isLoading,
    createCheckout,
    openCustomerPortal,
  } = useSubscription();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Ativa</Badge>;
      case 'trialing':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Trial</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Expirada</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Status da Assinatura
                {getStatusBadge()}
              </CardTitle>
              <CardDescription>
                {subscriptionStatus === 'active' 
                  ? 'Sua assinatura está ativa e todos os recursos estão disponíveis.'
                  : isTrialing 
                    ? `Você está no período de teste gratuito.`
                    : 'Seu período de teste expirou.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {isTrialing && daysRemaining !== null && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">Dias restantes do trial</div>
                <div className="text-2xl font-bold text-primary font-space">
                  {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
                </div>
                {trialEndsAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Expira em {format(new Date(trialEndsAt), "dd 'de' MMMM", { locale: ptBR })}
                  </div>
                )}
              </div>
            )}
            
            {subscriptionStatus === 'active' && subscriptionEndsAt && (
              <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                <div className="text-sm text-muted-foreground mb-1">Próxima renovação</div>
                <div className="text-lg font-semibold text-foreground">
                  {format(new Date(subscriptionEndsAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex flex-wrap gap-3">
            {subscriptionStatus !== 'active' && (
              <Button onClick={createCheckout} className="gap-2">
                <CreditCard className="w-4 h-4" />
                Assinar por R$ 449,90/mês
                <Sparkles className="w-3 h-3" />
              </Button>
            )}
            
            {subscriptionStatus === 'active' && (
              <Button variant="outline" onClick={openCustomerPortal} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Gerenciar Assinatura
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do plano */}
      <Card>
        <CardHeader>
          <CardTitle>Plano Completo - R$ 449,90/mês</CardTitle>
          <CardDescription>
            Acesso completo a todos os recursos da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-br from-success to-success/70 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-success-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
