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
  daysUntilRenewal: number | null;
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
    daysUntilRenewal: null,
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
      if (!session.session) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Check if user is super admin (owner) - bypass all subscription checks
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
        check_user_id: user.id
      });

      if (isSuperAdmin) {
        setState({
          hasAccess: true,
          subscriptionStatus: 'active',
          isTrialing: false,
          daysRemaining: null,
          daysUntilRenewal: null,
          trialEndsAt: null,
          subscriptionEndsAt: null,
          isLoading: false,
          isCheckoutLoading: false,
          hasPaymentFailed: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { organization_id: organization.id },
      });

      // Handle 401 gracefully - user not authenticated
      if (error && error.message?.includes('401')) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      if (error) throw error;

      // Check for payment failed notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', 'Falha no pagamento')
        .eq('read', false)
        .limit(1);

      // Calculate days until renewal for active subscriptions
      let daysUntilRenewal: number | null = null;
      if (data.subscription_status === 'active' && data.subscription_ends_at) {
        const subscriptionEndsAtDate = new Date(data.subscription_ends_at);
        daysUntilRenewal = Math.ceil((subscriptionEndsAtDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      }

      setState({
        hasAccess: data.has_access,
        subscriptionStatus: data.subscription_status,
        isTrialing: data.is_trialing,
        daysRemaining: data.days_remaining,
        daysUntilRenewal,
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
    // Only check if organization changed or initial load
    const orgChanged = organization?.id !== lastCheckedOrg.current;
    if (orgChanged || !initialCheckDone.current) {
      checkSubscription();
    }
  }, [organization?.id, checkSubscription]);

  // Refresh every 5 minutes (less aggressive than every minute)
  useEffect(() => {
    const interval = setInterval(() => checkSubscription(true), 300000);
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
