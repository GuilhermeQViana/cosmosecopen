import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface QualificationQuestion {
  id: string;
  template_id: string;
  order_index: number;
  label: string;
  type: string;
  options: any;
  weight: number;
  is_required: boolean;
  is_ko: boolean;
  ko_value: string | null;
  conditional_on: string | null;
  conditional_value: string | null;
  created_at: string;
}

export function useQualificationQuestions(templateId: string | undefined) {
  return useQuery({
    queryKey: ['qualification-questions', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qualification_questions')
        .select('*')
        .eq('template_id', templateId!)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as QualificationQuestion[];
    },
    enabled: !!templateId,
  });
}

export function useUpsertQualificationQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<QualificationQuestion> & { template_id: string; label: string }) => {
      if (input.id) {
        const { id, ...updates } = input;
        const { data, error } = await supabase
          .from('qualification_questions')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data as QualificationQuestion;
      } else {
        const { data, error } = await supabase
          .from('qualification_questions')
          .insert(input)
          .select()
          .single();
        if (error) throw error;
        return data as QualificationQuestion;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['qualification-questions', variables.template_id] });
    },
  });
}

export function useDeleteQualificationQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; templateId: string }) => {
      const { error } = await supabase
        .from('qualification_questions')
        .delete()
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['qualification-questions', variables.templateId] });
    },
  });
}

export function useReorderQualificationQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { templateId: string; questions: { id: string; order_index: number }[] }) => {
      for (const q of input.questions) {
        const { error } = await supabase
          .from('qualification_questions')
          .update({ order_index: q.order_index })
          .eq('id', q.id);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['qualification-questions', variables.templateId] });
    },
  });
}
