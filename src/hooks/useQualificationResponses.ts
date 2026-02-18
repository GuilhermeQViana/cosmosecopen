import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface QualificationResponse {
  id: string;
  campaign_id: string;
  question_id: string;
  answer_text: string | null;
  answer_option: any;
  answer_file_url: string | null;
  score_awarded: number | null;
  created_at: string;
  updated_at: string;
  // Joined
  qualification_questions?: {
    label: string;
    type: string;
    weight: number;
    options: any;
    is_ko: boolean;
    ko_value: string | null;
    order_index: number;
  } | null;
}

export function useQualificationResponses(campaignId: string | undefined) {
  return useQuery({
    queryKey: ['qualification-responses', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qualification_responses')
        .select('*, qualification_questions(label, type, weight, options, is_ko, ko_value, order_index)')
        .eq('campaign_id', campaignId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as QualificationResponse[];
    },
    enabled: !!campaignId,
  });
}

export function useCalculateQualificationScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      // Fetch responses with question data
      const { data: responses, error: rErr } = await supabase
        .from('qualification_responses')
        .select('*, qualification_questions(weight, type, options, is_ko, ko_value)')
        .eq('campaign_id', campaignId);
      if (rErr) throw rErr;

      let totalWeight = 0;
      let totalScore = 0;
      let koTriggered = false;

      for (const r of (responses || [])) {
        const q = r.qualification_questions as any;
        if (!q) continue;
        
        totalWeight += q.weight;

        // Check KO
        if (q.is_ko && q.ko_value) {
          const answer = r.answer_text || (r.answer_option as any)?.value;
          if (answer?.toLowerCase() === q.ko_value.toLowerCase()) {
            koTriggered = true;
          }
        }

        // Calculate score per question
        let questionScore = 0;
        if (q.type === 'multiple_choice' && q.options && r.answer_option) {
          const options = Array.isArray(q.options) ? q.options : [];
          const selected = r.answer_option as any;
          const selectedValue = typeof selected === 'object' ? selected.value : selected;
          const option = options.find((o: any) => o.value === selectedValue);
          if (option && typeof option.score === 'number') {
            const maxScore = Math.max(...options.map((o: any) => o.score || 0));
            questionScore = maxScore > 0 ? (option.score / maxScore) * q.weight : 0;
          }
        } else if (r.answer_text || r.answer_file_url) {
          // Text/upload/date/currency/number: full score if answered
          questionScore = q.weight;
        }

        // Update individual score
        await supabase
          .from('qualification_responses')
          .update({ score_awarded: questionScore })
          .eq('id', r.id);

        totalScore += questionScore;
      }

      const finalScore = koTriggered ? 0 : (totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0);
      
      let classification = 'alto';
      if (finalScore >= 81) classification = 'baixo';
      else if (finalScore >= 51) classification = 'medio';

      // Update campaign
      const { error: uErr } = await supabase
        .from('qualification_campaigns')
        .update({
          score: finalScore,
          risk_classification: classification,
          ko_triggered: koTriggered,
          status: 'em_analise',
        })
        .eq('id', campaignId);
      if (uErr) throw uErr;

      queryClient.invalidateQueries({ queryKey: ['qualification-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['qualification-responses', campaignId] });

      return { score: finalScore, classification, koTriggered };
    },
  });
}
