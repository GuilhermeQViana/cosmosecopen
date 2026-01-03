import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';
import type { Json } from '@/integrations/supabase/types';

export type LogAction = 
  | 'login' 
  | 'logout' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'export' 
  | 'assess'
  | 'import';

export type LogEntityType = 
  | 'assessment' 
  | 'assessments'
  | 'risk' 
  | 'risks'
  | 'evidence' 
  | 'evidences'
  | 'action_plan' 
  | 'action_plans'
  | 'control' 
  | 'controls'
  | 'user' 
  | 'organization'
  | 'report'
  | 'backup'
  | 'session';

interface LogEventOptions {
  action: LogAction;
  entityType?: LogEntityType;
  entityId?: string;
  details?: Json;
  ipAddress?: string;
}

/**
 * Hook para registrar eventos de log de acesso manualmente.
 * Os triggers automáticos no banco já capturam CREATE/UPDATE/DELETE,
 * mas este hook é útil para eventos customizados como login/logout/export.
 */
export function useAccessLog() {
  const { user } = useAuth();

  const logEvent = useCallback(async (options: LogEventOptions) => {
    try {
      if (!user?.id) {
        console.warn('[useAccessLog] No authenticated user, skipping log');
        return null;
      }

      const { action, entityType, entityId, details, ipAddress } = options;

      // Usa a função RPC log_access_event para contornar RLS
      const { data, error } = await supabase.rpc('log_access_event', {
        _action: action,
        _entity_type: entityType || null,
        _entity_id: entityId || null,
        _details: details || null,
        _ip_address: ipAddress || null,
      });

      if (error) {
        console.error('[useAccessLog] Error logging event:', error);
        return null;
      }

      console.log(`[useAccessLog] Logged: ${action} ${entityType || ''}`, { entityId, details });
      return data;
    } catch (err) {
      console.error('[useAccessLog] Exception:', err);
      return null;
    }
  }, [user?.id]);

  const logLogin = useCallback(async (email: string) => {
    return logEvent({
      action: 'login',
      entityType: 'session',
      details: { email, timestamp: new Date().toISOString() } as Json,
    });
  }, [logEvent]);

  const logLogout = useCallback(async () => {
    return logEvent({
      action: 'logout',
      entityType: 'session',
      details: { timestamp: new Date().toISOString() } as Json,
    });
  }, [logEvent]);

  const logExport = useCallback(async (exportType: string, format: string, recordCount?: number) => {
    return logEvent({
      action: 'export',
      entityType: 'report',
      details: { 
        exportType, 
        format, 
        recordCount,
        timestamp: new Date().toISOString() 
      } as Json,
    });
  }, [logEvent]);

  const logImport = useCallback(async (importType: string, recordCount: number) => {
    return logEvent({
      action: 'import',
      entityType: 'backup',
      details: { 
        importType, 
        recordCount,
        timestamp: new Date().toISOString() 
      } as Json,
    });
  }, [logEvent]);

  return {
    logEvent,
    logLogin,
    logLogout,
    logExport,
    logImport,
  };
}

/**
 * Função standalone para logging (útil em contextos fora de componentes React)
 * Não usa hooks, então pode ser chamada em qualquer lugar.
 */
export async function logAccessEvent(options: {
  action: LogAction;
  entityType?: LogEntityType;
  entityId?: string;
  details?: Json;
  ipAddress?: string;
}) {
  try {
    const { data, error } = await supabase.rpc('log_access_event', {
      _action: options.action,
      _entity_type: options.entityType || null,
      _entity_id: options.entityId || null,
      _details: options.details || null,
      _ip_address: options.ipAddress || null,
    });

    if (error) {
      console.error('[logAccessEvent] Error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[logAccessEvent] Exception:', err);
    return null;
  }
}
