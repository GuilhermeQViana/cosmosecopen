import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  authenticate, 
  handleCors, 
  isAuthError, 
  errorResponse, 
  jsonResponse,
  getUserOrganization,
  corsHeaders
} from "../_shared/auth.ts";

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Authenticate user
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    
    const { user, supabase } = auth;

    // Get user's organization
    const organizationId = await getUserOrganization(supabase, user.id);
    if (!organizationId) {
      return errorResponse("No organization found", 400);
    }

    // Get request body
    const { format = "json" } = await req.json();

    // Get client IP for logging
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("x-real-ip") 
      || "unknown";

    console.log(`Exporting data for organization ${organizationId} in format ${format}`);

    // Fetch all data for the organization
    const [
      { data: controls },
      { data: assessments },
      { data: risks },
      { data: evidences },
      { data: actionPlans },
      { data: organization }
    ] = await Promise.all([
      supabase.from("controls").select("*"),
      supabase.from("assessments").select("*").eq("organization_id", organizationId),
      supabase.from("risks").select("*").eq("organization_id", organizationId),
      supabase.from("evidences").select("id, name, description, classification, tags, file_type, file_size, created_at").eq("organization_id", organizationId),
      supabase.from("action_plans").select("*").eq("organization_id", organizationId),
      supabase.from("organizations").select("*").eq("id", organizationId).single()
    ]);

    // Log the export event
    await supabase.from("access_logs").insert({
      user_id: user.id,
      organization_id: organizationId,
      action: "export",
      entity_type: "backup",
      details: {
        format,
        recordCount: {
          assessments: assessments?.length || 0,
          risks: risks?.length || 0,
          evidences: evidences?.length || 0,
          actionPlans: actionPlans?.length || 0,
        },
        timestamp: new Date().toISOString(),
      },
      ip_address: clientIP,
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      organization: {
        id: organization?.id,
        name: organization?.name,
        description: organization?.description,
      },
      statistics: {
        totalControls: controls?.length || 0,
        totalAssessments: assessments?.length || 0,
        totalRisks: risks?.length || 0,
        totalEvidences: evidences?.length || 0,
        totalActionPlans: actionPlans?.length || 0,
      },
      data: {
        assessments: assessments || [],
        risks: risks || [],
        evidences: evidences || [],
        actionPlans: actionPlans || [],
      }
    };

    if (format === "csv") {
      // Generate CSV for each data type
      const csvSections: string[] = [];
      
      // Risks CSV
      if (risks && risks.length > 0) {
        const riskHeaders = ["code", "title", "description", "category", "treatment", "inherent_probability", "inherent_impact", "residual_probability", "residual_impact", "created_at"];
        const riskRows = risks.map(r => riskHeaders.map(h => `"${(r as Record<string, unknown>)[h] || ''}"`).join(","));
        csvSections.push(`=== RISCOS ===\n${riskHeaders.join(",")}\n${riskRows.join("\n")}`);
      }

      // Action Plans CSV
      if (actionPlans && actionPlans.length > 0) {
        const planHeaders = ["title", "description", "status", "priority", "due_date", "created_at"];
        const planRows = actionPlans.map(p => planHeaders.map(h => `"${(p as Record<string, unknown>)[h] || ''}"`).join(","));
        csvSections.push(`=== PLANOS DE AÇÃO ===\n${planHeaders.join(",")}\n${planRows.join("\n")}`);
      }

      // Evidences CSV
      if (evidences && evidences.length > 0) {
        const evHeaders = ["name", "description", "classification", "file_type", "file_size", "created_at"];
        const evRows = evidences.map(e => evHeaders.map(h => `"${(e as Record<string, unknown>)[h] || ''}"`).join(","));
        csvSections.push(`=== EVIDÊNCIAS ===\n${evHeaders.join(",")}\n${evRows.join("\n")}`);
      }

      const csvContent = `Backup Cora GovSec - ${organization?.name || 'Organização'}\nExportado em: ${new Date().toISOString()}\n\n${csvSections.join("\n\n")}`;

      return new Response(csvContent, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="backup-${Date.now()}.csv"`,
        },
      });
    }

    // Default: JSON format
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="backup-${Date.now()}.json"`,
      },
    });

  } catch (error) {
    console.error("Error exporting data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});
