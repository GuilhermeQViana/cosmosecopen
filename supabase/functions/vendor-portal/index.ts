import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
      // GET /vendor-portal?token=xxx — fetch portal data (public, no auth)
      const token = url.searchParams.get("token");
      if (!token) return jsonResponse({ error: "Token obrigatório" }, 400);

      const { data, error } = await supabase
        .from("vendor_portal_tokens")
        .select("id, vendor_id, scope, expires_at, status, vendor_response")
        .eq("token", token)
        .maybeSingle();

      if (error || !data) return jsonResponse({ error: "Token não encontrado" }, 404);

      if (new Date(data.expires_at) < new Date()) {
        return jsonResponse({ error: "Token expirado" }, 410);
      }

      // Get vendor name
      const { data: vendor } = await supabase
        .from("vendors")
        .select("name")
        .eq("id", data.vendor_id)
        .maybeSingle();

      return jsonResponse({
        ...data,
        vendor_name: vendor?.name || "Fornecedor",
      });
    }

    if (req.method === "POST") {
      // POST /vendor-portal — submit responses
      const body = await req.json();
      const { portal_id, responses } = body;

      if (!portal_id || !responses) {
        return jsonResponse({ error: "portal_id e responses são obrigatórios" }, 400);
      }

      const { error } = await supabase
        .from("vendor_portal_tokens")
        .update({
          vendor_response: responses,
          status: "respondido",
          used_at: new Date().toISOString(),
        })
        .eq("id", portal_id);

      if (error) return jsonResponse({ error: error.message }, 500);

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});
