import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { 
  User, 
  Building2, 
  Settings, 
  Bell, 
  Palette, 
  Shield, 
  Loader2, 
  Save,
  Plus,
  Mail,
  Crown,
  Eye,
  BarChart3,
  LogOut,
  Trash2,
  UserPlus,
  Check,
  X,
  Clock,
  Database,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  FileCode2,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { CustomFrameworksTab } from '@/components/configuracoes/CustomFrameworksTab';
import { ChangePasswordDialog } from '@/components/configuracoes/ChangePasswordDialog';
import { ImageUploadWithCrop } from '@/components/configuracoes/ImageUploadWithCrop';
import { ImportBackupDialog } from '@/components/configuracoes/ImportBackupDialog';
import { SubscriptionTab } from '@/components/configuracoes/SubscriptionTab';
import { ProBenefitsTab } from '@/components/configuracoes/ProBenefitsTab';

const roleLabels: Record<string, { label: string; icon: any; color: string }> = {
  admin: { label: 'Administrador', icon: Crown, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  auditor: { label: 'Auditor', icon: Eye, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  analyst: { label: 'Analista', icon: BarChart3, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
};

interface Invite {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export default function Configuracoes() {
  const { user } = useAuth();
  const { organization, organizations, refreshOrganization, refreshOrganizations, createOrganization } = useOrganization();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(false);
  
  // Profile form state
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Organization form state
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [orgDescription, setOrgDescription] = useState(organization?.description || '');
  
  // Preferences state (persisted)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [dueDateReminders, setDueDateReminders] = useState(true);
  const [layoutDensity, setLayoutDensity] = useState<'compact' | 'default' | 'comfortable'>('default');

  // Password dialog state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Invite state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('analyst');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  // New org state
  const [newOrgDialogOpen, setNewOrgDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [newOrgLoading, setNewOrgLoading] = useState(false);

  // Leave org state
  const [leaveLoading, setLeaveLoading] = useState<string | null>(null);

  // Backup state
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  // Load profile data and preferences
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, email_notifications, risk_alerts, due_date_reminders, layout_density')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setFullName(profile.full_name || '');
        setAvatarUrl(profile.avatar_url || '');
        setEmailNotifications(profile.email_notifications ?? true);
        setRiskAlerts(profile.risk_alerts ?? true);
        setDueDateReminders(profile.due_date_reminders ?? true);
        setLayoutDensity((profile.layout_density as 'compact' | 'default' | 'comfortable') || 'default');
      }
    };
    
    loadProfile();
  }, [user]);

  // Apply layout density to document
  useEffect(() => {
    document.documentElement.dataset.density = layoutDensity;
  }, [layoutDensity]);

  // Update org form when organization changes
  useEffect(() => {
    if (organization) {
      setOrgName(organization.name);
      setOrgDescription(organization.description || '');
    }
  }, [organization]);

  // Load invites
  useEffect(() => {
    const loadInvites = async () => {
      if (!organization) return;
      
      setInvitesLoading(true);
      const { data, error } = await supabase
        .from('organization_invites')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setInvites(data);
      }
      setInvitesLoading(false);
    };
    
    loadInvites();
  }, [organization]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!organization) return;
    
    setOrgLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: orgName,
          description: orgDescription,
        })
        .eq('id', organization.id);
      
      if (error) throw error;
      await refreshOrganization();
      await refreshOrganizations();
      toast.success('Organização atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Erro ao atualizar organização');
    } finally {
      setOrgLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !inviteEmail) return;
    
    setInviteLoading(true);
    try {
      const { error } = await supabase
        .from('organization_invites')
        .insert([{
          organization_id: organization.id,
          email: inviteEmail.toLowerCase().trim(),
          role: inviteRole as 'admin' | 'auditor' | 'analyst',
          invited_by: user?.id,
        }]);
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Este email já foi convidado para esta organização');
        }
        throw error;
      }
      
      // Reload invites
      const { data } = await supabase
        .from('organization_invites')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });
      
      if (data) setInvites(data);
      
      toast.success('Convite enviado com sucesso!');
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('analyst');
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast.error(error.message || 'Erro ao enviar convite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('organization_invites')
        .delete()
        .eq('id', inviteId);
      
      if (error) throw error;
      
      setInvites(invites.filter(i => i.id !== inviteId));
      toast.success('Convite cancelado');
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast.error('Erro ao cancelar convite');
    }
  };

  const handleCreateNewOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    
    setNewOrgLoading(true);
    const org = await createOrganization(newOrgName.trim(), newOrgDescription.trim() || undefined);
    
    if (org) {
      toast.success('Organização criada com sucesso!');
      setNewOrgDialogOpen(false);
      setNewOrgName('');
      setNewOrgDescription('');
    } else {
      toast.error('Erro ao criar organização');
    }
    setNewOrgLoading(false);
  };

  const handleLeaveOrganization = async (orgId: string) => {
    setLeaveLoading(orgId);
    try {
      const { error } = await supabase.rpc('leave_organization', { _org_id: orgId });
      
      if (error) throw error;
      
      await refreshOrganizations();
      await refreshOrganization();
      
      toast.success('Você saiu da organização');
      
      // Se saiu da organização ativa, redirecionar
      if (organization?.id === orgId) {
        navigate('/selecionar-organizacao');
      }
    } catch (error: any) {
      console.error('Error leaving organization:', error);
      toast.error(error.message || 'Erro ao sair da organização');
    } finally {
      setLeaveLoading(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleExportData = async () => {
    if (!organization) return;
    
    setExportLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data', {
        body: { format: exportFormat }
      });
      
      if (error) throw error;
      
      // Download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${organization.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Backup exportado com sucesso!');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setExportLoading(false);
    }
  };

  const handleUpdatePreference = async (field: string, value: boolean | string) => {
    if (!user) return;
    
    setPrefsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user.id);
      
      if (error) throw error;
      toast.success('Preferência atualizada!');
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Erro ao atualizar preferência');
    } finally {
      setPrefsLoading(false);
    }
  };

  const handleNotificationChange = (field: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    handleUpdatePreference(field, value);
  };

  const handleLayoutDensityChange = (value: 'compact' | 'default' | 'comfortable') => {
    setLayoutDensity(value);
    handleUpdatePreference('layout_density', value);
  };

  const isAdmin = organization?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto lg:w-[1080px] lg:grid lg:grid-cols-9">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="pro" className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="hidden sm:inline">Pro</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Assinatura</span>
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Organização</span>
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Minhas Orgs</span>
          </TabsTrigger>
          <TabsTrigger value="frameworks" className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4" />
            <span className="hidden sm:inline">Frameworks</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Dados</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
        </TabsList>

        {/* Pro Benefits Tab */}
        <TabsContent value="pro" className="space-y-6">
          <ProBenefitsTab />
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionTab />
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Foto de Perfil</Label>
                <ImageUploadWithCrop
                  currentImageUrl={avatarUrl}
                  onUploadComplete={async (url) => {
                    setAvatarUrl(url);
                    // Auto-save avatar URL to profile
                    if (user) {
                      await supabase
                        .from('profiles')
                        .update({ avatar_url: url })
                        .eq('id', user.id);
                    }
                  }}
                  bucket="avatars"
                  folder={user?.id || ''}
                  aspectRatio={1}
                  label="Alterar Foto"
                  fallbackText={getInitials(fullName || user?.email || 'U')}
                  size="lg"
                  shape="circle"
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={profileLoading}>
                {profileLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Gerencie suas configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alterar Senha</p>
                  <p className="text-sm text-muted-foreground">
                    Atualize sua senha de acesso
                  </p>
                </div>
                <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
                  Alterar
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma camada extra de segurança
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button variant="outline" disabled>
                          Configurar
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Em breve: Autenticação de dois fatores</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
          
          <ChangePasswordDialog 
            open={passwordDialogOpen} 
            onOpenChange={setPasswordDialogOpen} 
          />
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Organização
              </CardTitle>
              <CardDescription>
                {isAdmin ? 'Atualize as informações da sua organização' : 'Visualize as informações da organização'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isAdmin && (
                <div>
                  <Label className="mb-3 block">Logo da Organização</Label>
                  <ImageUploadWithCrop
                    currentImageUrl={organization?.logo_url || undefined}
                    onUploadComplete={async (url) => {
                      if (organization) {
                        const { error } = await supabase
                          .from('organizations')
                          .update({ logo_url: url })
                          .eq('id', organization.id);
                        
                        if (!error) {
                          await refreshOrganization();
                          toast.success('Logo atualizado!');
                        }
                      }
                    }}
                    bucket="logos"
                    folder={organization?.id || ''}
                    aspectRatio={1}
                    label="Alterar Logo"
                    fallbackText={getInitials(organization?.name || 'ORG')}
                    size="lg"
                    shape="square"
                  />
                </div>
              )}
              
              {isAdmin && <Separator />}
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Nome da Organização</Label>
                  <Input
                    id="orgName"
                    placeholder="Nome da empresa"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgDescription">Descrição</Label>
                  <Textarea
                    id="orgDescription"
                    placeholder="Breve descrição da organização"
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    rows={4}
                    disabled={!isAdmin}
                  />
                </div>
              </div>

              {isAdmin && (
                <Button onClick={handleSaveOrganization} disabled={orgLoading}>
                  {orgLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar Alterações
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Invites Section - Admin Only */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Convites Pendentes
                    </CardTitle>
                    <CardDescription>
                      Gerencie convites para novos membros
                    </CardDescription>
                  </div>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Convidar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleSendInvite}>
                        <DialogHeader>
                          <DialogTitle>Convidar Membro</DialogTitle>
                          <DialogDescription>
                            Envie um convite para um novo membro da organização
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="invite-email">E-mail</Label>
                            <Input
                              id="invite-email"
                              type="email"
                              placeholder="email@exemplo.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invite-role">Papel</Label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="auditor">Auditor</SelectItem>
                                <SelectItem value="analyst">Analista</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={inviteLoading}>
                            {inviteLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Mail className="mr-2 h-4 w-4" />
                            )}
                            Enviar Convite
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {invitesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : invites.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>Nenhum convite pendente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invites.map((invite) => {
                      const roleInfo = roleLabels[invite.role];
                      const RoleIcon = roleInfo?.icon || BarChart3;
                      const isExpired = new Date(invite.expires_at) < new Date();
                      const isAccepted = !!invite.accepted_at;
                      
                      return (
                        <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{invite.email}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-xs ${roleInfo?.color}`}>
                                  <RoleIcon className="w-3 h-3 mr-1" />
                                  {roleInfo?.label}
                                </Badge>
                                {isAccepted ? (
                                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                                    <Check className="w-3 h-3 mr-1" />
                                    Aceito
                                  </Badge>
                                ) : isExpired ? (
                                  <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600">
                                    <X className="w-3 h-3 mr-1" />
                                    Expirado
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pendente
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {!isAccepted && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteInvite(invite.id)}
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Frameworks Ativos</CardTitle>
              <CardDescription>
                Frameworks de conformidade habilitados para sua organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">NIST</span>
                  </div>
                  <div>
                    <p className="font-medium">NIST Cybersecurity Framework 2.0</p>
                    <p className="text-sm text-muted-foreground">75 controles</p>
                  </div>
                </div>
                <Switch defaultChecked disabled={!isAdmin} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">ISO</span>
                  </div>
                  <div>
                    <p className="font-medium">ISO 27001:2022</p>
                    <p className="text-sm text-muted-foreground">93 controles</p>
                  </div>
                </div>
                <Switch defaultChecked disabled={!isAdmin} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">BCB</span>
                  </div>
                  <div>
                    <p className="font-medium">BCB/CMN 4.893</p>
                    <p className="text-sm text-muted-foreground">49 controles</p>
                  </div>
                </div>
                <Switch defaultChecked disabled={!isAdmin} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Minhas Organizações</CardTitle>
                  <CardDescription>
                    Organizações das quais você faz parte
                  </CardDescription>
                </div>
                <Dialog open={newOrgDialogOpen} onOpenChange={setNewOrgDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Organização
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleCreateNewOrg}>
                      <DialogHeader>
                        <DialogTitle>Nova Organização</DialogTitle>
                        <DialogDescription>
                          Crie uma nova organização para gerenciar separadamente
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-org-name">Nome da organização *</Label>
                          <Input
                            id="new-org-name"
                            placeholder="Ex: Empresa XYZ S.A."
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-org-desc">Descrição (opcional)</Label>
                          <Textarea
                            id="new-org-desc"
                            placeholder="Breve descrição da organização..."
                            value={newOrgDescription}
                            onChange={(e) => setNewOrgDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setNewOrgDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={newOrgLoading}>
                          {newOrgLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          Criar Organização
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organizations.map((org) => {
                  const roleInfo = roleLabels[org.role || 'analyst'];
                  const RoleIcon = roleInfo?.icon || BarChart3;
                  const isActive = org.id === organization?.id;
                  const isOnlyOrg = organizations.length === 1;
                  
                  return (
                    <div 
                      key={org.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg ${isActive ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {getInitials(org.name)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{org.name}</p>
                            {isActive && (
                              <Badge variant="outline" className="text-xs">Ativa</Badge>
                            )}
                          </div>
                          <Badge variant="outline" className={`text-xs mt-1 ${roleInfo?.color}`}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleInfo?.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isOnlyOrg && org.role !== 'admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <LogOut className="w-4 h-4 mr-1" />
                                Sair
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Sair da organização?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Você perderá acesso a todos os dados desta organização. 
                                  Para entrar novamente, precisará de um novo convite.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleLeaveOrganization(org.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {leaveLoading === org.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <LogOut className="mr-2 h-4 w-4" />
                                  )}
                                  Sair
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Frameworks Tab */}
        <TabsContent value="frameworks" className="space-y-6">
          <CustomFrameworksTab />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações por E-mail</p>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes por e-mail
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(v) => handleNotificationChange('email_notifications', v, setEmailNotifications)}
                  disabled={prefsLoading}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de Riscos</p>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado sobre novos riscos críticos
                  </p>
                </div>
                <Switch
                  checked={riskAlerts}
                  onCheckedChange={(v) => handleNotificationChange('risk_alerts', v, setRiskAlerts)}
                  disabled={prefsLoading}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lembretes de Prazo</p>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes antes do vencimento de tarefas
                  </p>
                </div>
                <Switch
                  checked={dueDateReminders}
                  onCheckedChange={(v) => handleNotificationChange('due_date_reminders', v, setDueDateReminders)}
                  disabled={prefsLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data/Backup Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup de Dados
              </CardTitle>
              <CardDescription>
                Exporte um backup completo dos dados da sua organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Exportar Backup Completo</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Inclui controles avaliados, riscos, planos de ação e metadados de evidências
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={exportFormat === 'json' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat('json')}
                        className="gap-2"
                      >
                        <FileJson className="h-4 w-4" />
                        JSON
                      </Button>
                      <Button
                        variant={exportFormat === 'csv' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat('csv')}
                        className="gap-2"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        CSV
                      </Button>
                    </div>
                    <Button onClick={handleExportData} disabled={exportLoading}>
                      {exportLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Exportar Agora
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">O que está incluído no backup:</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Avaliações de controles</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Registro de riscos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Planos de ação</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Metadados de evidências</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nota: Arquivos de evidências não são incluídos no backup. Faça download individualmente se necessário.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Import Section */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Restaurar Backup
                </CardTitle>
                <CardDescription>
                  Importe dados de um backup JSON ou CSV exportado anteriormente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Upload className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Importar Backup</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Restaure avaliações, riscos e planos de ação de um arquivo de backup
                    </p>
                    <div className="mt-4">
                      <ImportBackupDialog />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Modo Escuro</p>
                  <p className="text-sm text-muted-foreground">
                    Alterne entre tema claro e escuro
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-3">Densidade do Layout</p>
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant={layoutDensity === 'compact' ? 'default' : 'outline'} 
                    className="h-20 flex-col gap-2"
                    onClick={() => handleLayoutDensityChange('compact')}
                  >
                    <div className="space-y-1">
                      <div className={`h-1 w-8 rounded ${layoutDensity === 'compact' ? 'bg-primary-foreground/50' : 'bg-muted-foreground/30'}`} />
                      <div className={`h-1 w-6 rounded ${layoutDensity === 'compact' ? 'bg-primary-foreground/50' : 'bg-muted-foreground/30'}`} />
                    </div>
                    <span className="text-xs">Compacto</span>
                  </Button>
                  <Button 
                    variant={layoutDensity === 'default' ? 'default' : 'outline'} 
                    className="h-20 flex-col gap-2"
                    onClick={() => handleLayoutDensityChange('default')}
                  >
                    <div className="space-y-1.5">
                      <div className={`h-1.5 w-8 rounded ${layoutDensity === 'default' ? 'bg-primary-foreground/50' : 'bg-muted-foreground/30'}`} />
                      <div className={`h-1.5 w-6 rounded ${layoutDensity === 'default' ? 'bg-primary-foreground/50' : 'bg-muted-foreground/30'}`} />
                    </div>
                    <span className="text-xs">Padrão</span>
                  </Button>
                  <Button 
                    variant={layoutDensity === 'comfortable' ? 'default' : 'outline'} 
                    className="h-20 flex-col gap-2"
                    onClick={() => handleLayoutDensityChange('comfortable')}
                  >
                    <div className="space-y-2">
                      <div className={`h-2 w-8 rounded ${layoutDensity === 'comfortable' ? 'bg-primary-foreground/50' : 'bg-muted-foreground/30'}`} />
                      <div className={`h-2 w-6 rounded ${layoutDensity === 'comfortable' ? 'bg-primary-foreground/50' : 'bg-muted-foreground/30'}`} />
                    </div>
                    <span className="text-xs">Confortável</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
