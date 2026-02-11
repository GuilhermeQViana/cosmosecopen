import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface Vendor {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  criticality: string;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contract_start: string | null;
  contract_end: string | null;
  next_assessment_date: string | null;
  lifecycle_stage: string;
  data_classification: string | null;
  service_type: string | null;
  contract_value: number | null;
  contract_currency: string;
  organization_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_assessment?: VendorAssessmentSummary | null;
  assessments_count?: number;
}

export interface VendorAssessmentSummary {
  id: string;
  assessment_date: string;
  status: string;
  overall_score: number | null;
  risk_level: string | null;
}

export const VENDOR_CATEGORIES = [
  'Tecnologia',
  'Cloud',
  'Serviços',
  'Consultoria',
  'Infraestrutura',
  'Segurança',
  'Telecom',
  'Outros',
];

export const VENDOR_CRITICALITY = [
  { value: 'critica', label: 'Crítica', color: 'bg-red-500' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-500' },
  { value: 'media', label: 'Média', color: 'bg-yellow-500' },
  { value: 'baixa', label: 'Baixa', color: 'bg-green-500' },
];

export const VENDOR_STATUS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'em_avaliacao', label: 'Em Avaliação' },
  { value: 'bloqueado', label: 'Bloqueado' },
];

export function getRiskLevelFromScore(score: number | null): string {
  if (score === null) return 'nao_avaliado';
  if (score >= 80) return 'baixo';
  if (score >= 60) return 'medio';
  if (score >= 40) return 'alto';
  return 'critico';
}

export function getRiskLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
    critico: 'Crítico',
    nao_avaliado: 'Não Avaliado',
  };
  return labels[level] || 'Não Avaliado';
}

export function getRiskLevelColor(level: string): string {
  const colors: Record<string, string> = {
    baixo: 'bg-green-500',
    medio: 'bg-yellow-500',
    alto: 'bg-orange-500',
    critico: 'bg-red-500',
    nao_avaliado: 'bg-gray-400',
  };
  return colors[level] || 'bg-gray-400';
}

export function useVendors() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['vendors', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!vendors || vendors.length === 0) return [];

      // Fetch last assessment for each vendor
      const vendorIds = vendors.map((v) => v.id);
      const { data: assessments } = await supabase
        .from('vendor_assessments')
        .select('id, vendor_id, assessment_date, status, overall_score, risk_level')
        .in('vendor_id', vendorIds)
        .order('assessment_date', { ascending: false });

      const lastAssessmentMap = new Map<string, VendorAssessmentSummary>();
      const assessmentCountMap = new Map<string, number>();

      assessments?.forEach((a) => {
        if (!lastAssessmentMap.has(a.vendor_id)) {
          lastAssessmentMap.set(a.vendor_id, {
            id: a.id,
            assessment_date: a.assessment_date,
            status: a.status,
            overall_score: a.overall_score,
            risk_level: a.risk_level,
          });
        }
        assessmentCountMap.set(a.vendor_id, (assessmentCountMap.get(a.vendor_id) || 0) + 1);
      });

      return vendors.map((vendor) => ({
        ...vendor,
        last_assessment: lastAssessmentMap.get(vendor.id) || null,
        assessments_count: assessmentCountMap.get(vendor.id) || 0,
      })) as Vendor[];
    },
    enabled: !!organization?.id,
  });
}

export function useVendor(vendorId: string | null) {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .maybeSingle();

      if (error) throw error;
      return data as Vendor | null;
    },
    enabled: !!vendorId,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (
      vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'created_by' | 'last_assessment' | 'assessments_count' | 'next_assessment_date'> & { next_assessment_date?: string | null }
    ) => {
      if (!organization?.id) throw new Error('No organization');

      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('vendors')
        .insert({
          ...vendor,
          organization_id: organization.id,
          created_by: user.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...vendor }: Partial<Vendor> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendors')
        .update(vendor)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.id] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useNextVendorCode() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['next-vendor-code', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return 'VND-001';

      const { data, error } = await supabase
        .from('vendors')
        .select('code')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) return 'VND-001';

      const lastCode = data[0].code;
      const match = lastCode.match(/VND-(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `VND-${nextNum.toString().padStart(3, '0')}`;
      }
      return 'VND-001';
    },
    enabled: !!organization?.id,
  });
}
