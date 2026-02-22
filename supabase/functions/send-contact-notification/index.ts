import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, getCorsHeaders } from "../_shared/auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "CosmoSec <noreply@seu-dominio.com>";
const CONTACT_EMAIL = Deno.env.get("CONTACT_EMAIL") || "contato@seu-dominio.com";

interface ContactRequest {
  name: string;
  email: string;
  company: string;
  role?: string;
  interest_type?: string;
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

const INTEREST_TYPE_LABELS: Record<string, string> = {
  empresa: 'Para minha empresa',
  consultoria: 'Para minha consultoria/auditoria',
  parceiro: 'Quero ser parceiro',
};

const VALID_COMPANY_SIZES = ['1-50', '51-200', '201-500', '501-1000', '1000+'];
const VALID_HOW_FOUND = ['google', 'linkedin', 'indicacao', 'evento', 'outro'];
const VALID_INTEREST_TYPES = ['empresa', 'consultoria', 'parceiro'];

// --- Rate Limiting via Supabase ---
async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { count } = await supabase
      .from("contact_requests")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneHourAgo);

    // Max 5 contact requests per hour globally (simple approach)
    // For IP-based, we'd need an ip column — using global limit as safeguard
    return (count ?? 0) < 10;
  } catch {
    // If rate limit check fails, allow the request but log it
    console.warn("Rate limit check failed, allowing request");
    return true;
  }
}

// --- Input Validation & Sanitization ---
function sanitize(str: string, maxLen: number): string {
  return str.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '').trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function validateContactData(data: unknown): { valid: true; data: ContactRequest } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Dados inválidos' };
  }

  const d = data as Record<string, unknown>;

  if (typeof d.name !== 'string' || !d.name.trim()) {
    return { valid: false, error: 'Nome é obrigatório' };
  }
  if (typeof d.email !== 'string' || !isValidEmail(d.email)) {
    return { valid: false, error: 'Email inválido' };
  }
  if (typeof d.company !== 'string' || !d.company.trim()) {
    return { valid: false, error: 'Empresa é obrigatória' };
  }

  const validated: ContactRequest = {
    name: sanitize(d.name as string, 100),
    email: (d.email as string).trim().slice(0, 255),
    company: sanitize(d.company as string, 200),
  };

  if (d.role && typeof d.role === 'string') {
    validated.role = sanitize(d.role, 100);
  }
  if (d.interest_type && typeof d.interest_type === 'string' && VALID_INTEREST_TYPES.includes(d.interest_type)) {
    validated.interest_type = d.interest_type;
  }
  if (d.company_size && typeof d.company_size === 'string' && VALID_COMPANY_SIZES.includes(d.company_size)) {
    validated.company_size = d.company_size;
  }
  if (d.how_found && typeof d.how_found === 'string' && VALID_HOW_FOUND.includes(d.how_found)) {
    validated.how_found = d.how_found;
  }
  if (d.message && typeof d.message === 'string') {
    validated.message = sanitize(d.message, 2000);
  }

  return { valid: true, data: validated };
}

const handler = async (req: Request): Promise<Response> => {
  const headers = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const allowed = await checkRateLimit(clientIp);
    if (!allowed) {
      return new Response(
        JSON.stringify({ success: false, error: "Muitas solicitações. Tente novamente mais tarde." }),
        { status: 429, headers: { "Content-Type": "application/json", ...headers } }
      );
    }

    // Validate payload size
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10_000) {
      return new Response(
        JSON.stringify({ success: false, error: "Payload muito grande" }),
        { status: 413, headers: { "Content-Type": "application/json", ...headers } }
      );
    }

    const rawData = await req.json();
    const validation = validateContactData(rawData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...headers } }
      );
    }

    const contactData = validation.data;

    const howFoundLabel = contactData.how_found 
      ? HOW_FOUND_LABELS[contactData.how_found] || contactData.how_found 
      : 'Não informado';

    const interestTypeLabel = contactData.interest_type 
      ? INTEREST_TYPE_LABELS[contactData.interest_type] || contactData.interest_type 
      : 'Não informado';

    const currentDate = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const subjectEmoji = contactData.interest_type === 'parceiro' ? '🤝' : '🚀';
    const subjectType = contactData.interest_type === 'parceiro' ? 'de Parceria' : 'de Demo';

    const emailResponse = await resend.emails.send({
      from: "CosmoSec <contato@cosmosec.com.br>",
      to: ["contato@cosmosec.com.br"],
      reply_to: contactData.email,
      subject: `${subjectEmoji} Nova Solicitação ${subjectType}: ${contactData.company}`,
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
            <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Nova Solicitação ${subjectType}</p>
          </div>
          
          <div style="background: #fff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
              <p style="color: #166534; margin: 0; font-weight: 600;">
                ✨ Novo lead recebido em ${currentDate}
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Nome Completo</strong><br><span style="color: #0f172a; font-size: 16px;">${contactData.name}</span></td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Email Corporativo</strong><br><span style="color: #0f172a; font-size: 16px;">${contactData.email}</span></td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Empresa</strong><br><span style="color: #0f172a; font-size: 16px; font-weight: 600;">${contactData.company}</span></td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Cargo</strong><br><span style="color: #0f172a; font-size: 16px;">${contactData.role || 'Não informado'}</span></td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Tipo de Interesse</strong><br><span style="color: #0f172a; font-size: 16px; font-weight: 600;">${interestTypeLabel}</span></td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Tamanho da Empresa</strong><br><span style="color: #0f172a; font-size: 16px;">${contactData.company_size || 'Não informado'}</span></td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Como Conheceu</strong><br><span style="color: #0f172a; font-size: 16px;">${howFoundLabel}</span></td></tr>
              ${contactData.message ? `<tr><td style="padding: 12px 0;"><strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Mensagem</strong><br><div style="color: #0f172a; font-size: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 8px; white-space: pre-wrap;">${contactData.message}</div></td></tr>` : ''}
            </table>

            <div style="text-align: center; margin-top: 30px; background: #f0f9ff; border-radius: 8px; padding: 15px;">
              <p style="color: #0369a1; margin: 0; font-size: 14px;">
                💡 Use "Responder" no seu cliente de email para contatar este lead diretamente.
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

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...headers },
    });
  } catch (error: unknown) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro ao processar a solicitação" }),
      { status: 500, headers: { "Content-Type": "application/json", ...headers } }
    );
  }
};

Deno.serve(handler);
