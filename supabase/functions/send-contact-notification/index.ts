import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ContactRequest {
  name: string;
  email: string;
  company: string;
  role?: string;
  company_size?: string;
  how_found?: string;
  message?: string;
}

const HOW_FOUND_LABELS: Record<string, string> = {
  google: 'Google',
  linkedin: 'LinkedIn',
  indicacao: 'Indicação',
  evento: 'Evento/Webinar',
  outro: 'Outro',
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received contact notification request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contactData: ContactRequest = await req.json();
    
    console.log(`Sending contact notification for ${contactData.company}`);

    const howFoundLabel = contactData.how_found 
      ? HOW_FOUND_LABELS[contactData.how_found] || contactData.how_found 
      : 'Não informado';

    const currentDate = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const emailResponse = await resend.emails.send({
      from: "CosmoSec <noreply@cosmosec.com.br>",
      to: ["contato@cosmosec.com.br"],
      reply_to: contactData.email,
      subject: `🚀 Nova Solicitação de Demo: ${contactData.company}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">🛡️ CosmoSec</h1>
            <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Nova Solicitação de Demonstração</p>
          </div>
          
          <div style="background: #fff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
              <p style="color: #166534; margin: 0; font-weight: 600;">
                ✨ Novo lead recebido em ${currentDate}
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Nome Completo</strong><br>
                  <span style="color: #0f172a; font-size: 16px;">${contactData.name}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Email Corporativo</strong><br>
                  <a href="mailto:${contactData.email}" style="color: #3b82f6; font-size: 16px; text-decoration: none;">${contactData.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Empresa</strong><br>
                  <span style="color: #0f172a; font-size: 16px; font-weight: 600;">${contactData.company}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Cargo</strong><br>
                  <span style="color: #0f172a; font-size: 16px;">${contactData.role || 'Não informado'}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Tamanho da Empresa</strong><br>
                  <span style="color: #0f172a; font-size: 16px;">${contactData.company_size || 'Não informado'}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Como Conheceu</strong><br>
                  <span style="color: #0f172a; font-size: 16px;">${howFoundLabel}</span>
                </td>
              </tr>
              ${contactData.message ? `
              <tr>
                <td style="padding: 12px 0;">
                  <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Mensagem</strong><br>
                  <div style="color: #0f172a; font-size: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 8px; white-space: pre-wrap;">${contactData.message}</div>
                </td>
              </tr>
              ` : ''}
            </table>

            <div style="text-align: center; margin-top: 30px; background: #f0f9ff; border-radius: 8px; padding: 15px;">
              <p style="color: #0369a1; margin: 0; font-weight: 600;">
                📧 Para responder, envie email para: <strong>${contactData.email}</strong>
              </p>
            </div>
          </div>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
            Este email foi enviado automaticamente pela plataforma CosmoSec.
          </p>
        </body>
        </html>
      `,
    });

    console.log("Contact notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
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
