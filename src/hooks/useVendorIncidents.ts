import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface VendorIncident {
  id: string;
  vendor_id: string;
  organization_id: string;
  incident_date: string;
  reported_date: string | null;
  resolved_date: string | null;
  severity: string;
  category: string;
  title: string;
  description: string | null;
  root_cause: string | null;
  corrective_actions: string | null;
  impact_description: string | null;
  reported_by: string | null;
  resolved_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const INCIDENT_SEVERITIES = [
  { value: 'baixa', label: 'Baixa', color: 'bg-green-500' },
  { value: 'media', label: 'Média', color: 'bg-yellow-500' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-500' },
  { value: 'critica', label: 'Crítica', color: 'bg-red-500' },
];

export const INCIDENT_CATEGORIES = [
  { value: 'vazamento_dados', label: 'Vazamento de Dados' },
  { value: 'indisponibilidade', label: 'Indisponibilidade' },
  { value: 'violacao_sla', label: 'Violação de SLA' },
  { value: 'acesso_nao_autorizado', label: 'Acesso Não Autorizado' },
  { value: 'outro', label: 'Outro' },
];

export const INCIDENT_STATUS = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'em_investigacao', label: 'Em Investigação' },
  { value: 'resolvido', label: 'Resolvido' },
  { value: 'encerrado', label: 'Encerrado' },
];

export function useVendorIncidents(vendorId: string | null | undefined) {
  return useQuery({
    queryKey: ['vendor-incidents', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('vendor_incidents')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('incident_date', { ascending: false });
      if (error) throw error;
      return data as VendorIncident[];
    },
    enabled: !!vendorId,
  });
}

export function useCreateVendorIncident() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (incident: Omit<VendorIncident, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'reported_by' | 'resolved_by'>) => {
      if (!organization?.id) throw new Error('No organization');
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('vendor_incidents')
        .insert({ ...incident, organization_id: organization.id, reported_by: user.user?.id || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-incidents', variables.vendor_id] });
    },
  });
}

export function useUpdateVendorIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...incident }: Partial<VendorIncident> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendor_incidents')
        .update(incident)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-incidents', (data as any).vendor_id] });
    },
  });
}

export function useDeleteVendorIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, vendorId }: { id: string; vendorId: string }) => {
      const { error } = await supabase.from('vendor_incidents').delete().eq('id', id);
      if (error) throw error;
      return vendorId;
    },
    onSuccess: (vendorId) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-incidents', vendorId] });
    },
  });
}
