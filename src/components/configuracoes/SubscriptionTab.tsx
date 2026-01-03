import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Clock, CreditCard, Download, ExternalLink, FileText, Loader2, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Invoice {
  id: string;
  number: string | null;
  status: string | null;
  amount: number;
  currency: string;
  created: number;
  period_start: number;
  period_end: number;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const { 
    subscriptionStatus, 
    isTrialing, 
    daysRemaining, 
    trialEndsAt,
    subscriptionEndsAt,
    isLoading,
    isCheckoutLoading,
    createCheckout,
    openCustomerPortal,
  } = useSubscription();

  // Handle checkout canceled
  useEffect(() => {
    const checkoutCanceled = searchParams.get('checkout');
    if (checkoutCanceled === 'canceled') {
      toast.info('Checkout cancelado', {
        description: 'Você pode tentar novamente quando quiser.',
      });
      // Remove the query param
      searchParams.delete('checkout');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      if (subscriptionStatus !== 'active') return;
      
      setInvoicesLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('list-invoices');
        if (error) throw error;
        setInvoices(data?.invoices || []);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setInvoicesLoading(false);
      }
    };

    if (!isLoading) {
      fetchInvoices();
    }
  }, [subscriptionStatus, isLoading]);

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

  const getInvoiceStatusBadge = (status: string | null) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success/10 text-success border-success/30">Pago</Badge>;
      case 'open':
        return <Badge variant="secondary">Em aberto</Badge>;
      case 'void':
        return <Badge variant="outline">Cancelado</Badge>;
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
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
              <Button 
                onClick={createCheckout} 
                className="gap-2"
                disabled={isCheckoutLoading}
              >
                {isCheckoutLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Assinar por R$ 449,90/mês
                    <Sparkles className="w-3 h-3" />
                  </>
                )}
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

      {/* Histórico de Faturas */}
      {subscriptionStatus === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Histórico de Faturas
            </CardTitle>
            <CardDescription>
              Visualize e baixe suas faturas anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma fatura encontrada.
              </p>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {invoice.number || `Fatura ${invoice.id.slice(-8)}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(invoice.created * 1000), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </div>
                        {getInvoiceStatusBadge(invoice.status)}
                      </div>
                      
                      <div className="flex gap-2">
                        {invoice.hosted_invoice_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(invoice.hosted_invoice_url!, '_blank')}
                            title="Ver fatura"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        {invoice.invoice_pdf && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(invoice.invoice_pdf!, '_blank')}
                            title="Baixar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
