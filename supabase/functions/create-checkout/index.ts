import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { 
  authenticate, 
  handleCors, 
  isAuthError, 
  errorResponse, 
  jsonResponse,
  createLogger 
} from "../_shared/auth.ts";

const logStep = createLogger("CREATE-CHECKOUT");

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    logStep("Function started");

    // Authenticate user
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    
    const { user } = auth;
    if (!user.email) {
      return errorResponse("User email not available", 400);
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Verify Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return errorResponse("STRIPE_SECRET_KEY is not configured", 500);
    }
    logStep("Stripe key verified");

    // Get organization ID from request body
    const { organization_id } = await req.json();
    if (!organization_id) {
      return errorResponse("Organization ID is required", 400);
    }
    logStep("Organization ID received", { organization_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      // Create new customer with organization metadata
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          organization_id,
          user_id: user.id,
        },
      });
      customerId = newCustomer.id;
      logStep("New customer created", { customerId });
    }

    // Create checkout session for the subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: "price_1SlK8NCqxmkFTPhAWPuMspeK", // R$ 449,90/mês
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/checkout-success`,
      cancel_url: `${req.headers.get("origin")}/configuracoes?checkout=canceled`,
      metadata: {
        organization_id,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          organization_id,
          user_id: user.id,
        },
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return jsonResponse({ url: session.url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return errorResponse(errorMessage, 500);
  }
});
