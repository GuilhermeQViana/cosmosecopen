/**
 * Diagnóstico de conexão com o backend de autenticação.
 * Ajuda a identificar problemas de configuração em ambiente local.
 */

export interface EnvValidationResult {
  status: 'ok' | 'missing' | 'invalid';
  details: string[];
  url?: string;
  maskedKey?: string;
}

export interface PingResult {
  reachable: boolean;
  cause: 'ok' | 'unreachable' | 'timeout' | 'cors' | 'dns' | 'unknown' | 'invalid_key';
  message: string;
  latencyMs?: number;
}

export type AuthErrorCategory =
  | 'connection_error'
  | 'invalid_project_credentials'
  | 'invalid_user_credentials'
  | 'email_not_confirmed'
  | 'rate_limited'
  | 'unknown_auth_error';

export interface NormalizedAuthError {
  message: string;
  category: AuthErrorCategory;
  isConnectionError: boolean;
  originalMessage: string;
}

const CONNECTION_ERROR_PATTERNS = [
  'Failed to fetch',
  'NetworkError',
  'Network request failed',
  'ERR_CONNECTION_REFUSED',
  'ERR_NAME_NOT_RESOLVED',
  'ECONNREFUSED',
  'fetch failed',
  'Load failed',
];

const INVALID_PROJECT_PATTERNS = [
  'Invalid authentication credentials',
  'Invalid API key',
  'apikey',
  'invalid claim: missing sub claim',
  'JWT expired',
];

const INVALID_USER_PATTERNS = [
  'Invalid login credentials',
  'invalid_credentials',
  'invalid_grant',
];

const EMAIL_NOT_CONFIRMED_PATTERNS = [
  'Email not confirmed',
  'email_not_confirmed',
  'Signup requires a valid',
];

const RATE_LIMIT_PATTERNS = [
  'rate limit',
  'too many requests',
  'For security purposes',
  'over_request_rate_limit',
];

export function isConnectionError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return CONNECTION_ERROR_PATTERNS.some((p) => msg.includes(p));
}

function matchesAny(msg: string, patterns: string[]): boolean {
  const lower = msg.toLowerCase();
  return patterns.some((p) => lower.includes(p.toLowerCase()));
}

function classifyAuthError(message: string): AuthErrorCategory {
  if (matchesAny(message, CONNECTION_ERROR_PATTERNS)) return 'connection_error';
  if (matchesAny(message, INVALID_PROJECT_PATTERNS)) return 'invalid_project_credentials';
  if (matchesAny(message, INVALID_USER_PATTERNS)) return 'invalid_user_credentials';
  if (matchesAny(message, EMAIL_NOT_CONFIRMED_PATTERNS)) return 'email_not_confirmed';
  if (matchesAny(message, RATE_LIMIT_PATTERNS)) return 'rate_limited';
  return 'unknown_auth_error';
}

const FRIENDLY_MESSAGES: Record<AuthErrorCategory, string> = {
  connection_error:
    'Não foi possível conectar ao servidor de autenticação. Verifique sua conexão e a configuração do backend.',
  invalid_project_credentials:
    'Credenciais do projeto inválidas. Verifique se a URL e a chave de API no .env pertencem ao mesmo projeto.',
  invalid_user_credentials:
    'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
  email_not_confirmed:
    'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.',
  rate_limited:
    'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
  unknown_auth_error:
    'Ocorreu um erro inesperado na autenticação. Tente novamente.',
};

export function validateAuthEnv(): EnvValidationResult {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  const details: string[] = [];

  if (!url) details.push('VITE_SUPABASE_URL não está definida.');
  else if (!/^https?:\/\/.+/.test(url)) details.push(`VITE_SUPABASE_URL tem formato inválido: "${url}".`);

  if (!key) details.push('VITE_SUPABASE_PUBLISHABLE_KEY não está definida.');

  // Check if URL and key reference the same project
  if (url && key) {
    try {
      const urlRef = new URL(url).hostname.split('.')[0];
      const payload = JSON.parse(atob(key.split('.')[1]));
      const keyRef = payload?.ref;
      if (keyRef && urlRef !== keyRef) {
        details.push(`URL aponta para "${urlRef}" mas a chave pertence ao projeto "${keyRef}". Devem ser do mesmo projeto.`);
      }
    } catch {
      // Can't parse — skip cross-check
    }
  }

  const status = details.length === 0 ? 'ok' : (!url || !key ? 'missing' : 'invalid');

  return {
    status,
    details,
    url: url || undefined,
    maskedKey: key ? `${key.slice(0, 10)}...${key.slice(-6)}` : undefined,
  };
}

export async function pingAuthBackend(): Promise<PingResult> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!url) {
    return { reachable: false, cause: 'unreachable', message: 'URL do backend não configurada.' };
  }

  const endpoint = `${url}/auth/v1/settings`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const start = Date.now();

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      headers: { apikey: (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || '' },
    });
    const latencyMs = Date.now() - start;

    if (res.ok) {
      return { reachable: true, cause: 'ok', message: 'Backend acessível.', latencyMs };
    }

    // 401/403 with auth settings means invalid key
    if (res.status === 401 || res.status === 403) {
      try {
        const body = await res.json();
        const msg = body?.message || body?.msg || body?.error || '';
        if (matchesAny(String(msg), INVALID_PROJECT_PATTERNS)) {
          return {
            reachable: true,
            cause: 'invalid_key',
            message: 'Backend acessível, mas a chave de API é inválida ou não pertence a este projeto.',
            latencyMs,
          };
        }
      } catch {
        // couldn't parse body
      }
      return {
        reachable: true,
        cause: 'invalid_key',
        message: 'Backend acessível, mas a autenticação da chave falhou (401/403).',
        latencyMs,
      };
    }

    return { reachable: false, cause: 'unknown', message: `Backend respondeu com status ${res.status}.`, latencyMs };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { reachable: false, cause: 'timeout', message: 'Timeout ao conectar ao backend (>5s).' };
    }
    if (err.message?.includes('ERR_NAME_NOT_RESOLVED') || err.message?.includes('ENOTFOUND')) {
      return { reachable: false, cause: 'dns', message: 'DNS não resolvido. Verifique a URL do backend.' };
    }
    return { reachable: false, cause: 'unreachable', message: 'Não foi possível conectar ao backend.' };
  } finally {
    clearTimeout(timeout);
  }
}

export function normalizeAuthError(error: unknown): NormalizedAuthError {
  const originalMessage = error instanceof Error ? error.message : String(error);
  const category = classifyAuthError(originalMessage);

  return {
    message: FRIENDLY_MESSAGES[category],
    category,
    isConnectionError: category === 'connection_error',
    originalMessage,
  };
}
