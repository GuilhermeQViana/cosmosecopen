import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import type { Database } from '@/integrations/supabase/types';

type EvidenceClassification = Database['public']['Enums']['evidence_classification'];

export interface Evidence {
  id: string;
  name: string;
  description: string | null;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  classification: EvidenceClassification;
  tags: string[] | null;
  expires_at: string | null;
  uploaded_by: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export function useEvidences() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['evidences', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('evidences')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Evidence[];
    },
    enabled: !!organization?.id,
  });
}

export function useUploadEvidence() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async ({
      file,
      metadata,
    }: {
      file: File;
      metadata: {
        name: string;
        description?: string;
        classification: EvidenceClassification;
        tags?: string[];
        expires_at?: string | null;
      };
    }) => {
      if (!organization?.id) throw new Error('No organization');

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${organization.id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('evidences')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Create evidence record
      const { data, error } = await supabase
        .from('evidences')
        .insert({
          name: metadata.name,
          description: metadata.description || null,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          classification: metadata.classification,
          tags: metadata.tags || null,
          expires_at: metadata.expires_at || null,
          uploaded_by: user?.id || null,
          organization_id: organization.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidences'] });
    },
  });
}

export function useUpdateEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Evidence> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('evidences')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidences'] });
    },
  });
}

export function useDeleteEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evidence: Evidence) => {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('evidences')
        .remove([evidence.file_path]);

      if (storageError) throw storageError;

      // Delete record
      const { error } = await supabase
        .from('evidences')
        .delete()
        .eq('id', evidence.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidences'] });
    },
  });
}

export function useDownloadEvidence() {
  return useMutation({
    mutationFn: async (evidence: Evidence) => {
      const { data, error } = await supabase.storage
        .from('evidences')
        .download(evidence.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = evidence.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}

export const CLASSIFICATION_OPTIONS: { value: EvidenceClassification; label: string; color: string }[] = [
  { value: 'publico', label: 'Público', color: 'bg-green-500' },
  { value: 'interno', label: 'Interno', color: 'bg-yellow-500' },
  { value: 'confidencial', label: 'Confidencial', color: 'bg-red-500' },
];

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function getFileIcon(fileType: string | null): string {
  if (!fileType) return '📄';
  if (fileType.includes('pdf')) return '📕';
  if (fileType.includes('word') || fileType.includes('document')) return '📘';
  if (fileType.includes('sheet') || fileType.includes('excel')) return '📗';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('video')) return '🎬';
  if (fileType.includes('audio')) return '🎵';
  if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
  return '📄';
}
