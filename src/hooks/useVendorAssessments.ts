import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface VendorAssessment {
  id: string;
  vendor_id: string;
  organization_id: string;
  assessment_date: string;
  status: string;
  overall_score: number | null;
  risk_level: string | null;
  notes: string | null;
  assessed_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface VendorAssessmentResponse {
  id: string;
  assessment_id: string;
  requirement_id: string;
  compliance_level: number;
  evidence_provided: boolean;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export function useVendorAssessments(vendorId?: string) {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['vendor-assessments', organization?.id, vendorId],
    queryFn: async () => {
      if (!organization?.id) return [];

      let query = supabase
        .from('vendor_assessments')
        .select(`
          *,
          vendor:vendors(id, code, name)
        `)
        .eq('organization_id', organization.id)
        .order('assessment_date', { ascending: false });

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as VendorAssessment[];
    },
    enabled: !!organization?.id,
  });
}

export function useVendorAssessment(assessmentId: string | null) {
  return useQuery({
    queryKey: ['vendor-assessment', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return null;

      const { data, error } = await supabase
        .from('vendor_assessments')
        .select(`
          *,
          vendor:vendors(id, code, name)
        `)
        .eq('id', assessmentId)
        .maybeSingle();

      if (error) throw error;
      return data as VendorAssessment | null;
    },
    enabled: !!assessmentId,
  });
}

export function useVendorAssessmentResponses(assessmentId: string | null) {
  return useQuery({
    queryKey: ['vendor-assessment-responses', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return [];

      const { data, error } = await supabase
        .from('vendor_assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (error) throw error;
      return data as VendorAssessmentResponse[];
    },
    enabled: !!assessmentId,
  });
}

export function useCreateVendorAssessment() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (
      assessment: Omit<VendorAssessment, 'id' | 'created_at' | 'updated_at' | 'organization_id'>
    ) => {
      if (!organization?.id) throw new Error('No organization');

      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('vendor_assessments')
        .insert({
          ...assessment,
          organization_id: organization.id,
          assessed_by: user.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useUpdateVendorAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...assessment }: Partial<VendorAssessment> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendor_assessments')
        .update(assessment)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-assessment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useSaveAssessmentResponses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assessmentId,
      responses,
    }: {
      assessmentId: string;
      responses: Array<{
        requirement_id: string;
        compliance_level: number;
        evidence_provided: boolean;
        observations?: string | null;
      }>;
    }) => {
      // Upsert responses
      const { error } = await supabase.from('vendor_assessment_responses').upsert(
        responses.map((r) => ({
          assessment_id: assessmentId,
          requirement_id: r.requirement_id,
          compliance_level: r.compliance_level,
          evidence_provided: r.evidence_provided,
          observations: r.observations || null,
        })),
        { onConflict: 'assessment_id,requirement_id' }
      );

      if (error) throw error;
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-assessment-responses', variables.assessmentId],
      });
    },
  });
}

export function useDeleteVendorAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vendor_assessments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

// Helper to calculate overall score from responses
export function calculateOverallScore(
  responses: Array<{ compliance_level: number; weight?: number }>
): number {
  if (responses.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  responses.forEach((r) => {
    const weight = r.weight || 1;
    totalWeight += weight;
    weightedSum += (r.compliance_level / 5) * 100 * weight;
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}
