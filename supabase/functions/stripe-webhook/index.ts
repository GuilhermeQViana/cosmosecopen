import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildEmailHtml, emailGreeting, emailText, emailInfoBox, emailButton, emailMutedText } from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://cosmosec.com.br",
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

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();

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
              const { data: { user } } = await supabaseClient.auth.admin.getUserById(role.user_id);
              
              if (user?.email) {
                const { data: profile } = await supabaseClient
                  .from('profiles')
                  .select('full_name')
                  .eq('id', role.user_id)
                  .single();

                const welcomeBody = `
                  ${emailGreeting(profile?.full_name || 'Usuário')}
                  ${emailText(`Sua assinatura para <strong style="color: #ffffff;">${organization.name}</strong> foi ativada com sucesso! Agora você tem acesso completo a todas as funcionalidades da plataforma.`)}
                  ${emailInfoBox(
                    'O que você pode fazer agora:',
                    `<ul style="color: #e2e8f0; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                      <li>📊 Realizar diagnósticos completos de conformidade</li>
                      <li>🛡️ Gerenciar riscos de segurança da informação</li>
                      <li>📋 Criar e acompanhar planos de ação</li>
                      <li>📁 Organizar evidências de auditoria</li>
                      <li>📈 Gerar relatórios executivos</li>
                      <li>🤖 Utilizar IA para gerar planos de remediação</li>
                    </ul>`
                  )}
                  ${emailButton('Acessar Dashboard →', 'https://cosmosec.com.br/dashboard')}
                `;

                await resend.emails.send({
                  from: "CosmoSec <noreply@cosmosec.com.br>",
                  to: [user.email],
                  subject: "🎉 Bem-vindo ao CosmoSec! Sua assinatura está ativa",
                  html: buildEmailHtml({
                    emoji: '🚀',
                    title: 'Bem-vindo ao CosmoSec!',
                    bodyHtml: welcomeBody,
                  }),
                });
                logStep("Welcome email sent", { email: user.email });
              }
            }
          }
        } catch (emailError) {
          logStep("Error sending welcome email", { error: emailError });
        }

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        if (invoice.billing_reason === 'subscription_create') {
          logStep("Skipping first invoice - handled by checkout.session.completed");
          break;
        }

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

        // Send payment confirmation email
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

                const paymentBody = `
                  ${emailGreeting(profile?.full_name || 'Usuário', '#22c55e')}
                  ${emailText(`O pagamento da assinatura de <strong style="color: #ffffff;">${organization.name}</strong> foi processado com sucesso!`)}
                  ${emailInfoBox(
                    'Detalhes do Pagamento',
                    `<table style="width: 100%; color: #e2e8f0; font-size: 14px;">
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
                    </table>`,
                    '#22c55e',
                    'rgba(34, 197, 94, 0.1)',
                    'rgba(34, 197, 94, 0.3)'
                  )}
                  ${emailMutedText('Sua assinatura foi renovada automaticamente. Você pode gerenciar sua assinatura a qualquer momento nas configurações da sua conta.')}
                  ${emailButton('Gerenciar Assinatura →', 'https://cosmosec.com.br/configuracoes', 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)')}
                `;

                await resend.emails.send({
                  from: "CosmoSec <noreply@cosmosec.com.br>",
                  to: [user.email],
                  subject: "✅ Pagamento confirmado - CosmoSec",
                  html: buildEmailHtml({
                    emoji: '✅',
                    title: 'Pagamento Confirmado',
                    accentColor: 'rgba(34, 197, 94, 0.2)',
                    bodyHtml: paymentBody,
                  }),
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

        // Send cancellation email
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

                const cancelBody = `
                  ${emailGreeting(profile?.full_name || 'Usuário', '#f87171')}
                  ${emailText(`Lamentamos informar que a assinatura de <strong style="color: #ffffff;">${organization.name}</strong> foi cancelada.`)}
                  ${emailInfoBox(
                    'O que acontece agora?',
                    `<ul style="color: #e2e8f0; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                      <li>Seu acesso permanece ativo até <strong>${endDate}</strong></li>
                      <li>Após essa data, você perderá acesso às funcionalidades premium</li>
                      <li>Seus dados serão mantidos por 30 dias</li>
                      <li>Você pode reativar a assinatura a qualquer momento</li>
                    </ul>`,
                    '#f87171',
                    'rgba(239, 68, 68, 0.1)',
                    'rgba(239, 68, 68, 0.3)'
                  )}
                  ${emailMutedText('Sentiremos sua falta! Se mudou de ideia ou se houve algum problema, estamos aqui para ajudar.')}
                  ${emailButton('Reativar Assinatura →', 'https://cosmosec.com.br/configuracoes')}
                  <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
                    Tem dúvidas? Entre em contato conosco respondendo este email.
                  </p>
                `;

                await resend.emails.send({
                  from: "CosmoSec <noreply@cosmosec.com.br>",
                  to: [user.email],
                  subject: "😢 Sua assinatura foi cancelada - CosmoSec",
                  html: buildEmailHtml({
                    emoji: '😢',
                    title: 'Assinatura Cancelada',
                    accentColor: 'rgba(239, 68, 68, 0.2)',
                    bodyHtml: cancelBody,
                  }),
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

        logStep("Payment failed for organization", { organizationId });
        
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
