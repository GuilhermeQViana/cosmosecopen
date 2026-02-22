import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders, getCorsHeaders } from "../_shared/auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "CosmoSec <noreply@seu-dominio.com>";
const APP_URL = Deno.env.get("APP_URL") || "https://seu-dominio.com";

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
  isOverdue?: boolean;
}

interface Profile {
  id: string;
  full_name: string | null;
  organization_id: string | null;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getDaysOverdue = (dateStr: string): number => {
  const dueDate = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffTime = today.getTime() - dueDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const handler = async (req: Request): Promise<Response> => {
  console.log("[Deadline Notifications] Starting...");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let daysAhead = 3;
    let includeOverdue = true;
    let testMode = false;
    let testEmail = "";
    
    try {
      const body = await req.json();
      daysAhead = body.daysAhead ?? 3;
      includeOverdue = body.includeOverdue ?? true;
      testMode = body.testMode ?? false;
      testEmail = body.testEmail ?? "";
    } catch {
      // No body, use defaults
    }

    console.log(`[Deadline Notifications] Looking for plans due in ${daysAhead} days, includeOverdue: ${includeOverdue}`);

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysAhead);
    const targetDateStr = targetDate.toISOString().split("T")[0];

    console.log(`[Deadline Notifications] Today: ${todayStr}, Target date: ${targetDateStr}`);

    // Get action plans due on target date
    const { data: upcomingPlans, error: upcomingError } = await supabase
      .from("action_plans")
      .select("id, title, description, due_date, priority, status, assigned_to, organization_id")
      .eq("due_date", targetDateStr)
      .neq("status", "done")
      .returns<ActionPlan[]>();

    if (upcomingError) {
      console.error("[Deadline Notifications] Error fetching upcoming plans:", upcomingError);
      throw upcomingError;
    }

    // Get overdue plans if enabled
    let overduePlans: ActionPlan[] = [];
    if (includeOverdue) {
      const { data: overdueData, error: overdueError } = await supabase
        .from("action_plans")
        .select("id, title, description, due_date, priority, status, assigned_to, organization_id")
        .lt("due_date", todayStr)
        .neq("status", "done")
        .returns<ActionPlan[]>();

      if (overdueError) {
        console.error("[Deadline Notifications] Error fetching overdue plans:", overdueError);
      } else {
        overduePlans = (overdueData || []).map(p => ({ ...p, isOverdue: true }));
      }
    }

    const allPlans = [...overduePlans, ...(upcomingPlans || [])];
    
    console.log(`[Deadline Notifications] Found ${upcomingPlans?.length || 0} upcoming plans, ${overduePlans.length} overdue plans`);

    if (allPlans.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No plans found",
          emailsSent: 0 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Group plans by assigned user
    const plansByUser = new Map<string, ActionPlan[]>();

    for (const plan of allPlans) {
      if (plan.assigned_to) {
        if (!plansByUser.has(plan.assigned_to)) {
          plansByUser.set(plan.assigned_to, []);
        }
        plansByUser.get(plan.assigned_to)!.push(plan);
      }
    }

    const userIds = Array.from(plansByUser.keys());
    const emailsSent: string[] = [];
    const errors: string[] = [];

    if (userIds.length > 0) {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("[Deadline Notifications] Error fetching auth users:", authError);
        throw authError;
      }

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

      for (const [userId, userPlans] of plansByUser) {
        const userEmail = testMode ? testEmail : userEmailMap.get(userId);
        const profile = profileMap.get(userId);
        const userName = profile?.full_name || "Usuário";

        if (!userEmail) {
          console.log(`[Deadline Notifications] No email found for user ${userId}`);
          continue;
        }

        const userOverduePlans = userPlans.filter(p => p.isOverdue);
        const userUpcomingPlans = userPlans.filter(p => !p.isOverdue);

        console.log(`[Deadline Notifications] Sending email to ${userEmail} with ${userOverduePlans.length} overdue, ${userUpcomingPlans.length} upcoming`);

        const renderPlanRow = (plan: ActionPlan) => {
          const isOverdue = plan.isOverdue;
          const daysOver = isOverdue ? getDaysOverdue(plan.due_date) : 0;
          const rowBg = isOverdue ? "background: #fef2f2;" : "";
          const priorityBg = plan.priority === "critica" ? "#fee2e2" : plan.priority === "alta" ? "#ffedd5" : "#fef9c3";
          const priorityColor = plan.priority === "critica" ? "#991b1b" : plan.priority === "alta" ? "#9a3412" : "#854d0e";
          
          return `
            <tr style="${rowBg}">
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                <strong>${plan.title}</strong>
                ${plan.description ? `<br><span style="color: #64748b; font-size: 13px;">${plan.description.substring(0, 80)}${plan.description.length > 80 ? "..." : ""}</span>` : ""}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                ${isOverdue 
                  ? `<span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #dc2626; color: white;">🚨 ${daysOver} dia(s) atrás</span>`
                  : `<span style="color: #475569; font-size: 13px;">${formatDate(plan.due_date)}</span>`
                }
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background: ${priorityBg}; color: ${priorityColor};">
                  ${PRIORITY_LABELS[plan.priority] || plan.priority}
                </span>
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px;">
                ${STATUS_LABELS[plan.status] || plan.status}
              </td>
            </tr>
          `;
        };

        const overdueSection = userOverduePlans.length > 0 ? `
          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #dc2626; border-radius: 0 12px 12px 0; padding: 16px; margin-bottom: 24px;">
            <p style="color: #991b1b; margin: 0; font-size: 15px; font-weight: 600;">
              🚨 <strong>${userOverduePlans.length}</strong> plano(s) com prazo VENCIDO que precisam de atenção imediata!
            </p>
          </div>
        ` : "";

        const upcomingSection = userUpcomingPlans.length > 0 ? `
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
            <p style="color: #92400e; margin: 0; font-size: 15px;">
              ⏰ <strong>${userUpcomingPlans.length}</strong> plano(s) com prazo para <strong>${daysAhead === 0 ? "hoje" : daysAhead === 1 ? "amanhã" : `${daysAhead} dias`}</strong>.
            </p>
          </div>
        ` : "";

        const allPlansRows = [...userOverduePlans, ...userUpcomingPlans].map(renderPlanRow).join("");

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 750px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0f172a; margin-bottom: 10px;">🛡️ CosmoSec GRC</h1>
                <p style="color: #64748b; font-size: 14px;">Lembrete de Prazos</p>
              </div>
              
              <p style="color: #1e293b; font-size: 16px; margin-bottom: 20px;">
                Olá, <strong>${userName}</strong>!
              </p>
              
              ${overdueSection}
              ${upcomingSection}
              
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
                <thead>
                  <tr style="background: #1e293b; color: white;">
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Plano de Ação</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; width: 130px;">Prazo</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; width: 90px;">Prioridade</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; width: 100px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${allPlansRows}
                </tbody>
              </table>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://cosmosec.com.br/plano-acao" 
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

        const subjectParts: string[] = [];
        if (userOverduePlans.length > 0) {
          subjectParts.push(`🚨 ${userOverduePlans.length} vencido(s)`);
        }
        if (userUpcomingPlans.length > 0) {
          subjectParts.push(`⏰ ${userUpcomingPlans.length} próximo(s)`);
        }

        try {
          const emailResponse = await resend.emails.send({
            from: "CosmoSec <noreply@cosmosec.com.br>",
            to: [userEmail],
            subject: `Planos de Ação: ${subjectParts.join(" | ")}`,
            html: emailHtml,
          });

          console.log(`[Deadline Notifications] Email sent to ${userEmail}:`, emailResponse);
          emailsSent.push(userEmail);

          if (testMode) break;
        } catch (emailError: any) {
          console.error(`[Deadline Notifications] Error sending email to ${userEmail}:`, emailError);
          errors.push(`${userEmail}: ${emailError.message}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        upcomingPlans: upcomingPlans?.length || 0,
        overduePlans: overduePlans.length,
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
