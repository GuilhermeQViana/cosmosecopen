import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FrameworkMapping {
  id: string;
  source_control_id: string;
  target_control_id: string;
  mapping_type: string;
  created_at: string;
}

export interface MappingWithControls {
  id: string;
  mapping_type: string;
  source_control: {
    id: string;
    code: string;
    name: string;
    framework: {
      id: string;
      code: string;
      name: string;
    };
  };
  target_control: {
    id: string;
    code: string;
    name: string;
    framework: {
      id: string;
      code: string;
      name: string;
    };
  };
}

export function useFrameworkMappings() {
  return useQuery({
    queryKey: ['framework-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('framework_mappings')
        .select(`
          id,
          mapping_type,
          source_control_id,
          target_control_id
        `);

      if (error) throw error;

      // Fetch controls separately to get framework info
      const controlIds = [
        ...new Set([
          ...data.map(m => m.source_control_id),
          ...data.map(m => m.target_control_id),
        ]),
      ];

      const { data: controls, error: controlsError } = await supabase
        .from('controls')
        .select(`
          id,
          code,
          name,
          framework_id
        `)
        .in('id', controlIds);

      if (controlsError) throw controlsError;

      const { data: frameworks, error: frameworksError } = await supabase
        .from('frameworks')
        .select('id, code, name');

      if (frameworksError) throw frameworksError;

      const controlsMap = new Map(controls?.map(c => [c.id, c]) || []);
      const frameworksMap = new Map(frameworks?.map(f => [f.id, f]) || []);

      return data.map(mapping => {
        const sourceControl = controlsMap.get(mapping.source_control_id);
        const targetControl = controlsMap.get(mapping.target_control_id);

        return {
          id: mapping.id,
          mapping_type: mapping.mapping_type,
          source_control: {
            id: sourceControl?.id || '',
            code: sourceControl?.code || '',
            name: sourceControl?.name || '',
            framework: frameworksMap.get(sourceControl?.framework_id || '') || { id: '', code: '', name: '' },
          },
          target_control: {
            id: targetControl?.id || '',
            code: targetControl?.code || '',
            name: targetControl?.name || '',
            framework: frameworksMap.get(targetControl?.framework_id || '') || { id: '', code: '', name: '' },
          },
        } as MappingWithControls;
      });
    },
  });
}

export function useMappingsForControl(controlId: string | null) {
  const { data: allMappings } = useFrameworkMappings();

  if (!controlId || !allMappings) return [];

  return allMappings.filter(
    m => m.source_control.id === controlId || m.target_control.id === controlId
  );
}

export function useAllControls() {
  return useQuery({
    queryKey: ['all-controls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('controls')
        .select(`
          id,
          code,
          name,
          category,
          framework_id
        `)
        .order('code');

      if (error) throw error;
      return data;
    },
  });
}
