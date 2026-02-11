import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface VendorOffboarding {
  id: string;
  vendor_id: string;
  organization_id: string;
  reason: string;
  initiated_at: string | null;
  completed_at: string | null;
  initiated_by: string | null;
  status: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface VendorOffboardingTask {
  id: string;
  offboarding_id: string;
  task_name: string;
  category: string;
  status: string;
  completed_by: string | null;
  completed_at: string | null;
  observations: string | null;
  order_index: number;
  created_at: string | null;
}

export const OFFBOARDING_REASONS = [
  { value: 'fim_contrato', label: 'Fim do Contrato' },
  { value: 'desempenho', label: 'Desempenho Insatisfatório' },
  { value: 'risco', label: 'Risco Elevado' },
  { value: 'custo', label: 'Redução de Custos' },
  { value: 'outro', label: 'Outro' },
];

export const DEFAULT_OFFBOARDING_TASKS = [
  { category: 'acessos', task_name: 'Revogar credenciais VPN', order_index: 0 },
  { category: 'acessos', task_name: 'Revogar acessos a sistemas internos', order_index: 1 },
  { category: 'acessos', task_name: 'Desativar contas de serviço', order_index: 2 },
  { category: 'dados', task_name: 'Solicitar devolução de dados', order_index: 3 },
  { category: 'dados', task_name: 'Confirmar destruição de cópias', order_index: 4 },
  { category: 'dados', task_name: 'Obter certificado de destruição', order_index: 5 },
  { category: 'legal', task_name: 'Encerrar contrato formalmente', order_index: 6 },
  { category: 'legal', task_name: 'Verificar cláusulas pós-contratuais', order_index: 7 },
  { category: 'legal', task_name: 'Confirmar período de confidencialidade', order_index: 8 },
  { category: 'financeiro', task_name: 'Verificar pagamentos pendentes', order_index: 9 },
  { category: 'financeiro', task_name: 'Encerrar faturamento recorrente', order_index: 10 },
];

export function useVendorOffboarding(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-offboarding', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const { data, error } = await supabase
        .from('vendor_offboarding')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as VendorOffboarding | null;
    },
    enabled: !!vendorId,
  });
}

export function useOffboardingTasks(offboardingId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-offboarding-tasks', offboardingId],
    queryFn: async () => {
      if (!offboardingId) return [];
      const { data, error } = await supabase
        .from('vendor_offboarding_tasks')
        .select('*')
        .eq('offboarding_id', offboardingId)
        .order('order_index');
      if (error) throw error;
      return data as VendorOffboardingTask[];
    },
    enabled: !!offboardingId,
  });
}

export function useStartOffboarding() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async ({ vendorId, reason, notes }: { vendorId: string; reason: string; notes?: string }) => {
      if (!organization?.id) throw new Error('No organization');
      const { data: user } = await supabase.auth.getUser();

      // Create offboarding record
      const { data: offboarding, error } = await supabase
        .from('vendor_offboarding')
        .insert({
          vendor_id: vendorId,
          organization_id: organization.id,
          reason,
          notes: notes || null,
          initiated_by: user.user?.id || null,
          status: 'iniciado',
        })
        .select()
        .single();
      if (error) throw error;

      // Create default tasks
      const tasks = DEFAULT_OFFBOARDING_TASKS.map((t) => ({
        offboarding_id: offboarding.id,
        ...t,
      }));
      const { error: tasksError } = await supabase
        .from('vendor_offboarding_tasks')
        .insert(tasks);
      if (tasksError) throw tasksError;

      // Update vendor lifecycle stage
      await supabase
        .from('vendors')
        .update({ lifecycle_stage: 'em_offboarding' })
        .eq('id', vendorId);

      return offboarding;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-offboarding', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useUpdateOffboardingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, observations }: { id: string; status: string; observations?: string }) => {
      const updates: any = { status };
      if (observations !== undefined) updates.observations = observations;
      if (status === 'concluido') {
        const { data: user } = await supabase.auth.getUser();
        updates.completed_by = user.user?.id || null;
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_by = null;
        updates.completed_at = null;
      }
      const { data, error } = await supabase
        .from('vendor_offboarding_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-offboarding-tasks'] });
    },
  });
}

export function useCompleteOffboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ offboardingId, vendorId }: { offboardingId: string; vendorId: string }) => {
      const { error } = await supabase
        .from('vendor_offboarding')
        .update({ status: 'concluido', completed_at: new Date().toISOString() })
        .eq('id', offboardingId);
      if (error) throw error;

      await supabase
        .from('vendors')
        .update({ lifecycle_stage: 'inativo', status: 'inativo' })
        .eq('id', vendorId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-offboarding', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}
