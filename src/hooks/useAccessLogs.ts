import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface AccessLog {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  user_id: string | null;
  ip_address: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface AccessLogFilters {
  action?: string;
  entityType?: string;
  userId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UseAccessLogsOptions {
  page?: number;
  pageSize?: number;
  filters?: AccessLogFilters;
}

export function useAccessLogs(options: UseAccessLogsOptions = {}) {
  const { organization } = useOrganization();
  const { page = 1, pageSize = 20, filters = {} } = options;

  return useQuery({
    queryKey: ['access-logs', organization?.id, page, pageSize, filters],
    queryFn: async () => {
      if (!organization?.id) return { data: [], totalCount: 0, totalPages: 0 };

      // Build the query
      let query = supabase
        .from('access_logs')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.action && filters.action !== 'all') {
        query = query.eq('action', filters.action);
      }

      if (filters.entityType && filters.entityType !== 'all') {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters.userId && filters.userId !== 'all') {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        // Set end date to end of day
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch profiles for users
      const userIds = [...new Set(data?.filter(l => l.user_id).map(l => l.user_id as string) || [])];
      
      let logsWithProfiles = data || [];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

        logsWithProfiles = data?.map(log => ({
          ...log,
          profile: log.user_id ? profilesMap.get(log.user_id) : null,
        })) || [];
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: logsWithProfiles as AccessLog[],
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
      };
    },
    enabled: !!organization?.id,
    placeholderData: keepPreviousData,
  });
}

export function useAccessLogsStats() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['access-logs-stats', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return { total: 0, today: 0, creates: 0, updates: 0, deletes: 0 };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get total count
      const { count: total } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id);

      // Get today's count
      const { count: todayCount } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .gte('created_at', today.toISOString());

      // Get counts by action type
      const { count: creates } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('action', 'create');

      const { count: updates } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('action', 'update');

      const { count: deletes } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('action', 'delete');

      return {
        total: total || 0,
        today: todayCount || 0,
        creates: creates || 0,
        updates: updates || 0,
        deletes: deletes || 0,
      };
    },
    enabled: !!organization?.id,
  });
}
