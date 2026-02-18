/**
 * Logger utilitário que só emite logs em desenvolvimento.
 * Em produção, todos os logs são silenciados para não poluir o console do usuário.
 */
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Errors são sempre logados (úteis para debugging mesmo em produção)
    console.error(...args);
  },
  /** Log de desenvolvimento com prefixo */
  debug: (prefix: string, message: string, data?: unknown) => {
    if (isDev) {
      const dataStr = data !== undefined ? ` ${JSON.stringify(data)}` : '';
      console.log(`[${prefix}] ${message}${dataStr}`);
    }
  },
};
