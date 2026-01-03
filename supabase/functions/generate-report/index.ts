import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  type: 'compliance' | 'risks' | 'evidence' | 'actions' | 'executive' | 'gap';
  frameworkId?: string;
  organizationId: string;
  period?: 'current' | 'quarter' | 'year' | 'all';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { type, frameworkId, organizationId, period = 'current' }: ReportRequest = await req.json();

    // Get client IP for logging
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("x-real-ip") 
      || "unknown";

    console.log(`Generating ${type} report for org ${organizationId}`);

    // Fetch organization info
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    // Fetch data based on report type
    let reportData: any = {};

    // Get assessments with controls
    const { data: assessments } = await supabase
      .from('assessments')
      .select('id, status, maturity_level, target_maturity, observations, control_id')
      .eq('organization_id', organizationId);

    // Get controls for assessments
    const controlIds = assessments?.map(a => a.control_id) || [];
    const { data: controls } = await supabase
      .from('controls')
      .select('id, code, name, category')
      .in('id', controlIds);

    const controlsMap = new Map(controls?.map(c => [c.id, c]) || []);

    // Get risks
    const { data: risks } = await supabase
      .from('risks')
      .select('*')
      .eq('organization_id', organizationId);

    // Get action plans
    const { data: actionPlans } = await supabase
      .from('action_plans')
      .select('*')
      .eq('organization_id', organizationId);

    // Get evidences
    const { data: evidences } = await supabase
      .from('evidences')
      .select('*')
      .eq('organization_id', organizationId);

    // Calculate statistics
    const totalAssessments = assessments?.length || 0;
    const conformeCount = assessments?.filter(a => a.status === 'conforme').length || 0;
    const parcialCount = assessments?.filter(a => a.status === 'parcial').length || 0;
    const naoConformeCount = assessments?.filter(a => a.status === 'nao_conforme').length || 0;
    const complianceScore = totalAssessments > 0 
      ? Math.round(((conformeCount + parcialCount * 0.5) / totalAssessments) * 100)
      : 0;

    const totalRisks = risks?.length || 0;
    const criticalRisks = risks?.filter(r => r.inherent_probability * r.inherent_impact >= 20).length || 0;
    const highRisks = risks?.filter(r => {
      const level = r.inherent_probability * r.inherent_impact;
      return level >= 12 && level < 20;
    }).length || 0;

    const totalActions = actionPlans?.length || 0;
    const doneActions = actionPlans?.filter(a => a.status === 'done').length || 0;
    const overdueActions = actionPlans?.filter(a => 
      a.due_date && new Date(a.due_date) < new Date() && a.status !== 'done'
    ).length || 0;

    // Build report content based on type
    const reportDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    let htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório - ${org?.name || 'Organização'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 { color: #1e40af; font-size: 28px; margin-bottom: 5px; }
    .header .subtitle { color: #6b7280; font-size: 14px; }
    .header .date { color: #6b7280; font-size: 12px; margin-top: 10px; }
    .section { margin-bottom: 30px; }
    .section-title { 
      color: #1e40af; 
      font-size: 18px; 
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .stat-value { font-size: 32px; font-weight: 700; color: #1e40af; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 5px; }
    .stat-card.success .stat-value { color: #16a34a; }
    .stat-card.warning .stat-value { color: #d97706; }
    .stat-card.danger .stat-value { color: #dc2626; }
    .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .table th, .table td { 
      padding: 10px; 
      text-align: left; 
      border-bottom: 1px solid #e5e7eb;
    }
    .table th { background: #f1f5f9; font-weight: 600; font-size: 12px; color: #475569; }
    .table td { font-size: 13px; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .progress-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 5px;
    }
    .progress-fill {
      height: 100%;
      background: #3b82f6;
      border-radius: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 11px;
    }
    @media print {
      body { padding: 20px; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${getReportTitle(type)}</h1>
    <div class="subtitle">${org?.name || 'Organização'}</div>
    <div class="date">Gerado em ${reportDate}</div>
  </div>
`;

    // Add content based on report type
    if (type === 'executive' || type === 'compliance') {
      htmlContent += `
  <div class="section">
    <h2 class="section-title">Resumo Executivo</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${complianceScore}%</div>
        <div class="stat-label">Score de Conformidade</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">${conformeCount}</div>
        <div class="stat-label">Controles Conformes</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">${parcialCount}</div>
        <div class="stat-label">Parcialmente Conformes</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-value">${naoConformeCount}</div>
        <div class="stat-label">Não Conformes</div>
      </div>
    </div>
  </div>
`;
    }

    if (type === 'risks' || type === 'executive') {
      htmlContent += `
  <div class="section">
    <h2 class="section-title">Análise de Riscos</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${totalRisks}</div>
        <div class="stat-label">Total de Riscos</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-value">${criticalRisks}</div>
        <div class="stat-label">Riscos Críticos</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">${highRisks}</div>
        <div class="stat-label">Riscos Altos</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">${risks?.filter(r => r.treatment !== 'aceitar').length || 0}</div>
        <div class="stat-label">Em Tratamento</div>
      </div>
    </div>
    ${risks && risks.length > 0 ? `
    <table class="table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Risco</th>
          <th>Nível</th>
          <th>Tratamento</th>
        </tr>
      </thead>
      <tbody>
        ${risks.slice(0, 10).map(r => {
          const level = r.inherent_probability * r.inherent_impact;
          const levelClass = level >= 20 ? 'danger' : level >= 12 ? 'warning' : 'success';
          const levelLabel = level >= 20 ? 'Crítico' : level >= 12 ? 'Alto' : level >= 6 ? 'Médio' : 'Baixo';
          return `
        <tr>
          <td>${r.code}</td>
          <td>${r.title}</td>
          <td><span class="badge badge-${levelClass}">${levelLabel}</span></td>
          <td>${getTreatmentLabel(r.treatment)}</td>
        </tr>`;
        }).join('')}
      </tbody>
    </table>
    ` : '<p>Nenhum risco cadastrado.</p>'}
  </div>
`;
    }

    if (type === 'actions' || type === 'executive') {
      htmlContent += `
  <div class="section">
    <h2 class="section-title">Planos de Ação</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${totalActions}</div>
        <div class="stat-label">Total de Planos</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">${doneActions}</div>
        <div class="stat-label">Concluídos</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">${actionPlans?.filter(a => a.status === 'in_progress').length || 0}</div>
        <div class="stat-label">Em Progresso</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-value">${overdueActions}</div>
        <div class="stat-label">Atrasados</div>
      </div>
    </div>
    ${actionPlans && actionPlans.length > 0 ? `
    <table class="table">
      <thead>
        <tr>
          <th>Plano de Ação</th>
          <th>Prioridade</th>
          <th>Status</th>
          <th>Prazo</th>
        </tr>
      </thead>
      <tbody>
        ${actionPlans.slice(0, 10).map(a => {
          const priorityClass = a.priority === 'critica' ? 'danger' : a.priority === 'alta' ? 'warning' : 'info';
          return `
        <tr>
          <td>${a.title}</td>
          <td><span class="badge badge-${priorityClass}">${getPriorityLabel(a.priority)}</span></td>
          <td><span class="badge badge-info">${getStatusLabel(a.status)}</span></td>
          <td>${a.due_date ? new Date(a.due_date).toLocaleDateString('pt-BR') : '-'}</td>
        </tr>`;
        }).join('')}
      </tbody>
    </table>
    ` : '<p>Nenhum plano de ação cadastrado.</p>'}
  </div>
`;
    }

    if (type === 'evidence') {
      htmlContent += `
  <div class="section">
    <h2 class="section-title">Inventário de Evidências</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${evidences?.length || 0}</div>
        <div class="stat-label">Total de Evidências</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">${evidences?.filter(e => e.classification === 'publico').length || 0}</div>
        <div class="stat-label">Públicas</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">${evidences?.filter(e => e.classification === 'interno').length || 0}</div>
        <div class="stat-label">Internas</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-value">${evidences?.filter(e => e.classification === 'confidencial').length || 0}</div>
        <div class="stat-label">Confidenciais</div>
      </div>
    </div>
    ${evidences && evidences.length > 0 ? `
    <table class="table">
      <thead>
        <tr>
          <th>Evidência</th>
          <th>Classificação</th>
          <th>Tipo</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        ${evidences.slice(0, 15).map(e => `
        <tr>
          <td>${e.name}</td>
          <td><span class="badge badge-info">${getClassificationLabel(e.classification)}</span></td>
          <td>${e.file_type || '-'}</td>
          <td>${new Date(e.created_at).toLocaleDateString('pt-BR')}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    ` : '<p>Nenhuma evidência cadastrada.</p>'}
  </div>
`;
    }

    if (type === 'gap') {
      // Group assessments by status
      const gaps = assessments?.filter(a => a.status === 'nao_conforme' || a.status === 'parcial') || [];
      
      htmlContent += `
  <div class="section">
    <h2 class="section-title">Análise de Gaps</h2>
    <p style="margin-bottom: 20px; color: #6b7280;">
      Identificamos ${gaps.length} controles que necessitam de atenção para atingir conformidade total.
    </p>
    ${gaps.length > 0 ? `
    <table class="table">
      <thead>
        <tr>
          <th>Controle</th>
          <th>Categoria</th>
          <th>Status Atual</th>
          <th>Gap</th>
        </tr>
      </thead>
      <tbody>
        ${gaps.slice(0, 20).map(a => {
          const statusClass = a.status === 'nao_conforme' ? 'danger' : 'warning';
          const gap = a.status === 'nao_conforme' ? 'Total' : 'Parcial';
          const control = controlsMap.get(a.control_id);
          return `
        <tr>
          <td>${control?.code || '-'} - ${control?.name || '-'}</td>
          <td>${control?.category || '-'}</td>
          <td><span class="badge badge-${statusClass}">${getStatusConformidadeLabel(a.status)}</span></td>
          <td>${gap}</td>
        </tr>`;
        }).join('')}
      </tbody>
    </table>
    ` : '<p>Nenhum gap identificado. Todos os controles estão conformes!</p>'}
  </div>
`;
    }

    htmlContent += `
  <div class="footer">
    <p>Relatório gerado automaticamente pela plataforma de GRC</p>
    <p>Este documento é confidencial e destinado apenas ao uso interno</p>
  </div>
</body>
</html>
`;

    console.log(`Report generated successfully for type: ${type}`);

    // Log the report generation event
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await supabaseAdmin.from("access_logs").insert({
      user_id: user.id,
      organization_id: organizationId,
      action: "export",
      entity_type: "report",
      details: {
        reportType: type,
        frameworkId,
        period,
        stats: {
          complianceScore,
          totalRisks,
          criticalRisks,
          totalActions,
          overdueActions,
        },
        timestamp: new Date().toISOString(),
      },
      ip_address: clientIP,
    });

    return new Response(
      JSON.stringify({ 
        html: htmlContent,
        metadata: {
          type,
          generatedAt: new Date().toISOString(),
          organizationName: org?.name,
          stats: {
            complianceScore,
            totalRisks,
            criticalRisks,
            totalActions,
            overdueActions,
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error generating report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getReportTitle(type: string): string {
  const titles: Record<string, string> = {
    compliance: 'Relatório de Conformidade',
    risks: 'Relatório de Riscos',
    evidence: 'Relatório de Evidências',
    actions: 'Relatório de Planos de Ação',
    executive: 'Relatório Executivo',
    gap: 'Relatório de Gap Analysis',
  };
  return titles[type] || 'Relatório';
}

function getTreatmentLabel(treatment: string): string {
  const labels: Record<string, string> = {
    mitigar: 'Mitigar',
    aceitar: 'Aceitar',
    transferir: 'Transferir',
    evitar: 'Evitar',
  };
  return labels[treatment] || treatment;
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    critica: 'Crítica',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
  };
  return labels[priority] || priority;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    backlog: 'Backlog',
    todo: 'A Fazer',
    in_progress: 'Em Progresso',
    review: 'Em Revisão',
    done: 'Concluído',
  };
  return labels[status] || status;
}

function getClassificationLabel(classification: string): string {
  const labels: Record<string, string> = {
    publico: 'Público',
    interno: 'Interno',
    confidencial: 'Confidencial',
  };
  return labels[classification] || classification;
}

function getStatusConformidadeLabel(status: string): string {
  const labels: Record<string, string> = {
    conforme: 'Conforme',
    parcial: 'Parcial',
    nao_conforme: 'Não Conforme',
    nao_aplicavel: 'N/A',
  };
  return labels[status] || status;
}
