import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type FrameworkCode = 'nist_csf' | 'iso_27001' | 'bcb_cmn';

interface FrameworkInfo {
  id: string;
  code: FrameworkCode;
  name: string;
  version: string | null;
  description: string | null;
  icon: string | null;
  is_custom: boolean;
}

interface FrameworkContextType {
  currentFramework: FrameworkInfo | null;
  currentFrameworkCode: FrameworkCode | null;
  setFramework: (code: FrameworkCode) => void;
  clearFramework: () => void;
  frameworks: FrameworkInfo[];
  isLoading: boolean;
}

const FrameworkContext = createContext<FrameworkContextType | undefined>(undefined);

const FRAMEWORK_STORAGE_KEY = 'cosmosec_selected_framework';

export function FrameworkProvider({ children }: { children: React.ReactNode }) {
  const [currentFrameworkCode, setCurrentFrameworkCode] = useState<FrameworkCode | null>(() => {
    const stored = localStorage.getItem(FRAMEWORK_STORAGE_KEY);
    return stored as FrameworkCode | null;
  });
  const queryClient = useQueryClient();

  // Fetch all frameworks
  const { data: frameworks = [], isLoading } = useQuery({
    queryKey: ['frameworks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as FrameworkInfo[];
    },
  });

  // Get current framework info based on selected code
  const currentFramework = frameworks.find(f => f.code === currentFrameworkCode) || null;

  const setFramework = useCallback((code: FrameworkCode) => {
    setCurrentFrameworkCode(code);
    localStorage.setItem(FRAMEWORK_STORAGE_KEY, code);
    
    // Invalidate queries that depend on framework
    queryClient.invalidateQueries({ queryKey: ['assessments'] });
    queryClient.invalidateQueries({ queryKey: ['controls'] });
    queryClient.invalidateQueries({ queryKey: ['risks'] });
    queryClient.invalidateQueries({ queryKey: ['evidences'] });
    queryClient.invalidateQueries({ queryKey: ['action-plans'] });
  }, [queryClient]);

  const clearFramework = useCallback(() => {
    setCurrentFrameworkCode(null);
    localStorage.removeItem(FRAMEWORK_STORAGE_KEY);
  }, []);

  return (
    <FrameworkContext.Provider
      value={{
        currentFramework,
        currentFrameworkCode,
        setFramework,
        clearFramework,
        frameworks,
        isLoading,
      }}
    >
      {children}
    </FrameworkContext.Provider>
  );
}

export function useFrameworkContext() {
  const context = useContext(FrameworkContext);
  if (context === undefined) {
    throw new Error('useFrameworkContext must be used within a FrameworkProvider');
  }
  return context;
}
