import { Clock, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

export function TrialBanner() {
  const { isTrialing, daysRemaining, subscriptionStatus, hasAccess, createCheckout, isLoading } = useSubscription();

  if (isLoading || subscriptionStatus === 'active') {
    return null;
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
