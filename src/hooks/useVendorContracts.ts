import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface VendorContract {
  id: string;
  vendor_id: string;
  organization_id: string;
  contract_number: string | null;
  contract_type: string;
  start_date: string | null;
  end_date: string | null;
  renewal_date: string | null;
  value: number | null;
  currency: string;
  billing_frequency: string | null;
  auto_renewal: boolean;
  security_clauses: boolean;
  lgpd_clauses: boolean;
  sla_defined: boolean;
  file_path: string | null;
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const CONTRACT_TYPES = [
  { value: 'servico', label: 'Serviço' },
  { value: 'licenca', label: 'Licença' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'outsourcing', label: 'Outsourcing' },
  { value: 'outro', label: 'Outro' },
];

export const CONTRACT_STATUS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'renovado', label: 'Renovado' },
];

export const BILLING_FREQUENCIES = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
  { value: 'unico', label: 'Pagamento Único' },
];

export function useVendorContracts(vendorId: string | null | undefined) {
  return useQuery({
    queryKey: ['vendor-contracts', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('vendor_contracts')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as VendorContract[];
    },
    enabled: !!vendorId,
  });
}

export function useCreateVendorContract() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (contract: Omit<VendorContract, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'created_by'>) => {
      if (!organization?.id) throw new Error('No organization');
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('vendor_contracts')
        .insert({ ...contract, organization_id: organization.id, created_by: user.user?.id || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts', variables.vendor_id] });
    },
  });
}

export function useUpdateVendorContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...contract }: Partial<VendorContract> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendor_contracts')
        .update(contract)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts', (data as any).vendor_id] });
    },
  });
}

export function useDeleteVendorContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, vendorId }: { id: string; vendorId: string }) => {
      const { error } = await supabase.from('vendor_contracts').delete().eq('id', id);
      if (error) throw error;
      return vendorId;
    },
    onSuccess: (vendorId) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts', vendorId] });
    },
  });
}
