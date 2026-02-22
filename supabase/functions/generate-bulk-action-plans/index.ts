import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, handleCors, isAuthError, errorResponse, jsonResponse, getAIConfig } from "../_shared/auth.ts";

interface ControlInput {
  controlId: string;
  assessmentId: string;
  controlCode: string;
  controlName: string;
  controlDescription: string | null;
  currentMaturity: number;
  targetMaturity: number;
}

interface GenerateBulkRequest {
  controls: ControlInput[];
  framework: string;
}

interface GeneratedPlan {
  controlId: string;
  assessmentId: string;
  plan: {
    title: string;
    description: string;
    priority: 'critica' | 'alta' | 'media' | 'baixa';
    subtasks: string[];
  };
}

interface FailedControl {
  controlId: string;
  controlCode: string;
  error: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const PARALLEL_LIMIT = 3;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generatePlanForControl(
  control: ControlInput,
  framework: string,
  aiConfig: { baseUrl: string; apiKey: string }
): Promise<{ success: boolean; plan?: GeneratedPlan['plan']; error?: string }> {
  const gap = control.targetMaturity - control.currentMaturity;

  const prompt = `Você é um especialista em segurança da informação e GRC.

Dado o seguinte controle de segurança:
- Framework: ${framework}
- Código: ${control.controlCode}
- Nome: ${control.controlName}
- Descrição: ${control.controlDescription || 'Não informada'}
- Nível de Maturidade Atual: ${control.currentMaturity} (escala 0-5)
- Nível de Maturidade Alvo: ${control.targetMaturity} (escala 0-5)
- Gap: ${gap} níveis

Gere um plano de ação estruturado. Responda APENAS em formato JSON válido:
{
  "title": "string",
  "description": "string", 
  "priority": "critica" | "alta" | "media" | "baixa",
  "subtasks": ["string", "string", "string"]
}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(aiConfig.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiConfig.apiKey}` },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.status === 429) { await sleep(RETRY_DELAY_MS * 2); continue; }
      if (response.status === 402) return { success: false, error: 'Créditos insuficientes para geração de planos com IA' };
      if (!response.ok) { if (attempt < MAX_RETRIES) { await sleep(RETRY_DELAY_MS); continue; } return { success: false, error: `Erro da API: ${response.status}` }; }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) { if (attempt < MAX_RETRIES) { await sleep(RETRY_DELAY_MS); continue; } return { success: false, error: 'Resposta da IA não contém JSON válido' }; }

      const plan = JSON.parse(jsonMatch[0]);
      if (!plan.title || !plan.description || !plan.priority || !Array.isArray(plan.subtasks)) {
        if (attempt < MAX_RETRIES) { await sleep(RETRY_DELAY_MS); continue; }
        return { success: false, error: 'Estrutura do plano inválida' };
      }

      return { success: true, plan };
    } catch (error) {
      if (attempt < MAX_RETRIES) { await sleep(RETRY_DELAY_MS); continue; }
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }
  return { success: false, error: 'Falha após todas as tentativas' };
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { controls, framework } = await req.json() as GenerateBulkRequest;
    if (!controls || !Array.isArray(controls) || controls.length === 0) return errorResponse('Nenhum controle fornecido', 400);

    const aiConfig = getAIConfig();
    if (!aiConfig) return errorResponse('IA não configurada. Defina AI_API_KEY e AI_BASE_URL nas variáveis de ambiente.', 503);

    console.log(`Starting bulk generation for ${controls.length} controls (framework: ${framework})`);

    const success: GeneratedPlan[] = [];
    const failed: FailedControl[] = [];

    for (let i = 0; i < controls.length; i += PARALLEL_LIMIT) {
      const batch = controls.slice(i, i + PARALLEL_LIMIT);
      const results = await Promise.all(
        batch.map(async (control) => {
          const result = await generatePlanForControl(control, framework, aiConfig);
          return { control, result };
        })
      );

      for (const { control, result } of results) {
        if (result.success && result.plan) {
          success.push({ controlId: control.controlId, assessmentId: control.assessmentId, plan: result.plan });
        } else {
          failed.push({ controlId: control.controlId, controlCode: control.controlCode, error: result.error || 'Erro desconhecido' });
        }
      }

      if (i + PARALLEL_LIMIT < controls.length) await sleep(500);
    }

    console.log(`Bulk generation complete: ${success.length} success, ${failed.length} failed`);
    return jsonResponse({ success, failed });
  } catch (error) {
    console.error('Error in generate-bulk-action-plans:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});
