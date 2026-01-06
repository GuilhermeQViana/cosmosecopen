import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  authenticate, 
  handleCors, 
  isAuthError, 
  errorResponse, 
  jsonResponse 
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
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Authenticate user
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { controlCode, controlName, controlDescription, currentMaturity, targetMaturity, framework } = await req.json() as GenerateActionPlanRequest;

    console.log('Generating action plan for:', { controlCode, controlName, currentMaturity, targetMaturity });

    const gap = targetMaturity - currentMaturity;

    const prompt = `Você é um especialista em segurança da informação e GRC (Governança, Risco e Conformidade).

Dado o seguinte controle de segurança:
- Framework: ${framework}
- Código: ${controlCode}
- Nome: ${controlName}
- Descrição: ${controlDescription || 'Não informada'}
- Nível de Maturidade Atual: ${currentMaturity} (escala 0-5)
- Nível de Maturidade Alvo: ${targetMaturity} (escala 0-5)
- Gap: ${gap} níveis

Gere um plano de ação estruturado para alcançar o nível de maturidade alvo. O plano deve incluir:
1. Um título claro e objetivo para a ação principal
2. Uma descrição detalhada do que precisa ser feito
3. Uma prioridade sugerida (critica, alta, media, baixa) baseada no gap
4. 3 a 5 subtarefas específicas e mensuráveis

Responda APENAS em formato JSON válido, sem texto adicional:
{
  "title": "string",
  "description": "string", 
  "priority": "critica" | "alta" | "media" | "baixa",
  "subtasks": ["string", "string", "string"]
}`;

    const response = await fetch('https://api.lovable.dev/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Response:', JSON.stringify(aiResponse));

    const content = aiResponse.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let actionPlan;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        actionPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback to default plan
      actionPlan = {
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
      };
    }

    return jsonResponse(actionPlan);
  } catch (error) {
    console.error('Error generating action plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(errorMessage, 500);
  }
});
