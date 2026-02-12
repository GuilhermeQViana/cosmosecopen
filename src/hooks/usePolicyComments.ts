import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type PolicyComment = {
  id: string;
  policy_id: string;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  is_resolved: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
};

export function usePolicyComments(policyId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['policy-comments', policyId],
    queryFn: async () => {
      if (!policyId) return [];
      const { data, error } = await supabase
        .from('policy_comments')
        .select('*')
        .eq('policy_id', policyId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      // Fetch profiles for comment authors
      const userIds = [...new Set((data || []).map(c => c.user_id).filter(Boolean))] as string[];
      let profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
        }
      }

      return (data || []).map(c => ({
        ...c,
        profile: c.user_id ? profileMap[c.user_id] || null : null,
      })) as PolicyComment[];
    },
    enabled: !!policyId,
  });

  const addComment = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!policyId || !user) throw new Error('Missing context');
      const { error } = await supabase.from('policy_comments').insert({
        policy_id: policyId,
        user_id: user.id,
        content,
        parent_id: parentId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policy-comments', policyId] }),
    onError: (err: Error) => toast.error('Erro ao comentar: ' + err.message),
  });

  const resolveComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('policy_comments')
        .update({ is_resolved: true })
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policy-comments', policyId] }),
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from('policy_comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policy-comments', policyId] }),
  });

  return {
    comments: commentsQuery.data || [],
    isLoading: commentsQuery.isLoading,
    addComment,
    resolveComment,
    deleteComment,
  };
}
