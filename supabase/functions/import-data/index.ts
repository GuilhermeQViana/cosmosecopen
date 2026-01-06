import { 
  authenticate, 
  handleCors, 
  isAuthError, 
  errorResponse, 
  jsonResponse,
  getUserOrganization
} from "../_shared/auth.ts";

interface ImportData {
  metadata?: {
    organization_name?: string;
    exported_at?: string;
    version?: string;
  };
  assessments?: Array<{
    control_code: string;
    framework_code: string;
    maturity_level: string;
    target_maturity: string;
    status: string;
    observations?: string;
  }>;
  risks?: Array<{
    code: string;
    title: string;
    description?: string;
    category?: string;
    inherent_probability: number;
    inherent_impact: number;
    residual_probability?: number;
    residual_impact?: number;
    treatment: string;
    treatment_plan?: string;
  }>;
  action_plans?: Array<{
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Authenticate user
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    
    const { user, supabase } = auth;

    // Get user's organization
    const organizationId = await getUserOrganization(supabase, user.id);
    if (!organizationId) {
      return errorResponse("User has no organization", 400);
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (userRole?.role !== 'admin') {
      return errorResponse("Only admins can import data", 403);
    }

    const body = await req.json();
    const { data, mode = 'preview' } = body as { data: ImportData; mode: 'preview' | 'import' };

    console.log(`Import request - Mode: ${mode}, Organization: ${organizationId}`);

    // Validate data structure
    if (!data || typeof data !== 'object') {
      return errorResponse("Invalid data format", 400);
    }

    const results = {
      assessments: { total: 0, valid: 0, errors: [] as string[] },
      risks: { total: 0, valid: 0, errors: [] as string[] },
      action_plans: { total: 0, valid: 0, errors: [] as string[] },
    };

    // Get all frameworks and controls for mapping
    const { data: frameworks } = await supabase
      .from('frameworks')
      .select('id, code');

    const { data: controls } = await supabase
      .from('controls')
      .select('id, code, framework_id');

    const frameworkMap = new Map(frameworks?.map(f => [f.code, f.id]) || []);
    const controlMap = new Map(controls?.map(c => [`${c.framework_id}:${c.code}`, c.id]) || []);

    // Process assessments
    if (data.assessments && Array.isArray(data.assessments)) {
      results.assessments.total = data.assessments.length;
      
      for (const assessment of data.assessments) {
        const frameworkId = frameworkMap.get(assessment.framework_code);
        if (!frameworkId) {
          results.assessments.errors.push(`Framework não encontrado: ${assessment.framework_code}`);
          continue;
        }

        const controlId = controlMap.get(`${frameworkId}:${assessment.control_code}`);
        if (!controlId) {
          results.assessments.errors.push(`Controle não encontrado: ${assessment.control_code}`);
          continue;
        }

        if (mode === 'import') {
          // Check if assessment exists
          const { data: existing } = await supabase
            .from('assessments')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('control_id', controlId)
            .maybeSingle();

          if (existing) {
            // Update existing
            const { error } = await supabase
              .from('assessments')
              .update({
                maturity_level: assessment.maturity_level,
                target_maturity: assessment.target_maturity,
                status: assessment.status,
                observations: assessment.observations,
                assessed_at: new Date().toISOString(),
                assessed_by: user.id,
              })
              .eq('id', existing.id);

            if (error) {
              results.assessments.errors.push(`Erro ao atualizar ${assessment.control_code}: ${error.message}`);
              continue;
            }
          } else {
            // Insert new
            const { error } = await supabase
              .from('assessments')
              .insert({
                organization_id: organizationId,
                control_id: controlId,
                maturity_level: assessment.maturity_level,
                target_maturity: assessment.target_maturity,
                status: assessment.status,
                observations: assessment.observations,
                assessed_at: new Date().toISOString(),
                assessed_by: user.id,
              });

            if (error) {
              results.assessments.errors.push(`Erro ao inserir ${assessment.control_code}: ${error.message}`);
              continue;
            }
          }
        }

        results.assessments.valid++;
      }
    }

    // Process risks
    if (data.risks && Array.isArray(data.risks)) {
      results.risks.total = data.risks.length;
      
      for (const risk of data.risks) {
        if (!risk.code || !risk.title) {
          results.risks.errors.push(`Risco inválido: código e título são obrigatórios`);
          continue;
        }

        if (mode === 'import') {
          // Check if risk exists by code
          const { data: existing } = await supabase
            .from('risks')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('code', risk.code)
            .maybeSingle();

          if (existing) {
            // Update existing
            const { error } = await supabase
              .from('risks')
              .update({
                title: risk.title,
                description: risk.description,
                category: risk.category,
                inherent_probability: risk.inherent_probability,
                inherent_impact: risk.inherent_impact,
                residual_probability: risk.residual_probability,
                residual_impact: risk.residual_impact,
                treatment: risk.treatment,
                treatment_plan: risk.treatment_plan,
              })
              .eq('id', existing.id);

            if (error) {
              results.risks.errors.push(`Erro ao atualizar ${risk.code}: ${error.message}`);
              continue;
            }
          } else {
            // Insert new
            const { error } = await supabase
              .from('risks')
              .insert({
                organization_id: organizationId,
                code: risk.code,
                title: risk.title,
                description: risk.description,
                category: risk.category,
                inherent_probability: risk.inherent_probability,
                inherent_impact: risk.inherent_impact,
                residual_probability: risk.residual_probability || 1,
                residual_impact: risk.residual_impact || 1,
                treatment: risk.treatment,
                treatment_plan: risk.treatment_plan,
                created_by: user.id,
              });

            if (error) {
              results.risks.errors.push(`Erro ao inserir ${risk.code}: ${error.message}`);
              continue;
            }
          }
        }

        results.risks.valid++;
      }
    }

    // Process action plans
    if (data.action_plans && Array.isArray(data.action_plans)) {
      results.action_plans.total = data.action_plans.length;
      
      for (const plan of data.action_plans) {
        if (!plan.title) {
          results.action_plans.errors.push(`Plano de ação inválido: título é obrigatório`);
          continue;
        }

        if (mode === 'import') {
          // Check if plan exists by title (exact match)
          const { data: existing } = await supabase
            .from('action_plans')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('title', plan.title)
            .maybeSingle();

          if (existing) {
            // Update existing
            const { error } = await supabase
              .from('action_plans')
              .update({
                description: plan.description,
                status: plan.status,
                priority: plan.priority,
                due_date: plan.due_date,
              })
              .eq('id', existing.id);

            if (error) {
              results.action_plans.errors.push(`Erro ao atualizar "${plan.title}": ${error.message}`);
              continue;
            }
          } else {
            // Insert new
            const { error } = await supabase
              .from('action_plans')
              .insert({
                organization_id: organizationId,
                title: plan.title,
                description: plan.description,
                status: plan.status || 'backlog',
                priority: plan.priority || 'media',
                due_date: plan.due_date,
                created_by: user.id,
              });

            if (error) {
              results.action_plans.errors.push(`Erro ao inserir "${plan.title}": ${error.message}`);
              continue;
            }
          }
        }

        results.action_plans.valid++;
      }
    }

    console.log('Import results:', results);

    return jsonResponse({
      success: true,
      mode,
      metadata: data.metadata,
      results,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Import error:', error);
    return errorResponse(errorMessage, 500);
  }
});
