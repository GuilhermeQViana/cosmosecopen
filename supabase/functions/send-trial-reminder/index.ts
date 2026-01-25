import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRIAL-REMINDER] ${step}${detailsStr}`);
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

    // Find organizations with trial ending in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysStart = new Date(threeDaysFromNow);
    threeDaysStart.setHours(0, 0, 0, 0);
    const threeDaysEnd = new Date(threeDaysFromNow);
    threeDaysEnd.setHours(23, 59, 59, 999);

    const { data: organizations, error: orgError } = await supabaseClient
      .from('organizations')
      .select('id, name, trial_ends_at')
      .eq('subscription_status', 'trialing')
      .gte('trial_ends_at', threeDaysStart.toISOString())
      .lte('trial_ends_at', threeDaysEnd.toISOString());

    if (orgError) {
      logStep("Error fetching organizations", { error: orgError });
      throw orgError;
    }

    logStep("Found organizations with trial ending in 3 days", { count: organizations?.length || 0 });

    if (!organizations || organizations.length === 0) {
      return new Response(JSON.stringify({ message: "No trials expiring in 3 days" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let emailsSent = 0;

    for (const org of organizations) {
      // Get admin users for this organization
      const { data: adminRoles } = await supabaseClient
        .from('user_roles')
        .select('user_id')
        .eq('organization_id', org.id)
        .eq('role', 'admin');

      if (!adminRoles) continue;

      for (const role of adminRoles) {
        // Check if we already sent a reminder (avoid duplicates)
        const { data: existingNotification } = await supabaseClient
          .from('notifications')
          .select('id')
          .eq('user_id', role.user_id)
          .eq('title', 'Seu trial expira em 3 dias!')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (existingNotification && existingNotification.length > 0) {
          logStep("Reminder already sent", { userId: role.user_id });
          continue;
        }

        // Get user email
        const { data: { user } } = await supabaseClient.auth.admin.getUserById(role.user_id);
        if (!user?.email) continue;

        // Get user name
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('full_name')
          .eq('id', role.user_id)
          .single();

        const trialEndDate = new Date(org.trial_ends_at).toLocaleDateString('pt-BR');

        // Send email
        try {
          await resend.emails.send({
            from: "CosmoSec <noreply@cosmosec.com.br>",
            to: [user.email],
            subject: "⏰ Seu trial expira em 3 dias - CosmoSec",
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
                          <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);">
                            <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Seu Trial Expira em 3 Dias!</h1>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 30px 40px;">
                            <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                              Olá <strong style="color: #fbbf24;">${profile?.full_name || 'Usuário'}</strong>,
                            </p>
                            <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                              O período de teste da organização <strong style="color: #ffffff;">${org.name}</strong> expira em <strong style="color: #fbbf24;">${trialEndDate}</strong>.
                            </p>
                            
                            <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
                              <h3 style="color: #fbbf24; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">Não perca acesso a:</h3>
                              <ul style="color: #e2e8f0; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                                <li>📊 Diagnósticos de conformidade</li>
                                <li>🛡️ Gestão de riscos</li>
                                <li>📋 Planos de ação com IA</li>
                                <li>📁 Repositório de evidências</li>
                                <li>📈 Relatórios executivos</li>
                              </ul>
                            </div>
                            
                            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                              Assine agora e continue protegendo sua organização com o CosmoSec.
                            </p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                              <tr>
                                <td align="center">
                                  <a href="https://cosmosec.lovable.dev/configuracoes" style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Assinar Agora →</a>
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

          logStep("Trial reminder email sent", { email: user.email, organization: org.name });
          emailsSent++;

          // Create in-app notification
          await supabaseClient.from('notifications').insert({
            user_id: role.user_id,
            organization_id: org.id,
            title: 'Seu trial expira em 3 dias!',
            message: `O período de teste de ${org.name} expira em ${trialEndDate}. Assine para continuar usando.`,
            type: 'warning',
            link: '/configuracoes',
          });

        } catch (emailError) {
          logStep("Error sending email", { error: emailError, email: user.email });
        }
      }
    }

    logStep("Function completed", { emailsSent });

    return new Response(JSON.stringify({ 
      message: `Sent ${emailsSent} trial reminder emails`,
      emailsSent 
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
