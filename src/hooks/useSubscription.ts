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

      setState({
        hasAccess: data.has_access,
        subscriptionStatus: data.subscription_status,
        isTrialing: data.is_trialing,
        daysRemaining: data.days_remaining,
        trialEndsAt: data.trial_ends_at,
        subscriptionEndsAt: data.subscription_ends_at,
        isLoading: false,
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

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { organization_id: organization.id },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao iniciar checkout. Tente novamente.');
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
  };
}
