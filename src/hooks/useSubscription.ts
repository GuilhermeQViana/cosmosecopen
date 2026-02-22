export function useSubscription() {
  return {
    hasAccess: true,
    subscriptionStatus: 'active' as const,
    isTrialing: false,
    daysRemaining: null,
    daysUntilRenewal: null,
    trialEndsAt: null,
    subscriptionEndsAt: null,
    isLoading: false,
    isCheckoutLoading: false,
    hasPaymentFailed: false,
    checkSubscription: async () => {},
    createCheckout: async () => {},
    openCustomerPortal: async () => {},
    dismissPaymentFailed: async () => {},
  };
}
