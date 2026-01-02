import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  apiKey: string
): Promise<{ success: boolean; plan?: GeneratedPlan['plan']; error?: string }> {
  const gap = control.targetMaturity - control.currentMaturity;

  const prompt = `Você é um especialista em segurança da informação e GRC (Governança, Risco e Conformidade).

Dado o seguinte controle de segurança:
- Framework: ${framework}
- Código: ${control.controlCode}
- Nome: ${control.controlName}
- Descrição: ${control.controlDescription || 'Não informada'}
- Nível de Maturidade Atual: ${control.currentMaturity} (escala 0-5)
- Nível de Maturidade Alvo: ${control.targetMaturity} (escala 0-5)
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

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${MAX_RETRIES} for control ${control.controlCode}`);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (response.status === 429) {
        console.log(`Rate limit hit for ${control.controlCode}, waiting before retry...`);
        await sleep(RETRY_DELAY_MS * 2);
        continue;
      }

      if (response.status === 402) {
        console.error('Payment required - no credits available');
        return { success: false, error: 'Créditos insuficientes para geração de planos com IA' };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI error (${response.status}):`, errorText);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        return { success: false, error: `Erro da API: ${response.status}` };
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content || '';

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error(`No JSON found in response for ${control.controlCode}:`, content);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        return { success: false, error: 'Resposta da IA não contém JSON válido' };
      }

      const plan = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!plan.title || !plan.description || !plan.priority || !Array.isArray(plan.subtasks)) {
        console.error(`Invalid plan structure for ${control.controlCode}:`, plan);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        return { success: false, error: 'Estrutura do plano inválida' };
      }

      console.log(`Successfully generated plan for ${control.controlCode}`);
      return { success: true, plan };

    } catch (error) {
      console.error(`Error on attempt ${attempt} for ${control.controlCode}:`, error);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  return { success: false, error: 'Falha após todas as tentativas' };
}

async function processInBatches(
  controls: ControlInput[],
  framework: string,
  apiKey: string
): Promise<{ success: GeneratedPlan[]; failed: FailedControl[] }> {
  const success: GeneratedPlan[] = [];
  const failed: FailedControl[] = [];

  // Process in batches of PARALLEL_LIMIT
  for (let i = 0; i < controls.length; i += PARALLEL_LIMIT) {
    const batch = controls.slice(i, i + PARALLEL_LIMIT);
    
    const results = await Promise.all(
      batch.map(async (control) => {
        const result = await generatePlanForControl(control, framework, apiKey);
        return { control, result };
      })
    );

    for (const { control, result } of results) {
      if (result.success && result.plan) {
        success.push({
          controlId: control.controlId,
          assessmentId: control.assessmentId,
          plan: result.plan,
        });
      } else {
        failed.push({
          controlId: control.controlId,
          controlCode: control.controlCode,
          error: result.error || 'Erro desconhecido',
        });
      }
    }

    // Small delay between batches to avoid rate limiting
    if (i + PARALLEL_LIMIT < controls.length) {
      await sleep(500);
    }
  }

  return { success, failed };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { controls, framework } = await req.json() as GenerateBulkRequest;

    if (!controls || !Array.isArray(controls) || controls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum controle fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Configuração de API incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting bulk generation for ${controls.length} controls (framework: ${framework})`);

    const result = await processInBatches(controls, framework, apiKey);

    console.log(`Bulk generation complete: ${result.success.length} success, ${result.failed.length} failed`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-bulk-action-plans:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
