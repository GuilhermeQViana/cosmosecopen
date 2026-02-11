import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface VendorSLA {
  id: string;
  vendor_id: string;
  organization_id: string;
  contract_id: string | null;
  metric_name: string;
  target_value: number;
  unit: string;
  current_value: number | null;
  compliance_status: string;
  period: string;
  measured_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const SLA_UNITS = [
  { value: 'percentual', label: '%' },
  { value: 'horas', label: 'Horas' },
  { value: 'minutos', label: 'Minutos' },
  { value: 'dias', label: 'Dias' },
];

export const SLA_PERIODS = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
];

export const SLA_COMPLIANCE = [
  { value: 'conforme', label: 'Conforme', color: 'bg-green-500' },
  { value: 'atencao', label: 'Atenção', color: 'bg-yellow-500' },
  { value: 'violado', label: 'Violado', color: 'bg-red-500' },
];

export function useVendorSLAs(vendorId: string | null | undefined) {
  return useQuery({
    queryKey: ['vendor-slas', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('vendor_slas')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as VendorSLA[];
    },
    enabled: !!vendorId,
  });
}

export function useCreateVendorSLA() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (sla: Omit<VendorSLA, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      if (!organization?.id) throw new Error('No organization');
      const { data, error } = await supabase
        .from('vendor_slas')
        .insert({ ...sla, organization_id: organization.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-slas', variables.vendor_id] });
    },
  });
}

export function useUpdateVendorSLA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...sla }: Partial<VendorSLA> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendor_slas')
        .update(sla)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-slas', (data as any).vendor_id] });
    },
  });
}

export function useDeleteVendorSLA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, vendorId }: { id: string; vendorId: string }) => {
      const { error } = await supabase.from('vendor_slas').delete().eq('id', id);
      if (error) throw error;
      return vendorId;
    },
    onSuccess: (vendorId) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-slas', vendorId] });
    },
  });
}
