import { Clock, CreditCard, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

export function TrialBanner() {
  const { isTrialing, daysRemaining, subscriptionStatus, createCheckout, isLoading, openCustomerPortal } = useSubscription();

  if (isLoading) {
    return null;
  }

  // Show Pro banner for active subscribers
  if (subscriptionStatus === 'active') {
    return (
      <div className="flex items-center justify-between gap-4 px-4 py-2 border-b bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-amber-500/30">
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className="border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10"
          >
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
          <span className="text-sm text-muted-foreground">
            Você é um assinante Pro! Aproveite todos os recursos.
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={openCustomerPortal}
          className="gap-2 border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
        >
          Gerenciar Assinatura
        </Button>
      </div>
    );
  }

  if (!isTrialing || daysRemaining === null) {
    return null;
  }

  const isUrgent = daysRemaining <= 3;
  const urgentClasses = isUrgent 
    ? 'bg-destructive/10 border-destructive/30 dark:bg-destructive/20' 
    : 'bg-primary/10 border-primary/30 dark:bg-primary/20';

  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-2 border-b ${urgentClasses}`}>
      <div className="flex items-center gap-3">
        <Badge 
          variant="outline" 
          className={isUrgent ? 'border-destructive text-destructive' : 'border-primary text-primary'}
        >
          <Clock className="w-3 h-3 mr-1" />
          Trial
        </Badge>
        <span className="text-sm text-muted-foreground">
          {daysRemaining === 0 
            ? 'Seu trial expira hoje!'
            : daysRemaining === 1 
              ? 'Seu trial expira amanhã!'
              : `${daysRemaining} dias restantes no trial`
          }
        </span>
      </div>
      <Button
        size="sm"
        variant={isUrgent ? 'destructive' : 'default'}
        onClick={createCheckout}
        className="gap-2"
      >
        <CreditCard className="w-4 h-4" />
        Assinar Agora
        <Sparkles className="w-3 h-3" />
      </Button>
    </div>
  );
}
