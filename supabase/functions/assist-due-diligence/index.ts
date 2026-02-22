import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, handleCors, isAuthError, errorResponse, jsonResponse, getAIConfig } from "../_shared/auth.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { item_name, item_category, item_description, vendor_name, vendor_category } = await req.json();
    if (!item_name) return errorResponse("Nome do item é obrigatório", 400);

    const aiConfig = getAIConfig();
    if (!aiConfig) return errorResponse("IA não configurada. Defina AI_API_KEY e AI_BASE_URL nas variáveis de ambiente.", 503);

    const prompt = `Você é um especialista em due diligence de fornecedores com foco em segurança da informação e conformidade.

Para o seguinte item do checklist de due diligence:

**Fornecedor:** ${vendor_name || "Não informado"} (${vendor_category || "Categoria não informada"})
**Item:** ${item_name}
**Categoria:** ${item_category}
**Descrição:** ${item_description || "Não informada"}

Forneça:
1. 3 perguntas investigativas específicas para este item, adaptadas ao tipo de fornecedor
2. Possíveis red flags (sinais de alerta) a observar
3. Critérios objetivos de aprovação sugeridos`;

    const response = await fetch(aiConfig.baseUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${aiConfig.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "assist_due_diligence",
            description: "Retorna perguntas investigativas, red flags e critérios de aprovação",
            parameters: {
              type: "object",
              properties: {
                questions: { type: "array", items: { type: "string" } },
                red_flags: { type: "array", items: { type: "string" } },
                approval_criteria: { type: "array", items: { type: "string" } },
              },
              required: ["questions", "red_flags", "approval_criteria"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "assist_due_diligence" } },
      }),
    });

    if (response.status === 429) return errorResponse("Limite de requisições excedido.", 429);
    if (response.status === 402) return errorResponse("Créditos de IA insuficientes.", 402);
    if (!response.ok) { console.error("AI error:", response.status); return errorResponse("Erro ao gerar assistência de due diligence", 500); }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) return errorResponse("Resposta da IA não contém assistência válida", 500);

    return jsonResponse(JSON.parse(toolCall.function.arguments));
  } catch (error) {
    console.error("Error in assist-due-diligence:", error);
    return errorResponse(error instanceof Error ? error.message : "Erro desconhecido", 500);
  }
});
