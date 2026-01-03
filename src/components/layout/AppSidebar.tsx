import { useLocation, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useFrameworkContext, FrameworkCode } from '@/contexts/FrameworkContext';
import { useMenuBadges } from '@/hooks/useMenuBadges';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { getFrameworkIcon } from '@/lib/framework-icons';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  FileCheck,
  ListTodo,
  FileBarChart,
  Map,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  Building2,
  Activity,
  ChevronDown,
  Plus,
  Check,
  Landmark,
  Layers,
  Crown,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'diagnostico' | 'riscos' | 'planoAcao';
};

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Diagnóstico', url: '/diagnostico', icon: ClipboardCheck, badgeKey: 'diagnostico' },
  { title: 'Riscos', url: '/riscos', icon: AlertTriangle, badgeKey: 'riscos' },
  { title: 'Evidências', url: '/evidencias', icon: FileCheck },
  { title: 'Plano de Ação', url: '/plano-acao', icon: ListTodo, badgeKey: 'planoAcao' },
  { title: 'Relatórios', url: '/relatorios', icon: FileBarChart },
];

const configNavItems: NavItem[] = [
  { title: 'Mapeamento', url: '/mapeamento', icon: Map },
  { title: 'Equipe', url: '/equipe', icon: Users },
  { title: 'Auditoria', url: '/auditoria', icon: Activity },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
];

// Default icons for standard frameworks (fallback)
const defaultFrameworkIcons: Record<string, React.ReactNode> = {
  nist_csf: <Shield className="w-4 h-4" />,
  iso_27001: <Building2 className="w-4 h-4" />,
  bcb_cmn: <Landmark className="w-4 h-4" />,
};

const frameworkColors: Record<string, string> = {
  nist_csf: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  iso_27001: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  bcb_cmn: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

// Helper to get framework icon - uses custom icon if available, otherwise falls back to defaults
function getFrameworkIconElement(framework: { code: string; icon?: string | null; is_custom?: boolean }): React.ReactNode {
  if (framework.is_custom && framework.icon) {
    const IconComponent = getFrameworkIcon(framework.icon);
    return <IconComponent className="w-4 h-4" />;
  }
  return defaultFrameworkIcons[framework.code] || <Shield className="w-4 h-4" />;
}

function getFrameworkColorClass(code: string, isCustom?: boolean): string {
  if (isCustom) {
    return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
  }
  return frameworkColors[code] || 'bg-primary/10 text-primary';
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { organization, organizations, setActiveOrganization } = useOrganization();
  const { currentFramework, frameworks, setFramework } = useFrameworkContext();
  const { badges } = useMenuBadges();
  const { subscriptionStatus } = useSubscription();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const isProSubscriber = subscriptionStatus === 'active';

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSwitchOrganization = async (orgId: string) => {
    if (orgId === organization?.id) return;
    
    const success = await setActiveOrganization(orgId);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleSwitchFramework = (code: FrameworkCode) => {
    setFramework(code);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <CosmoSecLogo size="sm" showText={false} variant="icon" />
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sidebar-foreground truncate font-space bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">CosmoSec</span>
                {isProSubscriber && (
                  <Badge className="h-5 px-1.5 text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
                    <Crown className="w-3 h-3 mr-0.5" />
                    Pro
                  </Badge>
                )}
              </div>
              {/* Organization Selector */}
              {organizations.length > 1 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors truncate">
                      <Building2 className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{organization?.name || 'Selecionar'}</span>
                      <ChevronDown className="w-3 h-3 flex-shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel>Trocar organização</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {organizations.map((org) => (
                      <DropdownMenuItem
                        key={org.id}
                        onClick={() => handleSwitchOrganization(org.id)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary">
                              {getInitials(org.name)}
                            </span>
                          </div>
                          <span className="truncate">{org.name}</span>
                        </div>
                        {org.id === organization?.id && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/selecionar-organizacao')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Gerenciar organizações
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="text-xs text-sidebar-foreground/60 truncate">
                  {organization?.name || 'GRC Platform'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Framework Selector */}
        {!collapsed && currentFramework && (
          <div className="mt-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  getFrameworkColorClass(currentFramework.code, currentFramework.is_custom),
                  "hover:opacity-80"
                )}>
                  {getFrameworkIconElement(currentFramework)}
                  <span className="font-medium truncate flex-1 text-left">{currentFramework.name}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Trocar framework</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {frameworks.map((framework) => {
                  const colorClass = getFrameworkColorClass(framework.code, framework.is_custom);
                  return (
                    <DropdownMenuItem
                      key={framework.id}
                      onClick={() => handleSwitchFramework(framework.code as FrameworkCode)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-6 h-6 rounded flex items-center justify-center flex-shrink-0", colorClass)}>
                          {getFrameworkIconElement(framework)}
                        </div>
                        <span className="truncate">{framework.name}</span>
                        {framework.is_custom && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">Custom</Badge>
                        )}
                      </div>
                      {framework.id === currentFramework.id && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/selecionar-framework')}>
                  <Layers className="w-4 h-4 mr-2" />
                  Ver todos os frameworks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
                const isCritical = item.badgeKey === 'riscos' || item.badgeKey === 'planoAcao';
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                    >
                      <RouterNavLink to={item.url} className="relative">
                        <item.icon className="w-4 h-4" />
                        <span className="flex-1">{item.title}</span>
                        {badgeCount > 0 && (
                          <Badge
                            variant={isCritical ? "destructive" : "secondary"}
                            className={cn(
                              "ml-auto h-5 min-w-5 px-1.5 text-[10px] font-medium",
                              !isCritical && "bg-primary/20 text-primary hover:bg-primary/30"
                            )}
                          >
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </Badge>
                        )}
                      </RouterNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Configuração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <RouterNavLink to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </RouterNavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full justify-start gap-3 data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                      {getInitials(user?.user_metadata?.full_name || user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="text-sm font-medium text-sidebar-foreground truncate w-full">
                          {user?.user_metadata?.full_name || 'Usuário'}
                        </span>
                        <span className="text-xs text-sidebar-foreground/60 truncate w-full">
                          {user?.email}
                        </span>
                      </div>
                      <ChevronUp className="w-4 h-4 text-sidebar-foreground/60" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <RouterNavLink to="/configuracoes" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </RouterNavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex justify-center py-2">
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
