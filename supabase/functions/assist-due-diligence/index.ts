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

    const { item_name, item_category, item_description, vendor_name, vendor_category } = await req.json();

    if (!item_name) return errorResponse("Nome do item é obrigatório", 400);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return errorResponse("Configuração de API incompleta", 500);

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
              name: "assist_due_diligence",
              description: "Retorna perguntas investigativas, red flags e critérios de aprovação",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: { type: "string" },
                    description: "3 perguntas investigativas específicas",
                  },
                  red_flags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Possíveis red flags a observar",
                  },
                  approval_criteria: {
                    type: "array",
                    items: { type: "string" },
                    description: "Critérios objetivos de aprovação",
                  },
                },
                required: ["questions", "red_flags", "approval_criteria"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "assist_due_diligence" } },
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
      return errorResponse("Erro ao gerar assistência de due diligence", 500);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return errorResponse("Resposta da IA não contém assistência válida", 500);
    }

    const result = JSON.parse(toolCall.function.arguments);
    return jsonResponse(result);
  } catch (error) {
    console.error("Error in assist-due-diligence:", error);
    return errorResponse(error instanceof Error ? error.message : "Erro desconhecido", 500);
  }
});
