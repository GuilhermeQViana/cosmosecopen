import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/auth.ts";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const token = url.searchParams.get("token");
      if (!token) return jsonResponse({ error: "Token obrigatório" }, 400);

      // Fetch campaign by token
      const { data: campaign, error: cErr } = await supabase
        .from("qualification_campaigns")
        .select("id, organization_id, template_id, template_version, vendor_id, status, expires_at, reviewer_notes")
        .eq("token", token)
        .maybeSingle();

      if (cErr || !campaign) return jsonResponse({ error: "Campanha não encontrada" }, 404);

      if (new Date(campaign.expires_at) < new Date()) {
        return jsonResponse({ error: "Este link expirou" }, 410);
      }

      // Fetch vendor name
      const { data: vendor } = await supabase
        .from("vendors")
        .select("name")
        .eq("id", campaign.vendor_id)
        .maybeSingle();

      // Fetch template info
      const { data: template } = await supabase
        .from("qualification_templates")
        .select("name, description")
        .eq("id", campaign.template_id)
        .maybeSingle();

      // Fetch questions
      const { data: questions } = await supabase
        .from("qualification_questions")
        .select("id, order_index, label, type, options, weight, is_required, is_ko, ko_value, conditional_on, conditional_value")
        .eq("template_id", campaign.template_id)
        .order("order_index", { ascending: true });

      // Fetch existing responses (for draft/returned)
      const { data: responses } = await supabase
        .from("qualification_responses")
        .select("id, question_id, answer_text, answer_option, answer_file_url")
        .eq("campaign_id", campaign.id);

      return jsonResponse({
        campaign: {
          id: campaign.id,
          status: campaign.status,
          expires_at: campaign.expires_at,
          reviewer_notes: campaign.reviewer_notes,
        },
        vendor_name: vendor?.name || "Fornecedor",
        template: {
          name: template?.name || "Questionário",
          description: template?.description || "",
        },
        questions: questions || [],
        responses: responses || [],
      });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body = await req.json();
      const { campaign_id, responses, is_draft } = body;

      if (!campaign_id || !responses) {
        return jsonResponse({ error: "campaign_id e responses são obrigatórios" }, 400);
      }

      // Validate campaign exists and is in valid state
      const { data: campaign, error: cErr } = await supabase
        .from("qualification_campaigns")
        .select("id, status, template_id")
        .eq("id", campaign_id)
        .maybeSingle();

      if (cErr || !campaign) return jsonResponse({ error: "Campanha não encontrada" }, 404);

      const validStatuses = ["pendente", "em_preenchimento", "devolvido"];
      if (!validStatuses.includes(campaign.status)) {
        return jsonResponse({ error: "Esta campanha não aceita mais respostas" }, 400);
      }

      // Upsert responses
      for (const resp of responses) {
        const existing = await supabase
          .from("qualification_responses")
          .select("id")
          .eq("campaign_id", campaign_id)
          .eq("question_id", resp.question_id)
          .maybeSingle();

        if (existing.data) {
          await supabase
            .from("qualification_responses")
            .update({
              answer_text: resp.answer_text || null,
              answer_option: resp.answer_option || null,
              answer_file_url: resp.answer_file_url || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.data.id);
        } else {
          await supabase
            .from("qualification_responses")
            .insert({
              campaign_id,
              question_id: resp.question_id,
              answer_text: resp.answer_text || null,
              answer_option: resp.answer_option || null,
              answer_file_url: resp.answer_file_url || null,
            });
        }
      }

      // Update campaign status
      const newStatus = is_draft ? "em_preenchimento" : "respondido";
      await supabase
        .from("qualification_campaigns")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", campaign_id);

      return jsonResponse({ success: true, status: newStatus });
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});
