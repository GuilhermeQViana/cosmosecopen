import { useLocation, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useFrameworkContext, FrameworkCode } from '@/contexts/FrameworkContext';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Diagnóstico', url: '/diagnostico', icon: ClipboardCheck },
  { title: 'Riscos', url: '/riscos', icon: AlertTriangle },
  { title: 'Evidências', url: '/evidencias', icon: FileCheck },
  { title: 'Plano de Ação', url: '/plano-acao', icon: ListTodo },
  { title: 'Relatórios', url: '/relatorios', icon: FileBarChart },
];

const configNavItems = [
  { title: 'Mapeamento', url: '/mapeamento', icon: Map },
  { title: 'Equipe', url: '/equipe', icon: Users },
  { title: 'Auditoria', url: '/auditoria', icon: Activity },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
];

const frameworkIcons: Record<FrameworkCode, React.ReactNode> = {
  nist_csf: <Shield className="w-4 h-4" />,
  iso_27001: <Building2 className="w-4 h-4" />,
  bcb_cmn: <Landmark className="w-4 h-4" />,
};

const frameworkColors: Record<FrameworkCode, string> = {
  nist_csf: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  iso_27001: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  bcb_cmn: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { organization, organizations, setActiveOrganization } = useOrganization();
  const { currentFramework, frameworks, setFramework } = useFrameworkContext();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

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
          <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-sidebar-foreground truncate">Cora GovSec</span>
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
                  frameworkColors[currentFramework.code as FrameworkCode],
                  "hover:opacity-80"
                )}>
                  {frameworkIcons[currentFramework.code as FrameworkCode]}
                  <span className="font-medium truncate flex-1 text-left">{currentFramework.name}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Trocar framework</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {frameworks.map((framework) => {
                  const code = framework.code as FrameworkCode;
                  return (
                    <DropdownMenuItem
                      key={framework.id}
                      onClick={() => handleSwitchFramework(code)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-6 h-6 rounded flex items-center justify-center flex-shrink-0", frameworkColors[code])}>
                          {frameworkIcons[code]}
                        </div>
                        <span className="truncate">{framework.name}</span>
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
              {mainNavItems.map((item) => (
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
