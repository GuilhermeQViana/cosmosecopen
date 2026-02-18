import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  const { organization } = useAuth();
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
  const { organization, user } = useAuth();

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

export function useUpdateQualificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; name?: string; description?: string; status?: string; score_ranges?: any; auto_approve_threshold?: number }) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('qualification_templates')
        .update(updates)
        .eq('id', id)
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
