import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  authenticate,
  handleCors,
  isAuthError,
  errorResponse,
  jsonResponse,
} from "../_shared/auth.ts";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const PARALLEL_LIMIT = 3;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RequirementInput {
  requirementId: string;
  requirementCode: string;
  requirementName: string;
  requirementDescription: string | null;
  domainName: string;
  complianceLevel: number;
}

async function generatePlanForRequirement(
  req: RequirementInput,
  vendorName: string,
  vendorCriticality: string,
  apiKey: string
): Promise<{ success: boolean; plan?: any; error?: string }> {
  const prompt = `Você é um especialista em GRC e gestão de fornecedores.

Dado o seguinte requisito de avaliação de fornecedor com nível de conformidade insuficiente:

**Fornecedor:** ${vendorName} (Criticidade: ${vendorCriticality})
**Domínio:** ${req.domainName}
**Requisito:** ${req.requirementCode} - ${req.requirementName}
**Descrição:** ${req.requirementDescription || "Não informada"}
**Nível de Conformidade Atual:** ${req.complianceLevel}/5

Gere um plano de ação para elevar o nível de conformidade. Inclua título, descrição, prioridade e subtarefas.`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
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
                name: "create_action_plan",
                description: "Cria plano de ação para requisito não conforme",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    priority: { type: "string", enum: ["critica", "alta", "media", "baixa"] },
                    subtasks: { type: "array", items: { type: "string" } },
                  },
                  required: ["title", "description", "priority", "subtasks"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "create_action_plan" } },
        }),
      });

      if (response.status === 429) {
        await sleep(RETRY_DELAY_MS * 2);
        continue;
      }
      if (response.status === 402) {
        return { success: false, error: "Créditos insuficientes para geração de planos com IA" };
      }
      if (!response.ok) {
        if (attempt < MAX_RETRIES) { await sleep(RETRY_DELAY_MS); continue; }
        return { success: false, error: `Erro da API: ${response.status}` };
      }

      const aiResponse = await response.json();
      const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        if (attempt < MAX_RETRIES) { await sleep(RETRY_DELAY_MS); continue; }
        return { success: false, error: "Resposta inválida da IA" };
      }

      const plan = JSON.parse(toolCall.function.arguments);
      return { success: true, plan };
    } catch (error) {
      if (attempt < MAX_RETRIES) { await sleep(RETRY_DELAY_MS); continue; }
      return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
    }
  }
  return { success: false, error: "Falha após todas as tentativas" };
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const { supabase } = auth;

    const { assessmentId, vendorId } = await req.json();
    if (!assessmentId || !vendorId) return errorResponse("assessmentId e vendorId são obrigatórios", 400);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return errorResponse("Configuração de API incompleta", 500);

    // Fetch vendor
    const { data: vendor } = await supabase.from("vendors").select("name, criticality, category").eq("id", vendorId).single();

    // Fetch responses with compliance < 3
    const { data: responses } = await supabase
      .from("vendor_assessment_responses")
      .select("*, requirement:vendor_requirements(*, domain:vendor_assessment_domains(*))")
      .eq("assessment_id", assessmentId)
      .lt("compliance_level", 3)
      .gt("compliance_level", 0);

    if (!responses || responses.length === 0) {
      return jsonResponse({ success: [], failed: [], message: "Nenhum requisito com conformidade abaixo de 3 encontrado" });
    }

    const requirements: RequirementInput[] = responses.map((r: any) => ({
      requirementId: r.requirement_id,
      requirementCode: r.requirement?.code || "",
      requirementName: r.requirement?.name || "",
      requirementDescription: r.requirement?.description,
      domainName: r.requirement?.domain?.name || "",
      complianceLevel: r.compliance_level,
    }));

    const success: any[] = [];
    const failed: any[] = [];

    for (let i = 0; i < requirements.length; i += PARALLEL_LIMIT) {
      const batch = requirements.slice(i, i + PARALLEL_LIMIT);
      const results = await Promise.all(
        batch.map(async (r) => {
          const result = await generatePlanForRequirement(r, vendor?.name || "", vendor?.criticality || "media", apiKey);
          return { requirement: r, result };
        })
      );

      for (const { requirement, result } of results) {
        if (result.success && result.plan) {
          success.push({ requirementId: requirement.requirementId, requirementCode: requirement.requirementCode, plan: result.plan });
        } else {
          failed.push({ requirementId: requirement.requirementId, requirementCode: requirement.requirementCode, error: result.error });
        }
      }

      if (i + PARALLEL_LIMIT < requirements.length) await sleep(500);
    }

    return jsonResponse({ success, failed });
  } catch (error) {
    console.error("Error in generate-vendor-action-plans:", error);
    return errorResponse(error instanceof Error ? error.message : "Erro desconhecido", 500);
  }
});
