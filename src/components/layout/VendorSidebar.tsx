import { useLocation, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useSubscription } from '@/hooks/useSubscription';
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
  LayoutDashboard,
  Building,
  Settings,
  LogOut,
  ChevronUp,
  Building2,
  ChevronDown,
  Plus,
  Check,
  Crown,
  Shield,
  ArrowLeftRight,
  FileText,
  Calendar,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/vrm', icon: LayoutDashboard },
  { title: 'Fornecedores', url: '/vrm/fornecedores', icon: Building },
  { title: 'Requisitos', url: '/vrm/requisitos', icon: FileText },
  { title: 'Agenda', url: '/vrm/agenda', icon: Calendar },
];

const configNavItems: NavItem[] = [
  { title: 'Configurações', url: '/vrm/configuracoes', icon: Settings },
];

export function VendorSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { organization, organizations, setActiveOrganization } = useOrganization();
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
      navigate('/vrm');
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <CosmoSecLogo size="sm" showText={false} variant="icon" />
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sidebar-foreground truncate font-space bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">VRM</span>
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
                  {organization?.name || 'Gestão de Fornecedores'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Module Indicator */}
        {!collapsed && (
          <div className="mt-3">
            <div className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Building className="w-4 h-4" />
              <span className="font-medium truncate flex-1 text-left">Gestão de Fornecedores</span>
            </div>
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
                      <span className="flex-1">{item.title}</span>
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

        {/* Switch to Frameworks Module */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/selecionar-modulo')}
                  tooltip="Trocar módulo"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Trocar Módulo</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/selecionar-framework')}
                  tooltip="GRC Frameworks"
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                >
                  <Shield className="w-4 h-4" />
                  <span>GRC Frameworks</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                  <RouterNavLink to="/vrm/configuracoes" className="cursor-pointer">
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
