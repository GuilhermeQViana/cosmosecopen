import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { handleCors, errorResponse, getCorsHeaders } from "../_shared/auth.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { campaignId, csvContent } = await req.json();
    if (!campaignId || !csvContent) return errorResponse("campaignId and csvContent are required", 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify campaign exists
    const { data: campaign, error: cErr } = await supabase
      .from("qualification_campaigns")
      .select("id, template_id, status")
      .eq("id", campaignId)
      .single();
    if (cErr || !campaign) return errorResponse("Campaign not found", 404);

    // Get questions ordered by order_index
    const { data: questions, error: qErr } = await supabase
      .from("qualification_questions")
      .select("*")
      .eq("template_id", campaign.template_id)
      .order("order_index", { ascending: true });
    if (qErr) return errorResponse(qErr.message, 500);
    if (!questions?.length) return errorResponse("No questions found for this template", 400);

    // Parse CSV - skip comment/metadata lines and header
    const lines = csvContent.split("\n").filter((l: string) => l.trim() && !l.startsWith("#"));
    if (lines.length < 2) return errorResponse("CSV has no data rows", 400);

    // First non-comment line is the header
    const dataLines = lines.slice(1); // skip header

    const errors: string[] = [];
    const responses: Array<{
      campaign_id: string;
      question_id: string;
      answer_text: string | null;
      answer_option: any;
      answer_file_url: string | null;
    }> = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      // Simple CSV parsing (handles quoted fields)
      const fields = parseCsvLine(line);
      const questionIndex = parseInt(fields[0]) - 1; // # column is 1-based

      if (isNaN(questionIndex) || questionIndex < 0 || questionIndex >= questions.length) {
        errors.push(`Linha ${i + 2}: número de pergunta inválido "${fields[0]}"`);
        continue;
      }

      const question = questions[questionIndex];
      const answer = (fields[6] || "").trim(); // "Resposta" is the 7th column

      if (!answer && question.is_required) {
        errors.push(`Linha ${i + 2}: pergunta obrigatória "${question.label}" sem resposta`);
        continue;
      }

      if (!answer) continue; // Skip empty optional answers

      let answerText: string | null = null;
      let answerOption: any = null;

      if (question.type === "multiple_choice") {
        const options = Array.isArray(question.options) ? question.options : [];
        const matched = options.find(
          (o: any) => (o.label || o.value || "").toLowerCase() === answer.toLowerCase()
        );
        if (!matched) {
          errors.push(`Linha ${i + 2}: opção "${answer}" não encontrada para "${question.label}". Opções: ${options.map((o: any) => o.label || o.value).join(", ")}`);
          continue;
        }
        answerOption = { value: matched.value, label: matched.label };
      } else {
        answerText = answer;
      }

      responses.push({
        campaign_id: campaignId,
        question_id: question.id,
        answer_text: answerText,
        answer_option: answerOption,
        answer_file_url: null,
      });
    }

    if (errors.length > 0 && responses.length === 0) {
      return new Response(
        JSON.stringify({ success: false, errors, imported: 0 }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Delete existing responses for this campaign before importing
    await supabase
      .from("qualification_responses")
      .delete()
      .eq("campaign_id", campaignId);

    // Insert new responses
    if (responses.length > 0) {
      const { error: insertErr } = await supabase
        .from("qualification_responses")
        .insert(responses);
      if (insertErr) return errorResponse(insertErr.message, 500);
    }

    // Update campaign status
    await supabase
      .from("qualification_campaigns")
      .update({ status: "respondido" })
      .eq("id", campaignId);

    return new Response(
      JSON.stringify({
        success: true,
        imported: responses.length,
        total: questions.length,
        errors,
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error importing responses:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error", 500);
  }
});

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}
