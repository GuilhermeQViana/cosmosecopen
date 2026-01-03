import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

export function PaymentFailedBanner() {
  const { hasPaymentFailed, openCustomerPortal, dismissPaymentFailed } = useSubscription();

  if (!hasPaymentFailed) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-destructive">
            Falha no pagamento da assinatura
          </p>
          <p className="text-xs text-muted-foreground">
            Atualize seu método de pagamento para continuar usando a plataforma.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={openCustomerPortal}
        >
          Atualizar pagamento
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={dismissPaymentFailed}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
