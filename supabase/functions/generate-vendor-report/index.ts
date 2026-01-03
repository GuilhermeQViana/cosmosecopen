import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssessmentReportData {
  assessmentId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { assessmentId } = await req.json() as AssessmentReportData;

    // Fetch assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from("vendor_assessments")
      .select(`
        *,
        vendor:vendors(*)
      `)
      .eq("id", assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return new Response(JSON.stringify({ error: "Assessment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch responses
    const { data: responses, error: responsesError } = await supabase
      .from("vendor_assessment_responses")
      .select(`
        *,
        requirement:vendor_requirements(
          *,
          domain:vendor_assessment_domains(*)
        )
      `)
      .eq("assessment_id", assessmentId);

    if (responsesError) {
      throw responsesError;
    }

    // Fetch organization
    const { data: organization } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", assessment.organization_id)
      .single();

    // Group responses by domain
    const responsesByDomain: Record<string, any[]> = {};
    responses?.forEach((response: any) => {
      const domainName = response.requirement?.domain?.name || "Outros";
      if (!responsesByDomain[domainName]) {
        responsesByDomain[domainName] = [];
      }
      responsesByDomain[domainName].push(response);
    });

    // Calculate domain scores
    const domainScores: Record<string, number> = {};
    Object.entries(responsesByDomain).forEach(([domain, domainResponses]) => {
      const avg = domainResponses.reduce((sum, r) => sum + (r.compliance_level / 5) * 100, 0) / domainResponses.length;
      domainScores[domain] = Math.round(avg);
    });

    // Get risk level label
    const getRiskLabel = (score: number | null) => {
      if (score === null) return "Não Avaliado";
      if (score >= 80) return "Baixo";
      if (score >= 60) return "Médio";
      if (score >= 40) return "Alto";
      return "Crítico";
    };

    const getRiskColor = (score: number | null) => {
      if (score === null) return "#6b7280";
      if (score >= 80) return "#22c55e";
      if (score >= 60) return "#eab308";
      if (score >= 40) return "#f97316";
      return "#ef4444";
    };

    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Avaliação - ${assessment.vendor?.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #fff;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header { 
      text-align: center; 
      margin-bottom: 40px; 
      padding-bottom: 30px;
      border-bottom: 2px solid #e5e7eb;
    }
    .logo { font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 10px; }
    .title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .subtitle { color: #6b7280; font-size: 14px; }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }
    .summary-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
    
    .score-card {
      text-align: center;
      padding: 30px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border-radius: 16px;
      margin-bottom: 40px;
    }
    .score-label { font-size: 14px; opacity: 0.9; }
    .score-value { font-size: 64px; font-weight: bold; margin: 10px 0; }
    .score-risk { 
      display: inline-block;
      padding: 6px 16px; 
      background: rgba(255,255,255,0.2); 
      border-radius: 20px; 
      font-size: 14px;
    }
    
    .section { margin-bottom: 40px; }
    .section-title { 
      font-size: 18px; 
      font-weight: 600; 
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .domain-card {
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
      margin-bottom: 15px;
      border: 1px solid #e5e7eb;
    }
    .domain-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .domain-name { font-weight: 600; font-size: 16px; }
    .domain-score {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    
    .requirement-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .requirement-row:last-child { border-bottom: none; }
    .requirement-code { 
      font-size: 12px; 
      color: #6366f1; 
      font-weight: 500;
      margin-right: 10px;
    }
    .requirement-name { flex: 1; font-size: 14px; }
    .requirement-score {
      width: 60px;
      text-align: center;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }
    
    .compliance-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 10px;
    }
    .compliance-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s;
    }
    
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .container { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🛡️ CosmoSec VRM</div>
      <h1 class="title">Relatório de Avaliação de Fornecedor</h1>
      <p class="subtitle">Gerado em ${new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
    </div>
    
    <div class="score-card">
      <div class="score-label">Score Geral de Conformidade</div>
      <div class="score-value">${assessment.overall_score ?? 0}%</div>
      <div class="score-risk">Risco ${getRiskLabel(assessment.overall_score)}</div>
    </div>
    
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-label">Fornecedor</div>
        <div class="summary-value">${assessment.vendor?.name}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Código</div>
        <div class="summary-value">${assessment.vendor?.code}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Data da Avaliação</div>
        <div class="summary-value">${new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Status</div>
        <div class="summary-value">${assessment.status === 'completed' ? 'Concluída' : assessment.status === 'approved' ? 'Aprovada' : 'Em Andamento'}</div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">Conformidade por Domínio</h2>
      ${Object.entries(domainScores).map(([domain, score]) => `
        <div class="domain-card">
          <div class="domain-header">
            <span class="domain-name">${domain}</span>
            <span class="domain-score" style="background: ${getRiskColor(score)}20; color: ${getRiskColor(score)}">${score}%</span>
          </div>
          <div class="compliance-bar">
            <div class="compliance-fill" style="width: ${score}%; background: ${getRiskColor(score)}"></div>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <h2 class="section-title">Detalhamento por Requisito</h2>
      ${Object.entries(responsesByDomain).map(([domain, domainResponses]) => `
        <div class="domain-card">
          <div class="domain-name" style="margin-bottom: 15px;">${domain}</div>
          ${domainResponses.map((r: any) => `
            <div class="requirement-row">
              <span class="requirement-code">${r.requirement?.code}</span>
              <span class="requirement-name">${r.requirement?.name}</span>
              <span class="requirement-score" style="background: ${getRiskColor((r.compliance_level / 5) * 100)}20; color: ${getRiskColor((r.compliance_level / 5) * 100)}">${r.compliance_level}/5</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
    
    ${assessment.notes ? `
    <div class="section">
      <h2 class="section-title">Observações Gerais</h2>
      <div class="domain-card">
        <p style="white-space: pre-wrap;">${assessment.notes}</p>
      </div>
    </div>
    ` : ''}
    
    <div class="footer">
      <p>Relatório gerado automaticamente pelo CosmoSec VRM</p>
      <p>${organization?.name || 'Organização'} • ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Error generating report:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
