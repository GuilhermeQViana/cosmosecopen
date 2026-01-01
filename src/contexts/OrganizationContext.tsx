import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at?: string;
  updated_at?: string;
  role?: 'admin' | 'auditor' | 'analyst';
}

interface OrganizationContextType {
  organization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  setOrganization: (org: Organization | null) => void;
  setActiveOrganization: (orgId: string) => Promise<boolean>;
  refreshOrganization: () => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  createOrganization: (name: string, description?: string) => Promise<Organization | null>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar todas as organizações do usuário
  const refreshOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_organizations');

      if (error) throw error;

      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    }
  }, [user]);

  // Buscar organização ativa do usuário
  const refreshOrganization = useCallback(async () => {
    if (!user) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    try {
      // Get user's profile with organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile?.organization_id) {
        // Buscar organização com role
        const { data: orgs } = await supabase.rpc('get_user_organizations');
        
        const activeOrg = orgs?.find((org: Organization) => org.id === profile.organization_id);
        
        if (activeOrg) {
          setOrganization(activeOrg);
        } else {
          // Usuário não tem mais acesso a essa organização
          setOrganization(null);
        }
      } else {
        setOrganization(null);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Definir organização ativa
  const setActiveOrganization = useCallback(async (orgId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc('set_active_organization', {
        _org_id: orgId
      });

      if (error) throw error;

      // Invalidar todo o cache do React Query
      await queryClient.invalidateQueries();

      // Atualizar contexto
      await refreshOrganization();
      
      return true;
    } catch (error) {
      console.error('Error setting active organization:', error);
      return false;
    }
  }, [queryClient, refreshOrganization]);

  // Criar nova organização
  const createOrganization = useCallback(async (name: string, description?: string): Promise<Organization | null> => {
    try {
      const { data: org, error } = await supabase.rpc('create_organization_with_admin', {
        org_name: name,
        org_description: description || null,
      });

      if (error) throw error;

      // Atualizar lista de organizações
      await refreshOrganizations();
      await refreshOrganization();

      return org;
    } catch (error) {
      console.error('Error creating organization:', error);
      return null;
    }
  }, [refreshOrganizations, refreshOrganization]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([refreshOrganization(), refreshOrganizations()]);
      setLoading(false);
    };
    
    loadData();
  }, [user, refreshOrganization, refreshOrganizations]);

  return (
    <OrganizationContext.Provider value={{ 
      organization, 
      organizations,
      loading, 
      setOrganization,
      setActiveOrganization,
      refreshOrganization,
      refreshOrganizations,
      createOrganization
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
