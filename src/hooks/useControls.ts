import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFrameworkContext } from '@/contexts/FrameworkContext';

export interface Control {
  id: string;
  framework_id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  parent_id: string | null;
  order_index: number;
  // New fields for advanced card
  weight: number | null;
  criticality: string | null;
  weight_reason: string | null;
  implementation_example: string | null;
  evidence_example: string | null;
}

/**
 * Hook to fetch controls for a specific framework.
 * If no frameworkId is provided, uses the global context.
 */
export function useControls(frameworkId?: string | null) {
  const { currentFramework } = useFrameworkContext();
  
  // Use provided frameworkId or fall back to global context
  const activeFrameworkId = frameworkId ?? currentFramework?.id ?? null;

  return useQuery({
    queryKey: ['controls', activeFrameworkId],
    queryFn: async () => {
      if (!activeFrameworkId) return [];
      
      const { data, error } = await supabase
        .from('controls')
        .select('*')
        .eq('framework_id', activeFrameworkId)
        .order('order_index');

      if (error) throw error;
      return data as Control[];
    },
    enabled: !!activeFrameworkId,
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
