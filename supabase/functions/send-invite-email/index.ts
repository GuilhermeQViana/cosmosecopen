import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from "../_shared/auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface InviteEmailRequest {
  email: string;
  organizationName: string;
  inviterName: string;
  role: string;
  inviteToken: string;
  appUrl: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  auditor: 'Auditor',
  analyst: 'Analista',
};

const handler = async (req: Request): Promise<Response> => {
  const headers = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const { email, organizationName, inviterName, role, inviteToken, appUrl }: InviteEmailRequest = await req.json();

    const roleLabel = ROLE_LABELS[role] || role;
    const inviteUrl = `${appUrl}/auth?invite=${inviteToken}`;

    const emailResponse = await resend.emails.send({
      from: "CosmoSec <noreply@cosmosec.com.br>",
      to: [email],
      subject: `Convite para ${organizationName} - CosmoSec`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin: 0; padding: 0; background-color: #0a0a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a1a; padding: 40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                <tr><td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, transparent 100%);">
                  <div style="font-size: 48px; margin-bottom: 16px;">📩</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Você foi convidado!</h1>
                </td></tr>
                <tr><td style="padding: 30px 40px;">
                  <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                    <strong style="color: #60a5fa;">${inviterName}</strong> convidou você para fazer parte da organização
                    <strong style="color: #ffffff;">${organizationName}</strong> como <strong style="color: #60a5fa;">${roleLabel}</strong>.
                  </p>
                  <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
                    <h3 style="color: #60a5fa; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">O que você poderá fazer:</h3>
                    <ul style="color: #e2e8f0; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                      <li>📊 Diagnósticos de conformidade</li>
                      <li>🛡️ Gestão de riscos</li>
                      <li>📋 Planos de ação</li>
                      <li>📁 Repositório de evidências</li>
                    </ul>
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr><td align="center">
                      <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Aceitar Convite →</a>
                    </td></tr>
                  </table>
                  <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 8px; padding: 12px; text-align: center;">
                    <p style="color: #fbbf24; margin: 0; font-size: 13px;">⏰ Este convite expira em 7 dias.</p>
                  </div>
                  <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                    Se você não esperava este convite, pode ignorar este email.
                  </p>
                </td></tr>
                <tr><td style="padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                  <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                    &copy; ${new Date().getFullYear()} CosmoSec. Todos os direitos reservados.
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...headers },
    });
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...headers } }
    );
  }
};

Deno.serve(handler);
