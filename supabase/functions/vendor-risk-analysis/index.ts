import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  authenticate,
  handleCors,
  isAuthError,
  errorResponse,
  jsonResponse,
} from "../_shared/auth.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { vendor_name, vendor_criticality, vendor_category, assessment_score, assessment_risk_level, open_incidents, incident_severities, sla_compliance_rate, contract_end_date, due_diligence_status, due_diligence_risk_score } = await req.json();

    if (!vendor_name) return errorResponse("Nome do fornecedor é obrigatório", 400);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return errorResponse("Configuração de API incompleta", 500);

    const prompt = `Você é um especialista em gestão de riscos de terceiros (TPRM).

Analise os dados consolidados do seguinte fornecedor e forneça uma análise holística de risco:

**Fornecedor:** ${vendor_name} (Criticidade: ${vendor_criticality || "N/A"}, Categoria: ${vendor_category || "N/A"})

**Última Avaliação:** Score ${assessment_score ?? "N/A"}%, Risco ${assessment_risk_level || "N/A"}
**Incidentes Abertos:** ${open_incidents ?? 0} (Severidades: ${incident_severities || "Nenhum"})
**Conformidade SLA:** ${sla_compliance_rate !== null && sla_compliance_rate !== undefined ? sla_compliance_rate + "%" : "Não monitorado"}
**Fim do Contrato:** ${contract_end_date || "Não definido"}
**Due Diligence:** Status ${due_diligence_status || "Não realizada"}, Score ${due_diligence_risk_score ?? "N/A"}%

Forneça uma análise consolidada com score de risco holístico, tendência, principais preocupações e recomendação.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_vendor_risk",
              description: "Análise holística de risco do fornecedor",
              parameters: {
                type: "object",
                properties: {
                  risk_score: { type: "number", description: "Score de risco holístico de 0 a 100 (0=sem risco, 100=risco máximo)" },
                  trend: { type: "string", enum: ["melhorando", "estavel", "piorando"], description: "Tendência do risco" },
                  top_concerns: { type: "array", items: { type: "string" }, description: "Top 3 preocupações" },
                  recommendation: { type: "string", description: "Recomendação principal" },
                  summary: { type: "string", description: "Resumo executivo da análise em 2-3 frases" },
                },
                required: ["risk_score", "trend", "top_concerns", "recommendation", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_vendor_risk" } },
      }),
    });

    if (response.status === 429) {
      return errorResponse("Limite de requisições excedido. Tente novamente em alguns instantes.", 429);
    }
    if (response.status === 402) {
      return errorResponse("Créditos de IA insuficientes. Adicione créditos ao workspace.", 402);
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return errorResponse("Erro ao analisar risco com IA", 500);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return errorResponse("Resposta da IA não contém análise válida", 500);
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    return jsonResponse(analysis);
  } catch (error) {
    console.error("Error in vendor-risk-analysis:", error);
    return errorResponse(error instanceof Error ? error.message : "Erro desconhecido", 500);
  }
});
