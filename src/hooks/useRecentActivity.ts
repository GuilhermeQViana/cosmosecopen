import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface ActivityItem {
  id: string;
  type: 'assessment' | 'risk' | 'evidence' | 'action_plan';
  message: string;
  user: string;
  timestamp: Date;
  iconType: 'check' | 'alert' | 'file' | 'target';
  iconColor: string;
}

export function useRecentActivity(limit: number = 10) {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['recent-activity', organization?.id, limit],
    queryFn: async () => {
      if (!organization?.id) return [];

      const activities: ActivityItem[] = [];

      // Fetch recent assessments
      const { data: assessments } = await supabase
        .from('assessments')
        .select(`
          id,
          assessed_at,
          status,
          control_id,
          assessed_by,
          controls!inner(code, name)
        `)
        .eq('organization_id', organization.id)
        .not('assessed_at', 'is', null)
        .order('assessed_at', { ascending: false })
        .limit(5);

      if (assessments) {
        for (const a of assessments) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', a.assessed_by)
            .maybeSingle();

          const control = a.controls as unknown as { code: string; name: string };
          activities.push({
            id: `assessment-${a.id}`,
            type: 'assessment',
            message: `Controle ${control?.code} avaliado como ${a.status}`,
            user: profile?.full_name || 'Usuário',
            timestamp: new Date(a.assessed_at!),
            iconType: 'check',
            iconColor: 'text-[hsl(var(--success))]',
          });
        }
      }

      // Fetch recent risks
      const { data: risks } = await supabase
        .from('risks')
        .select(`
          id,
          updated_at,
          code,
          title,
          created_by
        `)
        .eq('organization_id', organization.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (risks) {
        for (const r of risks) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', r.created_by)
            .maybeSingle();

          activities.push({
            id: `risk-${r.id}`,
            type: 'risk',
            message: `Risco ${r.code} - ${r.title} atualizado`,
            user: profile?.full_name || 'Usuário',
            timestamp: new Date(r.updated_at),
            iconType: 'alert',
            iconColor: 'text-[hsl(var(--risk-high))]',
          });
        }
      }

      // Fetch recent evidences
      const { data: evidences } = await supabase
        .from('evidences')
        .select(`
          id,
          created_at,
          name,
          uploaded_by
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (evidences) {
        for (const e of evidences) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', e.uploaded_by)
            .maybeSingle();

          activities.push({
            id: `evidence-${e.id}`,
            type: 'evidence',
            message: `Evidência "${e.name}" enviada`,
            user: profile?.full_name || 'Usuário',
            timestamp: new Date(e.created_at),
            iconType: 'file',
            iconColor: 'text-primary',
          });
        }
      }

      // Fetch recent action plans
      const { data: actionPlans } = await supabase
        .from('action_plans')
        .select(`
          id,
          updated_at,
          title,
          status,
          created_by
        `)
        .eq('organization_id', organization.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (actionPlans) {
        for (const ap of actionPlans) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', ap.created_by)
            .maybeSingle();

          activities.push({
            id: `action_plan-${ap.id}`,
            type: 'action_plan',
            message: `Plano "${ap.title}" atualizado para ${ap.status}`,
            user: profile?.full_name || 'Usuário',
            timestamp: new Date(ap.updated_at),
            iconType: 'target',
            iconColor: 'text-[hsl(var(--warning))]',
          });
        }
      }

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    },
    enabled: !!organization?.id,
  });
}
