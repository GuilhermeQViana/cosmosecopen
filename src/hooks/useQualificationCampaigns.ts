import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface QualificationCampaign {
  id: string;
  organization_id: string;
  template_id: string;
  template_version: number;
  vendor_id: string;
  token: string;
  status: string;
  expires_at: string;
  score: number | null;
  risk_classification: string | null;
  ko_triggered: boolean;
  reviewer_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  vendors?: { name: string; code: string } | null;
  qualification_templates?: { name: string; version: number } | null;
}

export function useQualificationCampaigns(filters?: { vendorId?: string; templateId?: string; status?: string }) {
  const { organization } = useOrganization();
  const orgId = organization?.id;

  return useQuery({
    queryKey: ['qualification-campaigns', orgId, filters],
    queryFn: async () => {
      let query = supabase
        .from('qualification_campaigns')
        .select('*, vendors(name, code), qualification_templates(name, version)')
        .eq('organization_id', orgId!)
        .order('created_at', { ascending: false });

      if (filters?.vendorId) query = query.eq('vendor_id', filters.vendorId);
      if (filters?.templateId) query = query.eq('template_id', filters.templateId);
      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return data as QualificationCampaign[];
    },
    enabled: !!orgId,
  });
}

export function useCreateQualificationCampaign() {
  const queryClient = useQueryClient();
  const { organization, user } = useAuth();

  return useMutation({
    mutationFn: async (input: { templateId: string; templateVersion: number; vendorIds: string[]; expiresInDays: number }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      const rows = input.vendorIds.map(vendorId => ({
        organization_id: organization!.id,
        template_id: input.templateId,
        template_version: input.templateVersion,
        vendor_id: vendorId,
        expires_at: expiresAt.toISOString(),
        created_by: user!.id,
      }));

      const { data, error } = await supabase
        .from('qualification_campaigns')
        .insert(rows)
        .select();
      if (error) throw error;
      return data as QualificationCampaign[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualification-campaigns'] });
    },
  });
}

export function useUpdateQualificationCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; status?: string; score?: number; risk_classification?: string; ko_triggered?: boolean; reviewer_notes?: string; approved_by?: string; approved_at?: string }) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('qualification_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as QualificationCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualification-campaigns'] });
    },
  });
}
