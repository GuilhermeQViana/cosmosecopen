import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RiskHistoryEntry {
  id: string;
  risk_id: string;
  changed_by: string | null;
  change_type: 'created' | 'updated' | 'level_change' | 'treatment_change';
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  old_level: number | null;
  new_level: number | null;
  created_at: string;
}

export function useRiskHistory(riskId: string | null) {
  return useQuery({
    queryKey: ['risk-history', riskId],
    queryFn: async () => {
      if (!riskId) return [];

      const { data, error } = await supabase
        .from('risk_history')
        .select('*')
        .eq('risk_id', riskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RiskHistoryEntry[];
    },
    enabled: !!riskId,
  });
}

export function getRiskTrend(history: RiskHistoryEntry[]): 'improving' | 'worsening' | 'stable' | null {
  const levelChanges = history.filter(h => h.change_type === 'level_change' && h.old_level && h.new_level);
  
  if (levelChanges.length < 2) return null;
  
  // Compare most recent level with oldest
  const mostRecent = levelChanges[0];
  const oldest = levelChanges[levelChanges.length - 1];
  
  if (mostRecent.new_level! < oldest.new_level!) return 'improving';
  if (mostRecent.new_level! > oldest.new_level!) return 'worsening';
  return 'stable';
}
