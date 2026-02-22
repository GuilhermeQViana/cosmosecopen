import { Resend } from "https://esm.sh/resend@2.0.0";
import { authenticate, getCorsHeaders, isAuthError, errorResponse } from "../_shared/auth.ts";
import { buildEmailHtml, emailButton, emailInfoBox, emailMutedText } from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "CosmoSec <noreply@seu-dominio.com>";

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
    // Authenticate the caller
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { user, supabase } = auth;

    const { email, organizationName, inviterName, role, inviteToken, appUrl }: InviteEmailRequest = await req.json();

    // Verify user is admin in an organization
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!userRole) {
      return errorResponse('Only admins can send invitations', 403);
    }

    // Verify the invite token belongs to their organization
    const { data: invite } = await supabase
      .from('organization_invites')
      .select('organization_id')
      .eq('token', inviteToken)
      .maybeSingle();

    if (!invite || invite.organization_id !== userRole.organization_id) {
      return errorResponse('Invalid invite token', 403);
    }

    const roleLabel = ROLE_LABELS[role] || role;
    const inviteUrl = `${appUrl}/auth?invite=${inviteToken}`;

    const bodyHtml = `
      <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        <strong style="color: #60a5fa;">${inviterName}</strong> convidou você para fazer parte da organização
        <strong style="color: #ffffff;">${organizationName}</strong> como <strong style="color: #60a5fa;">${roleLabel}</strong>.
      </p>
      ${emailInfoBox(
        'O que você poderá fazer:',
        `<ul style="color: #e2e8f0; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
          <li>📊 Diagnósticos de conformidade</li>
          <li>🛡️ Gestão de riscos</li>
          <li>📋 Planos de ação</li>
          <li>📁 Repositório de evidências</li>
        </ul>`,
        '#60a5fa',
        'rgba(59, 130, 246, 0.1)',
        'rgba(59, 130, 246, 0.3)'
      )}
      ${emailButton('Aceitar Convite →', inviteUrl, 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)')}
      <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 8px; padding: 12px; text-align: center;">
        <p style="color: #fbbf24; margin: 0; font-size: 13px;">⏰ Este convite expira em 7 dias.</p>
      </div>
      ${emailMutedText('Se você não esperava este convite, pode ignorar este email.')}
    `;

    const emailResponse = await resend.emails.send({
      from: "CosmoSec <noreply@cosmosec.com.br>",
      to: [email],
      subject: `Convite para ${organizationName} - CosmoSec`,
      html: buildEmailHtml({
        emoji: '📩',
        title: 'Você foi convidado!',
        accentColor: 'rgba(59, 130, 246, 0.2)',
        bodyHtml,
      }),
    });

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...headers },
    });
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro ao processar solicitação" }),
      { status: 500, headers: { "Content-Type": "application/json", ...headers } }
    );
  }
};

Deno.serve(handler);
