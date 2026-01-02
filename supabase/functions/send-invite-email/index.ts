import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  console.log("Received invite email request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      organizationName, 
      inviterName, 
      role, 
      inviteToken,
      appUrl 
    }: InviteEmailRequest = await req.json();

    console.log(`Sending invite email to ${email} for organization ${organizationName}`);

    const roleLabel = ROLE_LABELS[role] || role;
    const inviteUrl = `${appUrl}/auth?invite=${inviteToken}`;

    const emailResponse = await resend.emails.send({
      from: "Cora GovSec <onboarding@resend.dev>",
      to: [email],
      subject: `Convite para ${organizationName} - Cora GovSec`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f172a; margin-bottom: 10px;">🛡️ Cora GovSec</h1>
            <p style="color: #64748b; font-size: 14px;">Plataforma de Governança, Risco e Conformidade</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #0f172a; margin-top: 0;">Você foi convidado!</h2>
            <p style="color: #475569;">
              <strong>${inviterName}</strong> convidou você para fazer parte da organização 
              <strong>${organizationName}</strong> como <strong>${roleLabel}</strong>.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Aceitar Convite
            </a>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              ⏰ Este convite expira em 7 dias.
            </p>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            Se você não esperava este convite, pode ignorar este email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Este email foi enviado pela plataforma Cora GovSec.<br>
            <a href="${appUrl}" style="color: #3b82f6;">Acessar plataforma</a>
          </p>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);
