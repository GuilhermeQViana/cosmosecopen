import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface QualificationTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  version: number;
  status: string;
  score_ranges: any;
  auto_approve_threshold: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useQualificationTemplates() {
  const { organization } = useOrganization();
  const orgId = organization?.id;

  return useQuery({
    queryKey: ['qualification-templates', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qualification_templates')
        .select('*')
        .eq('organization_id', orgId!)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as QualificationTemplate[];
    },
    enabled: !!orgId,
  });
}

export function useCreateQualificationTemplate() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('qualification_templates')
        .insert({
          organization_id: organization!.id,
          name: input.name,
          description: input.description || null,
          created_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as QualificationTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualification-templates'] });
    },
  });
}

/**
 * Check if a template has campaigns with responses (respondido, em_analise, aprovado, reprovado).
 * If so, editing requires version increment.
 */
async function hasRespondedCampaigns(templateId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('qualification_campaigns')
    .select('id')
    .eq('template_id', templateId)
    .in('status', ['respondido', 'em_analise', 'aprovado', 'reprovado'])
    .limit(1);
  if (error) return false;
  return (data?.length || 0) > 0;
}

export function useUpdateQualificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      description?: string;
      status?: string;
      score_ranges?: any;
      auto_approve_threshold?: number;
      /** Set to true to force version increment (when questions changed on a published template with responses) */
      incrementVersion?: boolean;
    }) => {
      const { id, incrementVersion, ...updates } = input;

      // Check if we need to auto-increment version
      let shouldIncrement = incrementVersion === true;

      if (!shouldIncrement && Object.keys(updates).length > 0) {
        // If it's a published template and has responded campaigns, increment
        const { data: template } = await supabase
          .from('qualification_templates')
          .select('status, version')
          .eq('id', id)
          .single();

        if (template?.status === 'publicado') {
          shouldIncrement = await hasRespondedCampaigns(id);
        }
      }

      const updatePayload: any = { ...updates };
      if (shouldIncrement) {
        // Get current version to increment
        const { data: current } = await supabase
          .from('qualification_templates')
          .select('version')
          .eq('id', id)
          .single();
        if (current) {
          updatePayload.version = current.version + 1;
        }
      }

      const { data, error } = await supabase
        .from('qualification_templates')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { ...(data as QualificationTemplate), versionIncremented: shouldIncrement };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualification-templates'] });
    },
  });
}

export function useDeleteQualificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('qualification_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualification-templates'] });
    },
  });
}

/**
 * Hook to check if a template has responded campaigns (for versioning warnings).
 */
export function useTemplateHasResponses(templateId: string | undefined) {
  return useQuery({
    queryKey: ['template-has-responses', templateId],
    queryFn: () => hasRespondedCampaigns(templateId!),
    enabled: !!templateId,
  });
}
