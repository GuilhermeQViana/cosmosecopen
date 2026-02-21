import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface GeneratedReport {
  id: string;
  organization_id: string;
  user_id: string | null;
  report_type: string;
  framework_id: string | null;
  period: string | null;
  file_name: string;
  created_at: string;
}

export function useGeneratedReports() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['generated-reports', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as GeneratedReport[];
    },
    enabled: !!organization?.id,
  });
}

export function useLogGeneratedReport() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (report: { report_type: string; framework_id?: string | null; period?: string; file_name: string }) => {
      if (!organization?.id) throw new Error('No organization');

      const { error } = await supabase
        .from('generated_reports')
        .insert({
          organization_id: organization.id,
          user_id: user?.id || null,
          report_type: report.report_type,
          framework_id: report.framework_id || null,
          period: report.period || null,
          file_name: report.file_name,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
    },
  });
}
