import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  authenticate, 
  handleCors, 
  isAuthError, 
  errorResponse, 
  jsonResponse,
  getAIConfig
} from "../_shared/auth.ts";

interface GenerateActionPlanRequest {
  controlCode: string;
  controlName: string;
  controlDescription: string;
  currentMaturity: number;
  targetMaturity: number;
  framework: string;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { controlCode, controlName, controlDescription, currentMaturity, targetMaturity, framework } = await req.json() as GenerateActionPlanRequest;

    console.log('Generating action plan for:', { controlCode, controlName, currentMaturity, targetMaturity });

    const gap = targetMaturity - currentMaturity;

    const aiConfig = getAIConfig();
    if (!aiConfig) {
      // Fallback sem IA
      return jsonResponse({
        title: `Implementar ${controlCode}: ${controlName}`,
        description: `Elevar o nível de maturidade do controle ${controlCode} de ${currentMaturity} para ${targetMaturity}.`,
        priority: gap >= 3 ? 'critica' : gap >= 2 ? 'alta' : 'media',
        subtasks: [
          'Realizar diagnóstico detalhado do controle atual',
          'Definir procedimentos e políticas necessárias',
          'Implementar controles técnicos requeridos',
          'Treinar equipe responsável',
          'Documentar evidências de implementação',
        ],
      });
    }

    const prompt = `Você é um especialista em segurança da informação e GRC (Governança, Risco e Conformidade).

Dado o seguinte controle de segurança:
- Framework: ${framework}
- Código: ${controlCode}
- Nome: ${controlName}
- Descrição: ${controlDescription || 'Não informada'}
- Nível de Maturidade Atual: ${currentMaturity} (escala 0-5)
- Nível de Maturidade Alvo: ${targetMaturity} (escala 0-5)
- Gap: ${gap} níveis

Gere um plano de ação estruturado para alcançar o nível de maturidade alvo.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_action_plan",
          description: "Gera um plano de ação estruturado para alcançar o nível de maturidade alvo",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Título claro e objetivo para a ação principal" },
              description: { type: "string", description: "Descrição detalhada do que precisa ser feito" },
              priority: { type: "string", enum: ["critica", "alta", "media", "baixa"], description: "Prioridade baseada no gap" },
              subtasks: { type: "array", items: { type: "string" }, description: "3 a 5 subtarefas específicas e mensuráveis" },
            },
            required: ["title", "description", "priority", "subtasks"],
          },
        },
      },
    ];

    const response = await fetch(aiConfig.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
        tools,
        tool_choice: { type: "function", function: { name: "generate_action_plan" } },
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI error:', errorText);
      
      if (response.status === 429 || response.status === 402) {
        return errorResponse('Limite de requisições atingido. Tente novamente em alguns minutos.', 429);
      }
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      try {
        const actionPlan = JSON.parse(toolCall.function.arguments);
        return jsonResponse(actionPlan);
      } catch (e) {
        console.error('Failed to parse tool call arguments:', e);
      }
    }

    // Fallback
    return jsonResponse({
      title: `Implementar ${controlCode}: ${controlName}`,
      description: `Elevar o nível de maturidade do controle ${controlCode} de ${currentMaturity} para ${targetMaturity}.`,
      priority: gap >= 3 ? 'critica' : gap >= 2 ? 'alta' : 'media',
      subtasks: [
        'Realizar diagnóstico detalhado do controle atual',
        'Definir procedimentos e políticas necessárias',
        'Implementar controles técnicos requeridos',
        'Treinar equipe responsável',
        'Documentar evidências de implementação',
      ],
    });
  } catch (error) {
    console.error('Error generating action plan:', error);
    return errorResponse('Erro ao gerar plano de ação. Tente novamente mais tarde.', 500);
  }
});
