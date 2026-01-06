import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Plus, 
  Loader2, 
  ArrowRight,
  Crown,
  Eye,
  BarChart3,
  LogOut,
  MoreVertical,
  Pencil,
  Trash2,
  Sparkles
} from 'lucide-react';
import { StarField } from '@/components/ui/star-field';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';

const roleLabels: Record<string, { label: string; icon: any; color: string }> = {
  admin: { label: 'Administrador', icon: Crown, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  auditor: { label: 'Auditor', icon: Eye, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  analyst: { label: 'Analista', icon: BarChart3, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
};

export default function SelecionarOrganizacao() {
  const navigate = useNavigate();
  const { organizations, setActiveOrganization, createOrganization, refreshOrganizations, loading } = useOrganization();
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  const [selecting, setSelecting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  
  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<{ id: string; name: string; description: string } | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Logout confirmation state
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleSelectOrganization = async (orgId: string) => {
    setSelecting(orgId);
    
    const success = await setActiveOrganization(orgId);
    
    if (success) {
      toast({
        title: 'Organização selecionada',
        description: 'Escolha o módulo que deseja acessar.',
      });
      navigate('/selecionar-modulo');
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível selecionar a organização.',
        variant: 'destructive',
      });
    }
    
    setSelecting(null);
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOrgName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome da organização.',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);

    const org = await createOrganization(newOrgName.trim(), newOrgDescription.trim() || undefined);

    if (org) {
      toast({
        title: 'Organização criada!',
        description: 'Sua nova organização foi configurada com sucesso.',
      });
      setDialogOpen(false);
      setNewOrgName('');
      setNewOrgDescription('');
      
      // Se for a primeira organização, redirecionar automaticamente
      if (organizations.length === 0) {
        navigate('/dashboard');
      }
    } else {
      toast({
        title: 'Erro ao criar organização',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }

    setCreating(false);
  };

  const handleEditOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingOrg || !editingOrg.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome da organização.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('organizations')
      .update({
        name: editingOrg.name.trim(),
        description: editingOrg.description.trim() || null,
      })
      .eq('id', editingOrg.id);

    if (error) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Organização atualizada',
        description: 'As alterações foram salvas.',
      });
      setEditDialogOpen(false);
      setEditingOrg(null);
      await refreshOrganizations();
    }

    setSaving(false);
  };

  const handleDeleteOrganization = async () => {
    if (!deletingOrg) return;

    setDeleting(true);

    // Use the secure RPC function to delete organization
    const { error } = await supabase.rpc('delete_organization', {
      _org_id: deletingOrg.id
    });

    if (error) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Organização excluída',
        description: 'A organização e todos os dados relacionados foram removidos.',
      });
      setDeleteDialogOpen(false);
      setDeletingOrg(null);
      await refreshOrganizations();
    }

    setDeleting(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Redirecionar para onboarding se não tiver organizações
  useEffect(() => {
    if (!loading && organizations.length === 0) {
      navigate('/onboarding', { replace: true });
    }
  }, [organizations, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <StarField starCount={60} dustCount={20} shootingStarCount={2} />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground animate-pulse">Carregando organizações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
      <StarField starCount={80} dustCount={25} shootingStarCount={3} />
      
      {/* Nebula Effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-4xl mx-auto pt-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150 animate-pulse" />
            <CosmoSecLogo size="xl" className="relative z-10" />
          </div>
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Central de Organizações
            </div>
            <h1 className="text-3xl font-bold text-foreground font-space">
              Selecionar Organização
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Escolha a organização que deseja acessar ou crie uma nova
            </p>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {organizations.map((org, index) => {
            const roleInfo = roleLabels[org.role || 'analyst'];
            const RoleIcon = roleInfo.icon;
            const isAdmin = org.role === 'admin';
            
            return (
              <Card 
                key={org.id} 
                className="group border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20">
                          {org.logo_url ? (
                            <img src={org.logo_url} alt={org.name} className="w-8 h-8 rounded" />
                          ) : (
                            <span className="text-lg font-bold text-primary font-space">
                              {getInitials(org.name)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-space">{org.name}</CardTitle>
                        <Badge variant="outline" className={`mt-1 ${roleInfo.color}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleInfo.label}
                        </Badge>
                      </div>
                    </div>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover/95 backdrop-blur-sm border z-50">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingOrg({
                                id: org.id,
                                name: org.name,
                                description: org.description || '',
                              });
                              setEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingOrg({ id: org.id, name: org.name });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-4 min-h-[40px]">
                    {org.description || 'Sem descrição'}
                  </CardDescription>
                  <Button 
                    className="w-full bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90 shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all"
                    disabled={selecting === org.id}
                    onClick={() => handleSelectOrganization(org.id)}
                  >
                    {selecting === org.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Acessar
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {/* Card para criar nova organização */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Card 
                className="border-dashed border-2 border-border/50 bg-card/20 backdrop-blur-xl hover:border-primary/50 hover:bg-card/40 transition-all duration-300 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${organizations.length * 0.1}s` }}
              >
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground group-hover:text-primary transition-colors">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-14 h-14 border-2 border-dashed border-current rounded-xl flex items-center justify-center group-hover:border-primary transition-colors">
                      <Plus className="w-7 h-7" />
                    </div>
                  </div>
                  <p className="font-semibold font-space text-lg">Criar Nova Organização</p>
                  <p className="text-sm text-center mt-1 opacity-70">
                    Configure um novo ambiente de GRC
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
              <form onSubmit={handleCreateOrganization}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 font-space">
                    <Building2 className="w-5 h-5 text-primary" />
                    Nova Organização
                  </DialogTitle>
                  <DialogDescription>
                    Crie uma nova organização para gerenciar separadamente.
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
                      className="bg-background/50 border-border/50 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-org-description">Descrição (opcional)</Label>
                    <Textarea
                      id="new-org-description"
                      placeholder="Breve descrição da organização..."
                      value={newOrgDescription}
                      onChange={(e) => setNewOrgDescription(e.target.value)}
                      rows={3}
                      className="bg-background/50 border-border/50 focus:border-primary/50"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating} className="bg-gradient-to-r from-primary to-primary/80">
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Criar Organização
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Footer */}
        <div className="flex justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button 
            variant="ghost" 
            onClick={() => setLogoutDialogOpen(true)} 
            className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-destructive" />
              Sair da conta
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar suas organizações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
          <form onSubmit={handleEditOrganization}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-space">
                <Pencil className="w-5 h-5 text-primary" />
                Editar Organização
              </DialogTitle>
              <DialogDescription>
                Atualize as informações da organização.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-org-name">Nome da organização *</Label>
                <Input
                  id="edit-org-name"
                  placeholder="Ex: Empresa XYZ S.A."
                  value={editingOrg?.name || ''}
                  onChange={(e) => setEditingOrg(prev => prev ? { ...prev, name: e.target.value } : null)}
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-org-description">Descrição (opcional)</Label>
                <Textarea
                  id="edit-org-description"
                  placeholder="Breve descrição da organização..."
                  value={editingOrg?.description || ''}
                  onChange={(e) => setEditingOrg(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-primary/80">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-space">Excluir Organização</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deletingOrg?.name}</strong>? Esta ação não pode ser desfeita e todos os dados associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrganization}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
