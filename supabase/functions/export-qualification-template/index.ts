import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { handleCors, errorResponse, getCorsHeaders } from "../_shared/auth.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { campaignId } = await req.json();
    if (!campaignId) return errorResponse("campaignId is required", 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get campaign with template info
    const { data: campaign, error: cErr } = await supabase
      .from("qualification_campaigns")
      .select("*, qualification_templates(name, version), vendors(name, code)")
      .eq("id", campaignId)
      .single();
    if (cErr || !campaign) return errorResponse("Campaign not found", 404);

    // Get questions
    const { data: questions, error: qErr } = await supabase
      .from("qualification_questions")
      .select("*")
      .eq("template_id", campaign.template_id)
      .order("order_index", { ascending: true });
    if (qErr) return errorResponse(qErr.message, 500);

    // Build CSV content for offline filling
    const headers = ["#", "Pergunta", "Tipo", "Obrigatória", "Peso", "Opções", "Resposta"];
    const rows = (questions || []).map((q: any, idx: number) => {
      const typeMap: Record<string, string> = {
        text: "Texto",
        multiple_choice: "Múltipla Escolha",
        upload: "Anexo (nome do arquivo)",
        date: "Data (DD/MM/AAAA)",
        currency: "Valor monetário",
        number: "Número",
      };
      const options = q.type === "multiple_choice" && Array.isArray(q.options)
        ? q.options.map((o: any) => o.label || o.value).join(" | ")
        : "";
      return [
        idx + 1,
        `"${(q.label || "").replace(/"/g, '""')}"`,
        typeMap[q.type] || q.type,
        q.is_required ? "Sim" : "Não",
        q.weight,
        `"${options}"`,
        "", // Empty column for the vendor to fill
      ].join(",");
    });

    const vendorName = campaign.vendors?.name || "fornecedor";
    const templateName = campaign.qualification_templates?.name || "template";
    const metadata = [
      `# Questionário de Qualificação - ${templateName}`,
      `# Fornecedor: ${vendorName}`,
      `# Campaign ID: ${campaignId}`,
      `# Exportado em: ${new Date().toISOString()}`,
      `# Instruções: Preencha a coluna "Resposta" e reimporte o arquivo.`,
      `# Para múltipla escolha, use exatamente um dos valores da coluna "Opções".`,
      "",
    ];

    const csv = [...metadata, headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="qualificacao-${vendorName.replace(/\s+/g, "_")}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting template:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error", 500);
  }
});
