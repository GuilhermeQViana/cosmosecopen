import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useFrameworkContext } from '@/contexts/FrameworkContext';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { CosmicPageLoader } from './GlobalCosmicLoader';
import { CommandPalette } from '@/components/CommandPalette';
import { NotificationCenter } from './NotificationCenter';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { StarField } from '@/components/ui/star-field';
import { PageTransition } from './PageTransition';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';
import { AUTH_ROUTE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { PaymentFailedBanner } from '@/components/subscription/PaymentFailedBanner';
import { SubscriptionRequired } from '@/components/subscription/SubscriptionRequired';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/diagnostico': 'Diagnóstico de Controles',
  '/riscos': 'Registro de Riscos',
  '/evidencias': 'Cofre de Evidências',
  '/plano-acao': 'Plano de Ação',
  '/relatorios': 'Relatórios',
  '/mapeamento': 'Mapeamento de Frameworks',
  '/equipe': 'Gestão de Equipe',
  '/auditoria': 'Auditoria',
  '/configuracoes': 'Configurações',
};

export function AppLayout() {
  const { user, loading: authLoading } = useAuth();
  const { organization, organizations, loading: orgLoading } = useOrganization();
  const { currentFramework, isLoading: frameworkLoading } = useFrameworkContext();
  const { hasAccess, isLoading: subscriptionLoading } = useSubscription();
  const location = useLocation();
  const breadcrumbItems = useBreadcrumb();

  // Allowed routes even when subscription expired
  const allowedWithoutSubscription = ['/configuracoes', '/selecionar-organizacao', '/selecionar-framework', '/checkout-success'];

  // Only show full-screen loading on initial auth check, not on every navigation
  // Organization/framework/subscription loading should not block the entire UI
  const isInitialLoading = authLoading;
  
  if (isInitialLoading) {
    return <CosmicPageLoader message="Iniciando CosmoSec..." />;
  }
  
  // Show loading only if org context is still doing initial load (not cached)
  if (orgLoading && !organization && organizations.length === 0) {
    return <CosmicPageLoader message="Carregando organização..." />;
  }

  if (!user) {
    const redirectPath = location.pathname + location.search;
    const redirectParam = redirectPath !== '/' ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
    return <Navigate to={`${AUTH_ROUTE}${redirectParam}`} replace />;
  }

  // Usuário não tem nenhuma organização -> onboarding
  if (organizations.length === 0 && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Usuário tem organizações mas não selecionou nenhuma ativa
  if (!organization && organizations.length > 0 && location.pathname !== '/selecionar-organizacao') {
    return <Navigate to="/selecionar-organizacao" replace />;
  }

  // Usuário não selecionou framework -> redirecionar para seleção
  if (!currentFramework && location.pathname !== '/selecionar-framework') {
    return <Navigate to="/selecionar-framework" replace />;
  }

  // Verificar acesso à assinatura
  if (!hasAccess && !allowedWithoutSubscription.includes(location.pathname)) {
    return <SubscriptionRequired />;
  }

  return (
    <SidebarProvider>
      <StarField starCount={60} dustCount={20} />
      <CommandPalette />
      <OnboardingTour />
      <KeyboardShortcutsDialog />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <TrialBanner />
          <PaymentFailedBanner />
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 mx-2" />
            <Breadcrumb className="flex-1">
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <BreadcrumbItem key={item.path}>
                    {index > 0 && <BreadcrumbSeparator />}
                    {item.isCurrentPage ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.path}>{item.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2 text-muted-foreground"
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true,
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
            >
              <Search className="h-4 w-4" />
              <span>Buscar...</span>
              <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <NotificationCenter />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
