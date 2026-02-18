import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    if (!webhookSecret) {
      logStep("STRIPE_WEBHOOK_SECRET is not set - rejecting request");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signature) {
      logStep("Missing stripe-signature header - rejecting request");
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified");
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err });
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

        // Send welcome email to all admins
        try {
          const { data: organization } = await supabaseClient
            .from('organizations')
            .select('name')
            .eq('id', organizationId)
            .single();

          const { data: adminRoles } = await supabaseClient
            .from('user_roles')
            .select('user_id')
            .eq('organization_id', organizationId)
            .eq('role', 'admin');

          if (adminRoles && organization) {
            for (const role of adminRoles) {
              // Get user email from auth
              const { data: { user } } = await supabaseClient.auth.admin.getUserById(role.user_id);
              
              if (user?.email) {
                // Get profile name
                const { data: profile } = await supabaseClient
                  .from('profiles')
                  .select('full_name')
                  .eq('id', role.user_id)
                  .single();

                await resend.emails.send({
                  from: "CosmoSec <noreply@cosmosec.com.br>",
                  to: [user.email],
                  subject: "🎉 Bem-vindo ao CosmoSec! Sua assinatura está ativa",
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #0a0a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a1a; padding: 40px 20px;">
                        <tr>
                          <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                              <tr>
                                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(79, 70, 229, 0.1) 100%);">
                                  <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Bem-vindo ao CosmoSec!</h1>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 30px 40px;">
                                  <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                    Olá <strong style="color: #a78bfa;">${profile?.full_name || 'Usuário'}</strong>,
                                  </p>
                                  <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                    Sua assinatura para <strong style="color: #ffffff;">${organization.name}</strong> foi ativada com sucesso! 
                                    Agora você tem acesso completo a todas as funcionalidades da plataforma.
                                  </p>
                                  <div style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
                                    <h3 style="color: #a78bfa; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">O que você pode fazer agora:</h3>
                                    <ul style="color: #e2e8f0; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                                      <li>📊 Realizar diagnósticos completos de conformidade</li>
                                      <li>🛡️ Gerenciar riscos de segurança da informação</li>
                                      <li>📋 Criar e acompanhar planos de ação</li>
                                      <li>📁 Organizar evidências de auditoria</li>
                                      <li>📈 Gerar relatórios executivos</li>
                                      <li>🤖 Utilizar IA para gerar planos de remediação</li>
                                    </ul>
                                  </div>
                                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                      <td align="center">
                                        <a href="https://cosmosec.com.br/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Acessar Dashboard →</a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                                  <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                                    © ${new Date().getFullYear()} CosmoSec. Todos os direitos reservados.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </body>
                    </html>
                  `,
                });
                logStep("Welcome email sent", { email: user.email });
              }
            }
          }
        } catch (emailError) {
          logStep("Error sending welcome email", { error: emailError });
          // Don't throw - email is non-critical
        }

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Skip first invoice (already handled by checkout.session.completed)
        if (invoice.billing_reason === 'subscription_create') {
          logStep("Skipping first invoice - handled by checkout.session.completed");
          break;
        }

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

        // Send payment confirmation email to admins
        try {
          const { data: organization } = await supabaseClient
            .from('organizations')
            .select('name')
            .eq('id', organizationId)
            .single();

          const { data: adminRoles } = await supabaseClient
            .from('user_roles')
            .select('user_id')
            .eq('organization_id', organizationId)
            .eq('role', 'admin');

          if (adminRoles && organization) {
            const amountPaid = (invoice.amount_paid / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const nextBillingDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR');

            for (const role of adminRoles) {
              const { data: { user } } = await supabaseClient.auth.admin.getUserById(role.user_id);
              
              if (user?.email) {
                const { data: profile } = await supabaseClient
                  .from('profiles')
                  .select('full_name')
                  .eq('id', role.user_id)
                  .single();

                await resend.emails.send({
                  from: "CosmoSec <noreply@cosmosec.com.br>",
                  to: [user.email],
                  subject: "✅ Pagamento confirmado - CosmoSec",
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #0a0a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a1a; padding: 40px 20px;">
                        <tr>
                          <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                              <tr>
                                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%);">
                                  <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Pagamento Confirmado</h1>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 30px 40px;">
                                  <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                    Olá <strong style="color: #22c55e;">${profile?.full_name || 'Usuário'}</strong>,
                                  </p>
                                  <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                    O pagamento da assinatura de <strong style="color: #ffffff;">${organization.name}</strong> foi processado com sucesso!
                                  </p>
                                  
                                  <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
                                    <h3 style="color: #22c55e; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">Detalhes do Pagamento</h3>
                                    <table style="width: 100%; color: #e2e8f0; font-size: 14px;">
                                      <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">Valor pago</td>
                                        <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; font-weight: 600; color: #22c55e;">${amountPaid}</td>
                                      </tr>
                                      <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">Plano</td>
                                        <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right;">Profissional</td>
                                      </tr>
                                      <tr>
                                        <td style="padding: 8px 0;">Próxima cobrança</td>
                                        <td style="padding: 8px 0; text-align: right;">${nextBillingDate}</td>
                                      </tr>
                                    </table>
                                  </div>
                                  
                                  <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                                    Sua assinatura foi renovada automaticamente. Você pode gerenciar sua assinatura a qualquer momento nas configurações da sua conta.
                                  </p>
                                  
                                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                      <td align="center">
                                        <a href="https://cosmosec.com.br/configuracoes" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Gerenciar Assinatura →</a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                                  <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                                    © ${new Date().getFullYear()} CosmoSec. Todos os direitos reservados.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </body>
                    </html>
                  `,
                });
                logStep("Payment confirmation email sent", { email: user.email });
              }
            }
          }
        } catch (emailError) {
          logStep("Error sending payment confirmation email", { error: emailError });
        }

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

        // Send cancellation email to admins
        try {
          const { data: organization } = await supabaseClient
            .from('organizations')
            .select('name')
            .eq('id', organizationId)
            .single();

          const { data: adminRoles } = await supabaseClient
            .from('user_roles')
            .select('user_id')
            .eq('organization_id', organizationId)
            .eq('role', 'admin');

          if (adminRoles && organization) {
            const endDate = subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR')
              : 'em breve';

            for (const role of adminRoles) {
              const { data: { user } } = await supabaseClient.auth.admin.getUserById(role.user_id);
              
              if (user?.email) {
                const { data: profile } = await supabaseClient
                  .from('profiles')
                  .select('full_name')
                  .eq('id', role.user_id)
                  .single();

                await resend.emails.send({
                  from: "CosmoSec <noreply@cosmosec.com.br>",
                  to: [user.email],
                  subject: "😢 Sua assinatura foi cancelada - CosmoSec",
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #0a0a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a1a; padding: 40px 20px;">
                        <tr>
                          <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                              <tr>
                                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%);">
                                  <div style="font-size: 48px; margin-bottom: 16px;">😢</div>
                                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Assinatura Cancelada</h1>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 30px 40px;">
                                  <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                    Olá <strong style="color: #f87171;">${profile?.full_name || 'Usuário'}</strong>,
                                  </p>
                                  <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                    Lamentamos informar que a assinatura de <strong style="color: #ffffff;">${organization.name}</strong> foi cancelada.
                                  </p>
                                  
                                  <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
                                    <h3 style="color: #f87171; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">O que acontece agora?</h3>
                                    <ul style="color: #e2e8f0; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                                      <li>Seu acesso permanece ativo até <strong>${endDate}</strong></li>
                                      <li>Após essa data, você perderá acesso às funcionalidades premium</li>
                                      <li>Seus dados serão mantidos por 30 dias</li>
                                      <li>Você pode reativar a assinatura a qualquer momento</li>
                                    </ul>
                                  </div>
                                  
                                  <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                                    Sentiremos sua falta! Se mudou de ideia ou se houve algum problema, estamos aqui para ajudar.
                                  </p>
                                  
                                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                      <td align="center">
                                        <a href="https://cosmosec.com.br/configuracoes" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reativar Assinatura →</a>
                                      </td>
                                    </tr>
                                  </table>
                                  
                                  <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
                                    Tem dúvidas? Entre em contato conosco respondendo este email.
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                                  <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                                    © ${new Date().getFullYear()} CosmoSec. Todos os direitos reservados.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </body>
                    </html>
                  `,
                });
                logStep("Cancellation email sent", { email: user.email });
              }
            }
          }
        } catch (emailError) {
          logStep("Error sending cancellation email", { error: emailError });
        }

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
