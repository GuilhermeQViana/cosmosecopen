import { useFrameworkContext } from '@/contexts/FrameworkContext';

/**
 * Hook to get the active framework's ID.
 * Returns the framework_id (UUID) of the currently selected framework.
 */
export function useActiveFramework() {
  const { currentFramework, currentFrameworkCode, isLoading } = useFrameworkContext();

  return {
    frameworkId: currentFramework?.id || null,
    frameworkCode: currentFrameworkCode,
    frameworkName: currentFramework?.name || null,
    isLoading,
  };
}
