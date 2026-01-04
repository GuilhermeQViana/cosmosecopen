import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AssessmentComment {
  id: string;
  assessment_id: string;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  reactions?: CommentReaction[];
  replies?: AssessmentComment[];
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: 'like' | 'dislike' | 'emoji';
  emoji: string | null;
  created_at: string;
}

export function useAssessmentComments(assessmentId: string | undefined) {
  return useQuery({
    queryKey: ['assessment-comments', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return [];

      const { data, error } = await supabase
        .from('assessment_comments')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for comment users
      const userIds = [...new Set(data.map((c: any) => c.user_id).filter(Boolean))];
      const { data: profiles } = userIds.length > 0 
        ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
        : { data: [] };
      
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      // Fetch reactions for all comments
      const commentIds = data.map((c: any) => c.id);
      const { data: reactions } = await supabase
        .from('comment_reactions')
        .select('*')
        .in('comment_id', commentIds);

      // Build comment tree with reactions and profiles
      const commentMap = new Map<string, AssessmentComment>();
      const rootComments: AssessmentComment[] = [];

      data.forEach((comment: any) => {
        const commentWithData: AssessmentComment = {
          ...comment,
          profile: profileMap.get(comment.user_id) || null,
          reactions: reactions?.filter((r: CommentReaction) => r.comment_id === comment.id) || [],
          replies: [],
        };
        commentMap.set(comment.id, commentWithData);
      });

      data.forEach((comment: any) => {
        const fullComment = commentMap.get(comment.id)!;
        if (comment.parent_id && commentMap.has(comment.parent_id)) {
          commentMap.get(comment.parent_id)!.replies!.push(fullComment);
        } else {
          rootComments.push(fullComment);
        }
      });

      return rootComments;
    },
    enabled: !!assessmentId,
  });
}

// Helper function to extract mentioned usernames from content
function extractMentions(content: string): string[] {
  const mentionRegex = /@([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)*)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1].trim());
  }
  return [...new Set(mentions)]; // Remove duplicates
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      assessmentId,
      content,
      parentId,
      organizationId,
      controlCode,
      controlName,
    }: {
      assessmentId: string;
      content: string;
      parentId?: string;
      organizationId?: string;
      controlCode?: string;
      controlName?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('assessment_comments')
        .insert({
          assessment_id: assessmentId,
          user_id: user.id,
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Extract mentions and create notifications
      const mentionedNames = extractMentions(content);
      
      if (mentionedNames.length > 0 && organizationId) {
        // Get user's name for notification
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        const authorName = currentUserProfile?.full_name || 'Alguém';

        // Find mentioned users by name in the organization
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('organization_id', organizationId);

        if (userRoles && userRoles.length > 0) {
          const userIds = userRoles.map(ur => ur.user_id);
          
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

          if (profiles) {
            // Find users whose names match the mentions
            const mentionedUsers = profiles.filter(p => 
              p.full_name && mentionedNames.some(mention => 
                p.full_name!.toLowerCase().includes(mention.toLowerCase()) ||
                mention.toLowerCase().includes(p.full_name!.toLowerCase())
              )
            );

            // Build link with control code for direct navigation
            const controlLink = controlCode 
              ? `/diagnostico?control=${encodeURIComponent(controlCode)}`
              : '/diagnostico';

            const controlLabel = controlCode && controlName 
              ? `${controlCode} - ${controlName}`
              : 'um controle';

            // Create notifications for mentioned users (except the author)
            const notificationsToCreate = mentionedUsers
              .filter(mu => mu.id !== user.id)
              .map(mu => ({
                user_id: mu.id,
                organization_id: organizationId,
                title: `${authorName} mencionou você`,
                message: `Você foi mencionado em um comentário no controle ${controlLabel}.`,
                type: 'mention',
                link: controlLink,
              }));

            if (notificationsToCreate.length > 0) {
              await supabase.from('notifications').insert(notificationsToCreate);
            }
          }
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assessment-comments', variables.assessmentId],
      });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      content,
      assessmentId,
    }: {
      commentId: string;
      content: string;
      assessmentId: string;
    }) => {
      const { error } = await supabase
        .from('assessment_comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assessment-comments', variables.assessmentId],
      });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      assessmentId,
    }: {
      commentId: string;
      assessmentId: string;
    }) => {
      const { error } = await supabase
        .from('assessment_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assessment-comments', variables.assessmentId],
      });
    },
  });
}

export function usePinComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      isPinned,
      assessmentId,
    }: {
      commentId: string;
      isPinned: boolean;
      assessmentId: string;
    }) => {
      const { error } = await supabase
        .from('assessment_comments')
        .update({ is_pinned: isPinned })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assessment-comments', variables.assessmentId],
      });
    },
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      commentId,
      reactionType,
      assessmentId,
    }: {
      commentId: string;
      reactionType: 'like' | 'dislike';
      assessmentId: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if reaction exists
      const { data: existing } = await supabase
        .from('comment_reactions')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)
        .maybeSingle();

      if (existing) {
        // Remove reaction
        await supabase
          .from('comment_reactions')
          .delete()
          .eq('id', existing.id);
      } else {
        // Add reaction
        await supabase.from('comment_reactions').insert({
          comment_id: commentId,
          user_id: user.id,
          reaction_type: reactionType,
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assessment-comments', variables.assessmentId],
      });
    },
  });
}
