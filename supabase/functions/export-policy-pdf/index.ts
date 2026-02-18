import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, handleCors, isAuthError, errorResponse, getCorsHeaders } from "../_shared/auth.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { policyId } = await req.json();
    if (!policyId) return errorResponse("policyId is required", 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch policy
    const { data: policy, error } = await supabase
      .from('policies')
      .select('*, organizations(name, logo_url)')
      .eq('id', policyId)
      .single();

    if (error || !policy) return errorResponse("Policy not found", 404);

    const orgName = (policy as any).organizations?.name || 'Organização';
    const publishedDate = policy.published_at 
      ? new Date(policy.published_at).toLocaleDateString('pt-BR') 
      : new Date().toLocaleDateString('pt-BR');

    // Generate HTML for PDF
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; margin: 40px; line-height: 1.6; }
  .header { border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
  .header h1 { font-size: 24px; margin: 0; color: #064e3b; }
  .header .org { font-size: 14px; color: #6b7280; }
  .meta { display: flex; gap: 30px; margin-bottom: 30px; padding: 15px; background: #f0fdf4; border-radius: 8px; font-size: 13px; }
  .meta-item { display: flex; flex-direction: column; }
  .meta-label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .meta-value { font-weight: 600; color: #064e3b; }
  .content { font-size: 14px; }
  .content h2 { color: #064e3b; border-bottom: 1px solid #d1fae5; padding-bottom: 8px; margin-top: 30px; }
  .content h3 { color: #065f46; margin-top: 20px; }
  .content table { border-collapse: collapse; width: 100%; margin: 15px 0; }
  .content th, .content td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-size: 13px; }
  .content th { background: #f0fdf4; font-weight: 600; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #10b981; font-size: 11px; color: #6b7280; display: flex; justify-content: space-between; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${escapeHtml(policy.title)}</h1>
      <div class="org">${escapeHtml(orgName)}</div>
    </div>
  </div>
  <div class="meta">
    <div class="meta-item"><span class="meta-label">Versão</span><span class="meta-value">${policy.version || 1}</span></div>
    <div class="meta-item"><span class="meta-label">Status</span><span class="meta-value">${policy.status}</span></div>
    <div class="meta-item"><span class="meta-label">Categoria</span><span class="meta-value">${policy.category || '-'}</span></div>
    <div class="meta-item"><span class="meta-label">Data</span><span class="meta-value">${publishedDate}</span></div>
    ${policy.next_review_at ? `<div class="meta-item"><span class="meta-label">Próxima Revisão</span><span class="meta-value">${new Date(policy.next_review_at).toLocaleDateString('pt-BR')}</span></div>` : ''}
  </div>
  ${policy.description ? `<p style="color:#6b7280;font-style:italic;margin-bottom:20px;">${escapeHtml(policy.description)}</p>` : ''}
  <div class="content">${policy.content || '<p>Sem conteúdo.</p>'}</div>
  <div class="footer">
    <span>Documento gerado automaticamente por CosmoSec</span>
    <span>Versão ${policy.version || 1} • ${publishedDate}</span>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error('Error exporting policy:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
