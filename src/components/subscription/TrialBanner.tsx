import { Clock, CreditCard, Sparkles, Crown, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TrialBanner() {
  const { isTrialing, daysRemaining, daysUntilRenewal, subscriptionStatus, subscriptionEndsAt, createCheckout, isLoading, openCustomerPortal } = useSubscription();

  if (isLoading) {
    return null;
  }

  // Show Pro banner for active subscribers
  if (subscriptionStatus === 'active') {
    const isRenewalSoon = daysUntilRenewal !== null && daysUntilRenewal <= 3;
    const formattedDate = subscriptionEndsAt 
      ? format(new Date(subscriptionEndsAt), "dd 'de' MMM", { locale: ptBR })
      : null;

    return (
      <div className={`flex items-center justify-between gap-4 px-4 py-2 border-b ${
        isRenewalSoon 
          ? 'bg-amber-500/20 border-amber-500/40' 
          : 'bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-amber-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className="border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10"
          >
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
          <span className="text-sm text-muted-foreground">
            {isRenewalSoon ? (
              <>
                <CalendarClock className="w-3.5 h-3.5 inline mr-1 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Renovação em {daysUntilRenewal} {daysUntilRenewal === 1 ? 'dia' : 'dias'}
                </span>
                {formattedDate && <span className="text-muted-foreground"> ({formattedDate})</span>}
              </>
            ) : daysUntilRenewal !== null ? (
              <>
                Assinatura ativa • Renova em {daysUntilRenewal} dias
                {formattedDate && <span className="text-muted-foreground/70"> ({formattedDate})</span>}
              </>
            ) : (
              'Assinatura ativa'
            )}
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
