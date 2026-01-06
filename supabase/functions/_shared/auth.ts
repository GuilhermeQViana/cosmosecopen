import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Resultado de autenticação com sucesso
export interface AuthResult {
  user: User;
  supabase: SupabaseClient;
}

// Headers CORS padrão para todas as edge functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Resposta CORS para preflight requests
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Resposta de erro padronizada
export function errorResponse(message: string, status: number = 500): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

// Resposta de sucesso padronizada
export function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

// Resposta HTML padronizada
export function htmlResponse(html: string, status: number = 200): Response {
  return new Response(html, {
    status,
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * Middleware principal de autenticação.
 * Valida o token JWT e retorna o usuário autenticado + cliente Supabase com service role.
 * Retorna Response de erro se a autenticação falhar.
 */
export async function authenticate(req: Request): Promise<AuthResult | Response> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse("Missing or invalid authorization header", 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return errorResponse(userError?.message || "Invalid or expired token", 401);
  }

  return { user: userData.user, supabase };
}

/**
 * Autenticação com cliente do usuário (para RLS).
 * O cliente Supabase criado respeita as políticas RLS do banco.
 */
export async function authenticateWithUserClient(req: Request): Promise<AuthResult | Response> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse("Missing or invalid authorization header", 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return errorResponse(error?.message || "Invalid or expired token", 401);
  }

  return { user, supabase };
}

/**
 * Helper para obter a organização do usuário.
 */
export async function getUserOrganization(
  supabase: SupabaseClient, 
  userId: string
): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .single();
  
  return profile?.organization_id || null;
}

/**
 * Type guard para verificar se o resultado é uma Response de erro.
 */
export function isAuthError(result: AuthResult | Response): result is Response {
  return result instanceof Response;
}

/**
 * Helper para logging padronizado nas edge functions.
 */
export function createLogger(prefix: string) {
  return (step: string, details?: unknown) => {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    console.log(`[${prefix}] ${step}${detailsStr}`);
  };
}
