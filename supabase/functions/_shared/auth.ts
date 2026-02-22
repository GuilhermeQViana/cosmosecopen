import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Resultado de autenticação com sucesso
export interface AuthResult {
  user: User;
  supabase: SupabaseClient;
}

// Domínios permitidos - configurável via variável de ambiente
function getAllowedOrigins(): string[] {
  const envOrigins = Deno.env.get("ALLOWED_ORIGINS");
  if (envOrigins) {
    return envOrigins.split(",").map(o => o.trim()).filter(Boolean);
  }
  // Fallback: permitir qualquer origem em desenvolvimento
  return [];
}

function getAllowedOrigin(req?: Request): string {
  const origin = req?.headers?.get("origin") || "";
  const allowedOrigins = getAllowedOrigins();
  
  // Se não há origens configuradas, permitir qualquer origem (modo dev/open source)
  if (allowedOrigins.length === 0) {
    return origin || "*";
  }
  
  if (allowedOrigins.includes(origin)) {
    return origin;
  }
  // Em desenvolvimento, permitir origens locais
  if (origin.includes("localhost")) {
    return origin;
  }
  return allowedOrigins[0] || "*";
}

// Headers CORS padrão para todas as edge functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Gerar CORS headers dinâmicos baseados na origem da requisição
export function getCorsHeaders(req?: Request) {
  return {
    ...corsHeaders,
    "Access-Control-Allow-Origin": getAllowedOrigin(req),
  };
}

// Resposta CORS para preflight requests
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  return null;
}

// Resposta de erro padronizada
export function errorResponse(message: string, status: number = 500, req?: Request): Response {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { ...headers, "Content-Type": "application/json" } 
    }
  );
}

// Resposta de sucesso padronizada
export function jsonResponse(data: unknown, status: number = 200, req?: Request): Response {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...headers, "Content-Type": "application/json" } 
    }
  );
}

// Resposta HTML padronizada
export function htmlResponse(html: string, status: number = 200, req?: Request): Response {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new Response(html, {
    status,
    headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * Middleware principal de autenticação.
 */
export async function authenticate(req: Request): Promise<AuthResult | Response> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse("Missing or invalid authorization header", 401, req);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return errorResponse(userError?.message || "Invalid or expired token", 401, req);
  }

  return { user: userData.user, supabase };
}

/**
 * Autenticação com cliente do usuário (para RLS).
 */
export async function authenticateWithUserClient(req: Request): Promise<AuthResult | Response> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse("Missing or invalid authorization header", 401, req);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return errorResponse(error?.message || "Invalid or expired token", 401, req);
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

/**
 * Helper para obter URL base da IA (configurável).
 */
export function getAIConfig(): { baseUrl: string; apiKey: string } | null {
  const apiKey = Deno.env.get("AI_API_KEY");
  const baseUrl = Deno.env.get("AI_BASE_URL");
  
  if (!apiKey || !baseUrl) return null;
  return { baseUrl, apiKey };
}
