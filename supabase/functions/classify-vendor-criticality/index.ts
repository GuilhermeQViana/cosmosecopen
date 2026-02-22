import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, handleCors, isAuthError, errorResponse, jsonResponse, getAIConfig } from "../_shared/auth.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { name, description, category, service_type, data_classification } = await req.json();
    if (!name) return errorResponse("Nome do fornecedor é obrigatório", 400);

    const aiConfig = getAIConfig();
    if (!aiConfig) return errorResponse("IA não configurada. Defina AI_API_KEY e AI_BASE_URL nas variáveis de ambiente.", 503);

    const prompt = `Você é um especialista em gestão de riscos de terceiros e segurança da informação.

Com base nas informações do fornecedor abaixo, classifique sua criticidade:

**Nome:** ${name}
**Descrição:** ${description || "Não informada"}
**Categoria:** ${category || "Não informada"}
**Tipo de Serviço:** ${service_type || "Não informado"}
**Classificação de Dados:** ${data_classification || "Não informada"}

Considere: tipo de dados acessados, criticidade do serviço para o negócio, impacto de indisponibilidade, exposição regulatória (LGPD, etc.).

Classifique em: baixa, media, alta ou critica. Forneça justificativa concisa.`;

    const response = await fetch(aiConfig.baseUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${aiConfig.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "classify_criticality",
            description: "Classifica a criticidade do fornecedor",
            parameters: {
              type: "object",
              properties: {
                criticality: { type: "string", enum: ["baixa", "media", "alta", "critica"] },
                justification: { type: "string" },
              },
              required: ["criticality", "justification"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_criticality" } },
      }),
    });

    if (response.status === 429) return errorResponse("Limite de requisições excedido.", 429);
    if (response.status === 402) return errorResponse("Créditos de IA insuficientes.", 402);
    if (!response.ok) { console.error("AI error:", response.status); return errorResponse("Erro ao classificar criticidade com IA", 500); }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) return errorResponse("Resposta da IA não contém classificação válida", 500);

    return jsonResponse(JSON.parse(toolCall.function.arguments));
  } catch (error) {
    console.error("Error in classify-vendor-criticality:", error);
    return errorResponse(error instanceof Error ? error.message : "Erro desconhecido", 500);
  }
});
