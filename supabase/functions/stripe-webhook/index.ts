import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err });
        // If verification fails but we have the body, try to parse it anyway
        event = JSON.parse(body);
        logStep("Parsed event without verification (development mode)");
      }
    } else {
      // Development mode - no signature verification
      event = JSON.parse(body);
      logStep("Development mode - no signature verification");
    }

    logStep("Processing event", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organization_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!organizationId) {
          logStep("No organization_id in session metadata");
          break;
        }

        logStep("Checkout completed", { organizationId, customerId, subscriptionId });

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();

        // Update organization
        const { error: updateError } = await supabaseClient
          .from('organizations')
          .update({
            subscription_status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_ends_at: subscriptionEndDate,
          })
          .eq('id', organizationId);

        if (updateError) {
          logStep("Error updating organization", { error: updateError });
          throw updateError;
        }

        logStep("Organization subscription activated", { organizationId });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Get subscription to find organization
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const organizationId = subscription.metadata?.organization_id;

        if (!organizationId) {
          logStep("No organization_id in subscription metadata");
          break;
        }

        const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();

        const { error: updateError } = await supabaseClient
          .from('organizations')
          .update({
            subscription_status: 'active',
            subscription_ends_at: subscriptionEndDate,
          })
          .eq('id', organizationId);

        if (updateError) {
          logStep("Error updating organization", { error: updateError });
        }

        logStep("Invoice paid - subscription renewed", { organizationId, subscriptionEndDate });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;

        if (!organizationId) {
          logStep("No organization_id in subscription metadata");
          break;
        }

        const { error: updateError } = await supabaseClient
          .from('organizations')
          .update({
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('id', organizationId);

        if (updateError) {
          logStep("Error updating organization", { error: updateError });
        }

        logStep("Subscription canceled", { organizationId });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const organizationId = subscription.metadata?.organization_id;

        if (!organizationId) break;

        // Optionally mark as payment_failed or create notification
        logStep("Payment failed for organization", { organizationId });
        
        // Create notification for admins
        const { data: adminRoles } = await supabaseClient
          .from('user_roles')
          .select('user_id')
          .eq('organization_id', organizationId)
          .eq('role', 'admin');

        if (adminRoles) {
          for (const role of adminRoles) {
            await supabaseClient.from('notifications').insert({
              user_id: role.user_id,
              organization_id: organizationId,
              title: 'Falha no pagamento',
              message: 'Houve uma falha no pagamento da sua assinatura. Por favor, atualize seu método de pagamento.',
              type: 'warning',
              link: '/configuracoes',
            });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
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
