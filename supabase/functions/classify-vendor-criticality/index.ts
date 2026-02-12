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

    const { name, description, category, service_type, data_classification } = await req.json();

    if (!name) return errorResponse("Nome do fornecedor é obrigatório", 400);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return errorResponse("Configuração de API incompleta", 500);

    const prompt = `Você é um especialista em gestão de riscos de terceiros e segurança da informação.

Com base nas informações do fornecedor abaixo, classifique sua criticidade:

**Nome:** ${name}
**Descrição:** ${description || "Não informada"}
**Categoria:** ${category || "Não informada"}
**Tipo de Serviço:** ${service_type || "Não informado"}
**Classificação de Dados:** ${data_classification || "Não informada"}

Considere: tipo de dados acessados, criticidade do serviço para o negócio, impacto de indisponibilidade, exposição regulatória (LGPD, etc.).

Classifique em: baixa, media, alta ou critica. Forneça justificativa concisa.`;

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
              name: "classify_criticality",
              description: "Classifica a criticidade do fornecedor",
              parameters: {
                type: "object",
                properties: {
                  criticality: {
                    type: "string",
                    enum: ["baixa", "media", "alta", "critica"],
                    description: "Nível de criticidade sugerido",
                  },
                  justification: { type: "string", description: "Justificativa para a classificação" },
                },
                required: ["criticality", "justification"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_criticality" } },
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
      return errorResponse("Erro ao classificar criticidade com IA", 500);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return errorResponse("Resposta da IA não contém classificação válida", 500);
    }

    const result = JSON.parse(toolCall.function.arguments);
    return jsonResponse(result);
  } catch (error) {
    console.error("Error in classify-vendor-criticality:", error);
    return errorResponse(error instanceof Error ? error.message : "Erro desconhecido", 500);
  }
});
