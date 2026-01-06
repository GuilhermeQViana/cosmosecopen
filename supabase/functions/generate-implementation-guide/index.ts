import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  authenticate, 
  handleCors, 
  isAuthError, 
  errorResponse, 
  jsonResponse 
} from "../_shared/auth.ts";

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Authenticate user
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return errorResponse("LOVABLE_API_KEY is not configured", 500);
    }

    const { controlCode, controlName, controlDescription, currentMaturity, targetMaturity, weight } = await req.json();

    console.log(`[Implementation Guide] Generating for ${controlCode}: ${controlName}`);
    console.log(`[Implementation Guide] Current: ${currentMaturity}, Target: ${targetMaturity}, Weight: ${weight}`);

    const prompt = `Você é um especialista em segurança da informação e compliance. Gere um guia de implementação prático e detalhado para o seguinte controle de segurança:

**Controle:** ${controlCode} - ${controlName}
**Descrição:** ${controlDescription || "Não fornecida"}
**Maturidade Atual:** Nível ${currentMaturity}
**Maturidade Alvo:** Nível ${targetMaturity}
**Peso/Criticidade:** ${weight} (1=baixo, 2=médio, 3=alto)

O objetivo é elevar a maturidade do nível ${currentMaturity} para o nível ${targetMaturity}.

Níveis de maturidade:
0 - Inexistente: Não há processo
1 - Inicial: Processo ad-hoc
2 - Repetível: Processo básico estabelecido
3 - Definido: Processo documentado e padronizado
4 - Gerenciado: Processo medido e controlado
5 - Otimizado: Melhoria contínua implementada

Gere um guia estruturado com:
1. Resumo executivo (2-3 frases)
2. Passos de implementação ordenados (3-6 passos)
3. Checklist de verificação (5-8 itens)
4. Recursos recomendados (documentos, ferramentas, frameworks)
5. Dicas práticas (2-3 dicas)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em GRC (Governança, Risco e Compliance) que ajuda organizações a implementar controles de segurança. Responda sempre em português brasileiro.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_implementation_guide",
              description: "Gera um guia de implementação estruturado para um controle de segurança",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "Resumo executivo do que precisa ser feito (2-3 frases)",
                  },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        order: { type: "number" },
                        title: { type: "string" },
                        description: { type: "string" },
                        effort: { type: "string", enum: ["baixo", "medio", "alto"] },
                      },
                      required: ["order", "title", "description", "effort"],
                    },
                  },
                  checklist: {
                    type: "array",
                    items: { type: "string" },
                  },
                  resources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        type: { type: "string" },
                        description: { type: "string" },
                      },
                      required: ["title", "type", "description"],
                    },
                  },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["summary", "steps", "checklist", "resources", "tips"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_implementation_guide" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Implementation Guide] AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return errorResponse("Limite de requisições excedido. Tente novamente em alguns segundos.", 429);
      }
      if (response.status === 402) {
        return errorResponse("Créditos de IA insuficientes. Adicione créditos ao workspace.", 402);
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[Implementation Guide] Response received");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("Invalid AI response format");
    }

    const guide = JSON.parse(toolCall.function.arguments);
    console.log("[Implementation Guide] Guide generated successfully");

    return jsonResponse({ guide });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro ao gerar guia";
    console.error("[Implementation Guide] Error:", errorMessage);
    return errorResponse(errorMessage, 500);
  }
});
