import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get organization_id from request body
    const body = await req.json().catch(() => ({}));
    const { organization_id } = body;
    
    if (!organization_id) {
      throw new Error("Organization ID is required");
    }
    logStep("Checking subscription for organization", { organization_id });

    // First, check the organization's subscription status in the database
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('trial_ends_at, subscription_status, subscription_ends_at, stripe_customer_id, stripe_subscription_id')
      .eq('id', organization_id)
      .single();

    if (orgError) throw new Error(`Organization not found: ${orgError.message}`);
    logStep("Organization data fetched", org);

    // Check if still in trial
    const now = new Date();
    const trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : null;
    const isInTrial = trialEndsAt && trialEndsAt > now;
    const daysRemaining = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // If org has active subscription in database, trust it
    if (org.subscription_status === 'active') {
      logStep("Active subscription found in database");
      return new Response(JSON.stringify({
        has_access: true,
        subscription_status: 'active',
        is_trialing: false,
        days_remaining: null,
        subscription_ends_at: org.subscription_ends_at,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If in trial, return trial info
    if (isInTrial && org.subscription_status === 'trialing') {
      logStep("In trial period", { daysRemaining });
      return new Response(JSON.stringify({
        has_access: true,
        subscription_status: 'trialing',
        is_trialing: true,
        days_remaining: Math.max(0, daysRemaining),
        trial_ends_at: org.trial_ends_at,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Trial expired and no active subscription
    logStep("Access expired - trial ended and no active subscription");
    return new Response(JSON.stringify({
      has_access: false,
      subscription_status: org.subscription_status || 'expired',
      is_trialing: false,
      days_remaining: 0,
      trial_ends_at: org.trial_ends_at,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
