import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import type { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];

export interface ActionPlan {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  ai_generated: boolean | null;
  assessment_id: string | null;
  created_by: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ActionPlanTask {
  id: string;
  action_plan_id: string;
  title: string;
  completed: boolean | null;
  order_index: number;
  created_at: string;
}

export interface ActionPlanComment {
  id: string;
  action_plan_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

export function useActionPlans() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['action-plans', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ActionPlan[];
    },
    enabled: !!organization?.id,
  });
}

export function useActionPlan(planId: string | null) {
  return useQuery({
    queryKey: ['action-plan', planId],
    queryFn: async () => {
      if (!planId) return null;

      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .eq('id', planId)
        .maybeSingle();

      if (error) throw error;
      return data as ActionPlan | null;
    },
    enabled: !!planId,
  });
}

export function useActionPlanTasks(planId: string | null) {
  return useQuery({
    queryKey: ['action-plan-tasks', planId],
    queryFn: async () => {
      if (!planId) return [];

      const { data, error } = await supabase
        .from('action_plan_tasks')
        .select('*')
        .eq('action_plan_id', planId)
        .order('order_index');

      if (error) throw error;
      return data as ActionPlanTask[];
    },
    enabled: !!planId,
  });
}

export function useCreateActionPlan() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (plan: Omit<ActionPlan, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'created_by' | 'completed_at'>) => {
      if (!organization?.id) throw new Error('No organization');

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('action_plans')
        .insert({
          ...plan,
          organization_id: organization.id,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
    },
  });
}

export function useUpdateActionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...plan }: Partial<ActionPlan> & { id: string }) => {
      const updateData: Partial<ActionPlan> = { ...plan };
      
      // If status is changing to 'done', set completed_at
      if (plan.status === 'done') {
        updateData.completed_at = new Date().toISOString();
      } else if (plan.status) {
        updateData.completed_at = null;
      }

      const { data, error } = await supabase
        .from('action_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
      queryClient.invalidateQueries({ queryKey: ['action-plan', variables.id] });
    },
  });
}

export function useDeleteActionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('action_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, title }: { planId: string; title: string }) => {
      // Get current max order_index
      const { data: existing } = await supabase
        .from('action_plan_tasks')
        .select('order_index')
        .eq('action_plan_id', planId)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

      const { data, error } = await supabase
        .from('action_plan_tasks')
        .insert({
          action_plan_id: planId,
          title,
          order_index: nextIndex,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['action-plan-tasks', variables.planId] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, planId, ...data }: { id: string; planId: string; completed?: boolean; title?: string }) => {
      const { error } = await supabase
        .from('action_plan_tasks')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      return { id, planId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['action-plan-tasks', variables.planId] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase.from('action_plan_tasks').delete().eq('id', id);
      if (error) throw error;
      return { planId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['action-plan-tasks', variables.planId] });
    },
  });
}

export const STATUS_COLUMNS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'backlog', label: 'Backlog', color: 'bg-slate-500' },
  { value: 'todo', label: 'A Fazer', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'Em Progresso', color: 'bg-yellow-500' },
  { value: 'review', label: 'Revisão', color: 'bg-purple-500' },
  { value: 'done', label: 'Concluído', color: 'bg-green-500' },
];

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'critica', label: 'Crítica', color: 'bg-red-500 text-white' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-500 text-white' },
  { value: 'media', label: 'Média', color: 'bg-yellow-500 text-black' },
  { value: 'baixa', label: 'Baixa', color: 'bg-green-500 text-white' },
];
