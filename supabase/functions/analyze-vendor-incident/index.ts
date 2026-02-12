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

    const { title, description, impact_description, severity, category, vendor_name, vendor_category } = await req.json();

    if (!title) return errorResponse("Título do incidente é obrigatório", 400);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return errorResponse("Configuração de API incompleta", 500);

    const prompt = `Você é um especialista em gestão de incidentes de segurança da informação, com conhecimento em ITIL e ISO 27001.

Analise o seguinte incidente de fornecedor e sugira a causa raiz provável e ações corretivas:

**Fornecedor:** ${vendor_name || "Não informado"} (Categoria: ${vendor_category || "Não informada"})
**Incidente:** ${title}
**Severidade:** ${severity}
**Categoria:** ${category}
**Descrição:** ${description || "Não informada"}
**Impacto:** ${impact_description || "Não informado"}

Com base no contexto ITIL/ISO 27001, forneça:
1. A causa raiz mais provável
2. De 3 a 5 ações corretivas específicas e mensuráveis
3. A classificação ITIL do incidente`;

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
              name: "analyze_incident",
              description: "Retorna análise de causa raiz e ações corretivas do incidente",
              parameters: {
                type: "object",
                properties: {
                  root_cause: { type: "string", description: "Causa raiz provável do incidente" },
                  corrective_actions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 3-5 ações corretivas sugeridas",
                  },
                  itil_classification: { type: "string", description: "Classificação ITIL do incidente" },
                  risk_assessment: { type: "string", description: "Avaliação breve do risco residual" },
                },
                required: ["root_cause", "corrective_actions", "itil_classification"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_incident" } },
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
      return errorResponse("Erro ao analisar incidente com IA", 500);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return errorResponse("Resposta da IA não contém análise válida", 500);
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    return jsonResponse(analysis);
  } catch (error) {
    console.error("Error in analyze-vendor-incident:", error);
    return errorResponse(error instanceof Error ? error.message : "Erro desconhecido", 500);
  }
});
