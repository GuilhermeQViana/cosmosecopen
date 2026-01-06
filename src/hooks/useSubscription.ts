import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SubscriptionState {
  hasAccess: boolean;
  subscriptionStatus: 'trialing' | 'active' | 'expired' | 'canceled';
  isTrialing: boolean;
  daysRemaining: number | null;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  isLoading: boolean;
  isCheckoutLoading: boolean;
  hasPaymentFailed: boolean;
}

export function useSubscription() {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    hasAccess: true,
    subscriptionStatus: 'trialing',
    isTrialing: true,
    daysRemaining: 7,
    trialEndsAt: null,
    subscriptionEndsAt: null,
    isLoading: true,
    isCheckoutLoading: false,
    hasPaymentFailed: false,
  });

  const checkSubscription = useCallback(async () => {
    if (!organization || !user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { organization_id: organization.id },
      });

      if (error) throw error;

      // Check for payment failed notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', 'Falha no pagamento')
        .eq('read', false)
        .limit(1);

      setState({
        hasAccess: data.has_access,
        subscriptionStatus: data.subscription_status,
        isTrialing: data.is_trialing,
        daysRemaining: data.days_remaining,
        trialEndsAt: data.trial_ends_at,
        subscriptionEndsAt: data.subscription_ends_at,
        isLoading: false,
        isCheckoutLoading: false,
        hasPaymentFailed: (notifications?.length ?? 0) > 0,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [organization, user]);

  const createCheckout = useCallback(async () => {
    if (!organization) {
      toast.error('Organização não encontrada');
      return;
    }

    setState(prev => ({ ...prev, isCheckoutLoading: true }));

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { organization_id: organization.id },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect in same tab for better UX
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao iniciar checkout. Tente novamente.');
    } finally {
      setState(prev => ({ ...prev, isCheckoutLoading: false }));
    }
  }, [organization]);

  const openCustomerPortal = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Erro ao abrir portal de assinatura.');
    }
  }, []);

  const dismissPaymentFailed = useCallback(async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('title', 'Falha no pagamento');

    setState(prev => ({ ...prev, hasPaymentFailed: false }));
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Refresh every minute
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  return {
    ...state,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    dismissPaymentFailed,
  };
}
