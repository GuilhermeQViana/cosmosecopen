import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const PRIORITY_LABELS: Record<string, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "A Fazer",
  in_progress: "Em Progresso",
  review: "Em Revisão",
  done: "Concluído",
};

interface ActionPlan {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  organization_id: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  organization_id: string | null;
}

interface UserEmail {
  id: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[Deadline Notifications] Starting...");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for optional parameters
    let daysAhead = 3;
    let testMode = false;
    let testEmail = "";
    
    try {
      const body = await req.json();
      daysAhead = body.daysAhead ?? 3;
      testMode = body.testMode ?? false;
      testEmail = body.testEmail ?? "";
    } catch {
      // No body, use defaults
    }

    console.log(`[Deadline Notifications] Looking for plans due in ${daysAhead} days, testMode: ${testMode}`);

    // Calculate the target date
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysAhead);
    const targetDateStr = targetDate.toISOString().split("T")[0];

    console.log(`[Deadline Notifications] Target date: ${targetDateStr}`);

    // Get action plans due on the target date
    const { data: plans, error: plansError } = await supabase
      .from("action_plans")
      .select("id, title, description, due_date, priority, status, assigned_to, organization_id")
      .eq("due_date", targetDateStr)
      .neq("status", "done")
      .returns<ActionPlan[]>();

    if (plansError) {
      console.error("[Deadline Notifications] Error fetching plans:", plansError);
      throw plansError;
    }

    console.log(`[Deadline Notifications] Found ${plans?.length || 0} plans due on ${targetDateStr}`);

    if (!plans || plans.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No plans due on target date",
          emailsSent: 0 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Group plans by assigned user
    const plansByUser = new Map<string, ActionPlan[]>();
    const unassignedPlans: ActionPlan[] = [];

    for (const plan of plans) {
      if (plan.assigned_to) {
        if (!plansByUser.has(plan.assigned_to)) {
          plansByUser.set(plan.assigned_to, []);
        }
        plansByUser.get(plan.assigned_to)!.push(plan);
      } else {
        unassignedPlans.push(plan);
      }
    }

    // Get user emails
    const userIds = Array.from(plansByUser.keys());
    const emailsSent: string[] = [];
    const errors: string[] = [];

    if (userIds.length > 0) {
      // Get user emails from auth.users via admin API
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("[Deadline Notifications] Error fetching auth users:", authError);
        throw authError;
      }

      // Get profiles for names
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds)
        .returns<Profile[]>();

      if (profilesError) {
        console.error("[Deadline Notifications] Error fetching profiles:", profilesError);
      }

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const userEmailMap = new Map(authUsers?.users?.map(u => [u.id, u.email]) || []);

      // Send emails to each user
      for (const [userId, userPlans] of plansByUser) {
        const userEmail = testMode ? testEmail : userEmailMap.get(userId);
        const profile = profileMap.get(userId);
        const userName = profile?.full_name || "Usuário";

        if (!userEmail) {
          console.log(`[Deadline Notifications] No email found for user ${userId}`);
          continue;
        }

        console.log(`[Deadline Notifications] Sending email to ${userEmail} with ${userPlans.length} plans`);

        const plansHtml = userPlans.map(plan => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
              <strong>${plan.title}</strong>
              ${plan.description ? `<br><span style="color: #64748b; font-size: 13px;">${plan.description.substring(0, 100)}${plan.description.length > 100 ? '...' : ''}</span>` : ''}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
              <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background: ${plan.priority === 'critica' ? '#fee2e2' : plan.priority === 'alta' ? '#ffedd5' : '#fef9c3'}; color: ${plan.priority === 'critica' ? '#991b1b' : plan.priority === 'alta' ? '#9a3412' : '#854d0e'};">
                ${PRIORITY_LABELS[plan.priority] || plan.priority}
              </span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
              ${STATUS_LABELS[plan.status] || plan.status}
            </td>
          </tr>
        `).join("");

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0f172a; margin-bottom: 10px;">🛡️ CosmoSec GRC</h1>
                <p style="color: #64748b; font-size: 14px;">Lembrete de Prazos</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <p style="color: #92400e; margin: 0; font-size: 16px;">
                  ⏰ <strong>Olá, ${userName}!</strong><br>
                  Você tem <strong>${userPlans.length}</strong> plano(s) de ação com prazo para <strong>${daysAhead === 0 ? 'hoje' : daysAhead === 1 ? 'amanhã' : `${daysAhead} dias`}</strong>.
                </p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
                <thead>
                  <tr style="background: #1e293b; color: white;">
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Plano de Ação</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; width: 100px;">Prioridade</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; width: 120px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${plansHtml}
                </tbody>
              </table>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || '#'}/plano-acao" 
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Ver Planos de Ação
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                Este email foi enviado automaticamente pela plataforma CosmoSec GRC.
              </p>
            </div>
          </body>
          </html>
        `;

        try {
          const emailResponse = await resend.emails.send({
            from: "CosmoSec GRC <onboarding@resend.dev>",
            to: [userEmail],
            subject: `⏰ Lembrete: ${userPlans.length} plano(s) de ação com prazo próximo`,
            html: emailHtml,
          });

          console.log(`[Deadline Notifications] Email sent to ${userEmail}:`, emailResponse);
          emailsSent.push(userEmail);

          // Only send one email in test mode
          if (testMode) break;
        } catch (emailError: any) {
          console.error(`[Deadline Notifications] Error sending email to ${userEmail}:`, emailError);
          errors.push(`${userEmail}: ${emailError.message}`);
        }
      }
    }

    // Notify admins about unassigned plans
    if (unassignedPlans.length > 0 && !testMode) {
      console.log(`[Deadline Notifications] ${unassignedPlans.length} plans without assignee`);
      // Could add logic to notify admins about unassigned plans
    }

    return new Response(
      JSON.stringify({
        success: true,
        plansFound: plans.length,
        emailsSent: emailsSent.length,
        emailAddresses: emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[Deadline Notifications] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

Deno.serve(handler);
