import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildEmailHtml, emailInfoBox, emailText } from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "CosmoSec <noreply@seu-dominio.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate that this call came from our backend (service role key)
    const authHeader = req.headers.get("Authorization") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
      console.error("[notify-new-signup] Unauthorized call - invalid service role key");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, full_name, created_at } = body as {
      email: string;
      full_name?: string;
      created_at: string;
    };

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[notify-new-signup] New signup: ${email}`);

    // Create admin client to list super admins
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceRoleKey,
      { auth: { persistSession: false } }
    );

    // Get all super admin user IDs
    const { data: superAdmins, error: saError } = await supabase
      .from("super_admins")
      .select("user_id");

    if (saError || !superAdmins || superAdmins.length === 0) {
      console.log("[notify-new-signup] No super admins found or error:", saError);
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch super admin emails from auth.admin API
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("[notify-new-signup] Error listing users:", usersError);
      return new Response(JSON.stringify({ error: "Failed to list users" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const superAdminIds = new Set(superAdmins.map((sa) => sa.user_id));
    const superAdminEmails = users
      .filter((u) => superAdminIds.has(u.id) && u.email)
      .map((u) => u.email as string);

    if (superAdminEmails.length === 0) {
      console.log("[notify-new-signup] No super admin emails found");
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format the registration date
    const registeredAt = new Date(created_at).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const displayName = full_name || "Não informado";

    const infoContent = `
      <p style="color: #e2e8f0; font-size: 14px; line-height: 1.8; margin: 0;">
        <span style="color: #94a3b8;">👤 Nome:</span> <strong style="color: #ffffff;">${displayName}</strong><br>
        <span style="color: #94a3b8;">📧 Email:</span> <strong style="color: #a78bfa;">${email}</strong><br>
        <span style="color: #94a3b8;">🕐 Data/hora:</span> <strong style="color: #ffffff;">${registeredAt}</strong>
      </p>
    `;

    const bodyHtml = `
      ${emailText("Um novo usuário acabou de criar uma conta na plataforma CosmoSec. Confira os detalhes abaixo:")}
      ${emailInfoBox("Dados do novo cadastro", infoContent)}
      ${emailText("Acesse o painel administrativo para gerenciar usuários e organizações.")}
    `;

    const htmlContent = buildEmailHtml({
      emoji: "👤",
      title: "Novo cadastro na plataforma",
      accentColor: "rgba(124, 58, 237, 0.2)",
      bodyHtml,
    });

    // Send email to each super admin
    let sentCount = 0;
    for (const adminEmail of superAdminEmails) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [adminEmail],
          subject: `👤 Novo cadastro: ${email}`,
          html: htmlContent,
        });
        sentCount++;
        console.log(`[notify-new-signup] Email sent to ${adminEmail}`);
      } catch (emailError) {
        console.error(`[notify-new-signup] Failed to send email to ${adminEmail}:`, emailError);
      }
    }

    return new Response(JSON.stringify({ success: true, sent: sentCount }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[notify-new-signup] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
