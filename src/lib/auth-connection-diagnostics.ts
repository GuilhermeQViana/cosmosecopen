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
  cause: 'ok' | 'unreachable' | 'timeout' | 'cors' | 'dns' | 'unknown';
  message: string;
  latencyMs?: number;
}

export interface NormalizedAuthError {
  message: string;
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

export function isConnectionError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return CONNECTION_ERROR_PATTERNS.some((p) => msg.includes(p));
}

export function validateAuthEnv(): EnvValidationResult {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  const details: string[] = [];

  if (!url) details.push('VITE_SUPABASE_URL não está definida.');
  else if (!/^https?:\/\/.+/.test(url)) details.push(`VITE_SUPABASE_URL tem formato inválido: "${url}".`);

  if (!key) details.push('VITE_SUPABASE_PUBLISHABLE_KEY não está definida.');

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

    if (res.ok || res.status === 401 || res.status === 403) {
      return { reachable: true, cause: 'ok', message: 'Backend acessível.', latencyMs };
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
  const connError = isConnectionError(error);

  if (connError) {
    return {
      message: 'Não foi possível conectar ao servidor de autenticação. Verifique sua conexão e a configuração do backend.',
      isConnectionError: true,
      originalMessage,
    };
  }

  return {
    message: originalMessage,
    isConnectionError: false,
    originalMessage,
  };
}
