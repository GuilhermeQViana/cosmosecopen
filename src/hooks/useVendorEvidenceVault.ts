import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type VendorEvidenceCategory = 
  | 'contrato' 
  | 'certificacao' 
  | 'ddq' 
  | 'politica' 
  | 'sla' 
  | 'auditoria' 
  | 'outro';

export type VendorEvidenceClassification = 'publico' | 'interno' | 'confidencial';

export interface VendorEvidenceVault {
  id: string;
  vendor_id: string;
  organization_id: string;
  name: string;
  description: string | null;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  classification: VendorEvidenceClassification;
  category: VendorEvidenceCategory;
  expires_at: string | null;
  tags: string[] | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVendorEvidenceInput {
  vendor_id: string;
  name: string;
  description?: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  classification: VendorEvidenceClassification;
  category: VendorEvidenceCategory;
  expires_at?: string;
  tags?: string[];
}

export function useVendorEvidenceVault(vendorId?: string) {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: evidences, isLoading, error } = useQuery({
    queryKey: ['vendor-evidence-vault', organization?.id, vendorId],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      let query = supabase
        .from('vendor_evidence_vault')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as VendorEvidenceVault[];
    },
    enabled: !!organization?.id,
  });

  const { data: evidenceCountsByVendor } = useQuery({
    queryKey: ['vendor-evidence-vault-counts', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return {};
      
      const { data, error } = await supabase
        .from('vendor_evidence_vault')
        .select('vendor_id')
        .eq('organization_id', organization.id);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach((item) => {
        counts[item.vendor_id] = (counts[item.vendor_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!organization?.id,
  });

  const createEvidence = useMutation({
    mutationFn: async (input: CreateVendorEvidenceInput) => {
      if (!organization?.id) throw new Error('Organização não selecionada');
      
      const { data, error } = await supabase
        .from('vendor_evidence_vault')
        .insert({
          ...input,
          organization_id: organization.id,
          uploaded_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-evidence-vault'] });
      toast.success('Evidência adicionada com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao criar evidência:', error);
      toast.error('Erro ao adicionar evidência');
    },
  });

  const updateEvidence = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VendorEvidenceVault> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendor_evidence_vault')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-evidence-vault'] });
      toast.success('Evidência atualizada com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao atualizar evidência:', error);
      toast.error('Erro ao atualizar evidência');
    },
  });

  const deleteEvidence = useMutation({
    mutationFn: async (id: string) => {
      // First get the evidence to delete the file
      const { data: evidence } = await supabase
        .from('vendor_evidence_vault')
        .select('file_path')
        .eq('id', id)
        .single();

      if (evidence?.file_path) {
        await supabase.storage.from('vendor-evidences').remove([evidence.file_path]);
      }

      const { error } = await supabase
        .from('vendor_evidence_vault')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-evidence-vault'] });
      toast.success('Evidência excluída com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao excluir evidência:', error);
      toast.error('Erro ao excluir evidência');
    },
  });

  const uploadFile = async (file: File, vendorId: string): Promise<string> => {
    if (!organization?.id) throw new Error('Organização não selecionada');

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${organization.id}/vault/${vendorId}/${fileName}`;

    const { error } = await supabase.storage
      .from('vendor-evidences')
      .upload(filePath, file);

    if (error) throw error;
    return filePath;
  };

  const getFileUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('vendor-evidences')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('vendor-evidences')
      .download(filePath);

    if (error) throw error;

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    evidences,
    isLoading,
    error,
    evidenceCountsByVendor,
    createEvidence,
    updateEvidence,
    deleteEvidence,
    uploadFile,
    getFileUrl,
    downloadFile,
  };
}
