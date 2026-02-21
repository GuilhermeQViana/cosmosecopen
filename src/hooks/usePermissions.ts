import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';

export type AppRole = 'admin' | 'auditor' | 'analyst';

export interface Permissions {
  role: AppRole;
  isAdmin: boolean;
  isAuditor: boolean;
  isAnalyst: boolean;
  /** Can create, edit, delete records */
  canEdit: boolean;
  /** Can perform destructive bulk operations */
  canBulkDelete: boolean;
  /** Can manage team members & invites */
  canManageTeam: boolean;
  /** Can manage org settings */
  canManageOrg: boolean;
  /** Can export/import data */
  canExportImport: boolean;
}

const ROLE_PERMISSIONS: Record<AppRole, Omit<Permissions, 'role' | 'isAdmin' | 'isAuditor' | 'isAnalyst'>> = {
  admin: {
    canEdit: true,
    canBulkDelete: true,
    canManageTeam: true,
    canManageOrg: true,
    canExportImport: true,
  },
  auditor: {
    canEdit: false,
    canBulkDelete: false,
    canManageTeam: false,
    canManageOrg: false,
    canExportImport: true,
  },
  analyst: {
    canEdit: true,
    canBulkDelete: false,
    canManageTeam: false,
    canManageOrg: false,
    canExportImport: false,
  },
};

export function usePermissions(): Permissions & { isLoading: boolean } {
  const { user } = useAuth();
  const { organization } = useOrganization();

  const { data: role, isLoading } = useQuery({
    queryKey: ['user-role', user?.id, organization?.id],
    queryFn: async () => {
      if (!user?.id || !organization?.id) return 'analyst' as AppRole;

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', organization.id)
        .maybeSingle();

      return (data?.role as AppRole) || 'analyst';
    },
    enabled: !!user?.id && !!organization?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const currentRole = role || 'analyst';
  const perms = ROLE_PERMISSIONS[currentRole];

  return {
    role: currentRole,
    isAdmin: currentRole === 'admin',
    isAuditor: currentRole === 'auditor',
    isAnalyst: currentRole === 'analyst',
    ...perms,
    isLoading,
  };
}
