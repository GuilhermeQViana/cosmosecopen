import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Control {
  id: string;
  framework_id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  parent_id: string | null;
  order_index: number;
}

export function useControls(frameworkId: string | null) {
  return useQuery({
    queryKey: ['controls', frameworkId],
    queryFn: async () => {
      if (!frameworkId) return [];
      
      const { data, error } = await supabase
        .from('controls')
        .select('*')
        .eq('framework_id', frameworkId)
        .order('order_index');

      if (error) throw error;
      return data as Control[];
    },
    enabled: !!frameworkId,
  });
}

export function useControlsByCategory(controls: Control[]) {
  const categories = new Map<string, Control[]>();
  
  controls.forEach((control) => {
    const category = control.category || 'Sem categoria';
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(control);
  });

  return Array.from(categories.entries()).map(([name, controls]) => ({
    name,
    controls,
  }));
}
