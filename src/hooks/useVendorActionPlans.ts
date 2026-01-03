import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];

export interface VendorActionPlan {
  id: string;
  vendor_id: string;
  organization_id: string;
  assessment_id: string | null;
  requirement_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: string | null;
  created_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    code: string;
    name: string;
  } | null;
  requirement?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export function useVendorActionPlans(vendorId?: string) {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['vendor-action-plans', organization?.id, vendorId],
    queryFn: async () => {
      if (!organization?.id) return [];

      let query = supabase
        .from('vendor_action_plans')
        .select(`
          *,
          vendor:vendors(id, code, name),
          requirement:vendor_requirements(id, code, name)
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as VendorActionPlan[];
    },
    enabled: !!organization?.id,
  });
}

export function useCreateVendorActionPlan() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (
      plan: Omit<VendorActionPlan, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'created_by'>
    ) => {
      if (!organization?.id) throw new Error('No organization');

      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('vendor_action_plans')
        .insert({
          ...plan,
          organization_id: organization.id,
          created_by: user.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-action-plans'] });
    },
  });
}

export function useUpdateVendorActionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...plan }: Partial<VendorActionPlan> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...plan };

      // Handle status change to done
      if (plan.status === 'done' && !plan.completed_at) {
        updateData.completed_at = new Date().toISOString();
      } else if (plan.status && plan.status !== 'done') {
        updateData.completed_at = null;
      }

      const { data, error } = await supabase
        .from('vendor_action_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-action-plans'] });
    },
  });
}

export function useDeleteVendorActionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vendor_action_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-action-plans'] });
    },
  });
}

export const VENDOR_ACTION_STATUS = [
  { value: 'backlog', label: 'Backlog', color: 'bg-slate-500' },
  { value: 'todo', label: 'A Fazer', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'Em Andamento', color: 'bg-amber-500' },
  { value: 'review', label: 'Em Revisão', color: 'bg-purple-500' },
  { value: 'done', label: 'Concluído', color: 'bg-green-500' },
] as const;

export const VENDOR_ACTION_PRIORITY = [
  { value: 'critica', label: 'Crítica', color: 'bg-red-500' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-500' },
  { value: 'media', label: 'Média', color: 'bg-yellow-500' },
  { value: 'baixa', label: 'Baixa', color: 'bg-green-500' },
] as const;
