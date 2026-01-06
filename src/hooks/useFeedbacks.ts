import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

export interface Feedback {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  module: string;
  rating: number | null;
  liked: string | null;
  suggestions: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  organizations?: {
    name: string;
  } | null;
}

export function useSuperAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-super-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from('super_admins')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking superadmin status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user?.id,
  });
}

export function useFeedbacks() {
  const { data: isSuperAdmin } = useSuperAdmin();

  return useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      // First get feedbacks
      const { data: feedbacksData, error: feedbacksError } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbacksError) throw feedbacksError;

      // Enrich with profiles and organizations
      const enrichedFeedbacks = await Promise.all(
        (feedbacksData || []).map(async (fb) => {
          let profiles = null;
          let organizations = null;

          if (fb.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', fb.user_id)
              .maybeSingle();
            profiles = profile;
          }

          if (fb.organization_id) {
            const { data: org } = await supabase
              .from('organizations')
              .select('name')
              .eq('id', fb.organization_id)
              .maybeSingle();
            organizations = org;
          }

          return { ...fb, profiles, organizations };
        })
      );

      return enrichedFeedbacks as Feedback[];
    },
    enabled: isSuperAdmin === true,
  });
}

export function useMyFeedbacks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-feedbacks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
    enabled: !!user?.id,
  });
}

export function useSubmitFeedback() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedback: {
      module: string;
      rating: number;
      liked?: string;
      suggestions?: string;
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('feedbacks')
        .insert({
          user_id: user.id,
          organization_id: organization?.id || null,
          module: feedback.module,
          rating: feedback.rating,
          liked: feedback.liked || null,
          suggestions: feedback.suggestions || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });
      toast.success('Feedback enviado com sucesso!');
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
      toast.error('Erro ao enviar feedback');
    },
  });
}
