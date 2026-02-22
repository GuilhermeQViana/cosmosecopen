import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders, getCorsHeaders } from "../_shared/auth.ts";
import { buildEmailHtml, emailGreeting, emailText, emailInfoBox, emailButton, emailMutedText } from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "CosmoSec <noreply@seu-dominio.com>";
const APP_URL = Deno.env.get("APP_URL") || "https://seu-dominio.com";

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
      const { data: adminRoles } = await supabaseClient
        .from('user_roles')
        .select('user_id')
        .eq('organization_id', org.id)
        .eq('role', 'admin');

      if (!adminRoles) continue;

      for (const role of adminRoles) {
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

        const { data: { user } } = await supabaseClient.auth.admin.getUserById(role.user_id);
        if (!user?.email) continue;

        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('full_name')
          .eq('id', role.user_id)
          .single();

        const trialEndDate = new Date(org.trial_ends_at).toLocaleDateString('pt-BR');

        try {
          const bodyHtml = `
            ${emailGreeting(profile?.full_name || 'Usuário', '#fbbf24')}
            ${emailText(`O período de teste da organização <strong style="color: #ffffff;">${org.name}</strong> expira em <strong style="color: #fbbf24;">${trialEndDate}</strong>.`)}
            ${emailInfoBox(
              'Não perca acesso a:',
              `<ul style="color: #e2e8f0; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                <li>📊 Diagnósticos de conformidade</li>
                <li>🛡️ Gestão de riscos</li>
                <li>📋 Planos de ação com IA</li>
                <li>📁 Repositório de evidências</li>
                <li>📈 Relatórios executivos</li>
              </ul>`,
              '#fbbf24',
              'rgba(251, 191, 36, 0.1)',
              'rgba(251, 191, 36, 0.3)'
            )}
            ${emailMutedText('Assine agora e continue protegendo sua organização com o CosmoSec.')}
            ${emailButton('Assinar Agora →', 'https://cosmosec.com.br/configuracoes', 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', '#000000')}
          `;

          await resend.emails.send({
            from: "CosmoSec <noreply@cosmosec.com.br>",
            to: [user.email],
            subject: "⏰ Seu trial expira em 3 dias - CosmoSec",
            html: buildEmailHtml({
              emoji: '⏰',
              title: 'Seu Trial Expira em 3 Dias!',
              accentColor: 'rgba(251, 191, 36, 0.2)',
              bodyHtml,
            }),
          });

          logStep("Trial reminder email sent", { email: user.email, organization: org.name });
          emailsSent++;

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
