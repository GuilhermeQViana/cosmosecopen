import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomFramework {
  id: string;
  name: string;
  code: string;
  version: string | null;
  description: string | null;
  icon: string | null;
  organization_id: string | null;
  is_custom: boolean;
  created_by: string | null;
  created_at: string;
  controls_count?: number;
}

export interface CreateFrameworkInput {
  name: string;
  code: string;
  version?: string;
  description?: string;
  icon?: string;
}

export interface ControlInput {
  code: string;
  name: string;
  category?: string;
  description?: string;
  weight?: number;
  criticality?: string;
  weight_reason?: string;
  implementation_example?: string;
  evidence_example?: string;
  order_index?: number;
}

export function useCustomFrameworks() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['custom-frameworks', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data: frameworks, error } = await supabase
        .from('frameworks')
        .select('*')
        .eq('is_custom', true)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch control counts for each framework
      const frameworksWithCounts = await Promise.all(
        (frameworks || []).map(async (framework) => {
          const { count } = await supabase
            .from('controls')
            .select('*', { count: 'exact', head: true })
            .eq('framework_id', framework.id);

          return {
            ...framework,
            controls_count: count || 0,
          } as CustomFramework;
        })
      );

      return frameworksWithCounts;
    },
    enabled: !!organization?.id,
  });
}

export function useCreateCustomFramework() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateFrameworkInput) => {
      if (!organization?.id || !user?.id) {
        throw new Error('Organização ou usuário não encontrado');
      }

      const { data, error } = await supabase
        .from('frameworks')
        .insert({
          name: input.name,
          code: input.code,
          version: input.version || null,
          description: input.description || null,
          icon: input.icon || 'shield',
          organization_id: organization.id,
          is_custom: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-frameworks'] });
      queryClient.invalidateQueries({ queryKey: ['frameworks'] });
    },
  });
}

export function useUpdateCustomFramework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: CreateFrameworkInput & { id: string }) => {
      const { data, error } = await supabase
        .from('frameworks')
        .update({
          name: input.name,
          code: input.code,
          version: input.version || null,
          description: input.description || null,
          icon: input.icon || 'shield',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-frameworks'] });
      queryClient.invalidateQueries({ queryKey: ['frameworks'] });
    },
  });
}

export function useDeleteCustomFramework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (frameworkId: string) => {
      // First delete all controls
      const { error: controlsError } = await supabase
        .from('controls')
        .delete()
        .eq('framework_id', frameworkId);

      if (controlsError) throw controlsError;

      // Then delete the framework
      const { error } = await supabase
        .from('frameworks')
        .delete()
        .eq('id', frameworkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-frameworks'] });
      queryClient.invalidateQueries({ queryKey: ['frameworks'] });
    },
  });
}

export function useFrameworkControls(frameworkId: string | null) {
  return useQuery({
    queryKey: ['framework-controls', frameworkId],
    queryFn: async () => {
      if (!frameworkId) return [];

      const { data, error } = await supabase
        .from('controls')
        .select('*')
        .eq('framework_id', frameworkId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!frameworkId,
  });
}

export function useCreateControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ frameworkId, ...input }: ControlInput & { frameworkId: string }) => {
      const { data, error } = await supabase
        .from('controls')
        .insert({
          framework_id: frameworkId,
          code: input.code,
          name: input.name,
          category: input.category || null,
          description: input.description || null,
          weight: input.weight || 1,
          criticality: input.criticality || null,
          weight_reason: input.weight_reason || null,
          implementation_example: input.implementation_example || null,
          evidence_example: input.evidence_example || null,
          order_index: input.order_index || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['framework-controls', variables.frameworkId] });
      queryClient.invalidateQueries({ queryKey: ['custom-frameworks'] });
    },
  });
}

export function useUpdateControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, frameworkId, ...input }: ControlInput & { id: string; frameworkId: string }) => {
      const { data, error } = await supabase
        .from('controls')
        .update({
          code: input.code,
          name: input.name,
          category: input.category || null,
          description: input.description || null,
          weight: input.weight || 1,
          criticality: input.criticality || null,
          weight_reason: input.weight_reason || null,
          implementation_example: input.implementation_example || null,
          evidence_example: input.evidence_example || null,
          order_index: input.order_index,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['framework-controls', variables.frameworkId] });
    },
  });
}

export function useDeleteControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, frameworkId }: { id: string; frameworkId: string }) => {
      const { error } = await supabase
        .from('controls')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['framework-controls', variables.frameworkId] });
      queryClient.invalidateQueries({ queryKey: ['custom-frameworks'] });
    },
  });
}

export function useBulkCreateControls() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ frameworkId, controls }: { frameworkId: string; controls: ControlInput[] }) => {
      const controlsToInsert = controls.map((control, index) => ({
        framework_id: frameworkId,
        code: control.code,
        name: control.name,
        category: control.category || null,
        description: control.description || null,
        weight: control.weight || 1,
        criticality: control.criticality || null,
        weight_reason: control.weight_reason || null,
        implementation_example: control.implementation_example || null,
        evidence_example: control.evidence_example || null,
        order_index: control.order_index ?? index,
      }));

      const { data, error } = await supabase
        .from('controls')
        .insert(controlsToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['framework-controls', variables.frameworkId] });
      queryClient.invalidateQueries({ queryKey: ['custom-frameworks'] });
    },
  });
}
