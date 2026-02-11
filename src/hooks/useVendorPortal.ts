import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface VendorPortalToken {
  id: string;
  vendor_id: string;
  organization_id: string;
  token: string;
  scope: string;
  expires_at: string;
  used_at: string | null;
  created_by: string | null;
  created_at: string | null;
  vendor_response: any;
  status: string;
}

export function useVendorPortalTokens(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-portal-tokens', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('vendor_portal_tokens')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as VendorPortalToken[];
    },
    enabled: !!vendorId,
  });
}

export function useCreatePortalToken() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async ({ vendorId, scope, expiresInDays }: { vendorId: string; scope: string; expiresInDays: number }) => {
      if (!organization?.id) throw new Error('No organization');
      const { data: user } = await supabase.auth.getUser();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const { data, error } = await supabase
        .from('vendor_portal_tokens')
        .insert({
          vendor_id: vendorId,
          organization_id: organization.id,
          scope,
          expires_at: expiresAt.toISOString(),
          created_by: user.user?.id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as VendorPortalToken;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-portal-tokens', variables.vendorId] });
    },
  });
}

export function useUpdatePortalTokenStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('vendor_portal_tokens')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-portal-tokens'] });
    },
  });
}
