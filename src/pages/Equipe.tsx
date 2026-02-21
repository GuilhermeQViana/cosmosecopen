import { useState } from 'react';
import { useTeamMembers, useCreateInvite, useUpdateMemberRole, useRemoveMember } from '@/hooks/useTeamMembers';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Shield,
  Eye,
  BarChart3,
  Mail,
  MoreHorizontal,
  Loader2,
  Crown,
  Search,
  UserMinus,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  auditor: 'Auditor',
  analyst: 'Analista',
};

const roleColors: Record<string, string> = {
  admin: 'bg-[hsl(var(--chart-5))]/10 text-[hsl(var(--chart-5))] border-[hsl(var(--chart-5))]/30',
  auditor: 'bg-[hsl(var(--chart-1))]/10 text-[hsl(var(--chart-1))] border-[hsl(var(--chart-1))]/30',
  analyst: 'bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2))]/30',
};

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  admin: Crown,
  auditor: Eye,
  analyst: BarChart3,
};

export default function Equipe() {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { data: members, isLoading, refetch } = useTeamMembers();
  const createInvite = useCreateInvite();
  const updateMemberRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('analyst');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [newRole, setNewRole] = useState<AppRole>('analyst');
  
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Por favor, informe o e-mail');
      return;
    }

    if (!organization?.id) {
      toast.error('Organização não encontrada');
      return;
    }

    setSending(true);
    try {
      // Create the invite in the database
      const inviteData = await createInvite.mutateAsync({
        email: inviteEmail,
        role: inviteRole,
      });

      // Send the email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: inviteEmail,
          organizationName: organization.name,
          inviterName: user?.user_metadata?.full_name || 'Um administrador',
          role: inviteRole,
          inviteToken: inviteData.token,
          appUrl: window.location.origin,
        },
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        toast.warning('Convite criado, mas houve um erro ao enviar o email', {
          description: 'O convite foi salvo. Você pode compartilhar o link manualmente.',
        });
      } else {
        toast.success('Convite enviado!', {
          description: `Um convite foi enviado para ${inviteEmail}`,
        });
      }
      
      setInviteEmail('');
      setInviteRole('analyst');
      setInviteOpen(false);
    } catch (error: any) {
      toast.error('Erro ao criar convite', {
        description: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedMember || !newRole) return;

    try {
      await updateMemberRole.mutateAsync({
        memberId: selectedMember.id,
        newRole,
      });
      toast.success('Função alterada com sucesso');
      setChangeRoleOpen(false);
      setSelectedMember(null);
    } catch (error: any) {
      toast.error('Erro ao alterar função', {
        description: error.message,
      });
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMember.mutateAsync(memberToRemove.id);
      toast.success('Membro removido com sucesso');
      setRemoveMemberOpen(false);
      setMemberToRemove(null);
    } catch (error: any) {
      toast.error('Erro ao remover membro', {
        description: error.message,
      });
    }
  };

  const openChangeRole = (member: any) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setChangeRoleOpen(true);
  };

  const openRemoveMember = (member: any) => {
    setMemberToRemove(member);
    setRemoveMemberOpen(true);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredMembers = members?.filter(member =>
    member.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: members?.length || 0,
    admins: members?.filter(m => m.role === 'admin').length || 0,
    auditors: members?.filter(m => m.role === 'auditor').length || 0,
    analysts: members?.filter(m => m.role === 'analyst').length || 0,
  };

  const currentUserIsAdmin = members?.some(m => m.user_id === user?.id && m.role === 'admin');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os membros e permissões da {organization?.name || 'organização'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {currentUserIsAdmin && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convidar Membro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Convidar Novo Membro</DialogTitle>
                  <DialogDescription>
                    Envie um convite por e-mail para adicionar um novo membro à equipe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@empresa.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Administrador
                          </div>
                        </SelectItem>
                        <SelectItem value="auditor">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Auditor
                          </div>
                        </SelectItem>
                        <SelectItem value="analyst">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analista
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="p-3 text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Permissões por função:</p>
                      <ul className="space-y-1">
                        <li><strong>Admin:</strong> Acesso total, gestão de equipe e configurações</li>
                        <li><strong>Auditor:</strong> Visualização completa, avaliação de controles</li>
                        <li><strong>Analista:</strong> Edição de riscos, planos de ação e evidências</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleInvite} disabled={sending}>
                    {sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar Convite
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total de Membros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--chart-5))]/10">
                <Crown className="h-5 w-5 text-[hsl(var(--chart-5))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--chart-1))]/10">
                <Eye className="h-5 w-5 text-[hsl(var(--chart-1))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.auditors}</p>
                <p className="text-xs text-muted-foreground">Auditores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--chart-2))]/10">
                <BarChart3 className="h-5 w-5 text-[hsl(var(--chart-2))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.analysts}</p>
                <p className="text-xs text-muted-foreground">Analistas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Membros da Equipe</CardTitle>
              <CardDescription>Lista de todos os membros com acesso à plataforma</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar membros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Entrada</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers?.map((member) => {
                  const RoleIcon = roleIcons[member.role] || Shield;
                  const isCurrentUser = member.user_id === user?.id;
                  const canManage = currentUserIsAdmin && !isCurrentUser;
                  
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(member.profile?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.profile?.full_name || 'Usuário'}
                              {isCurrentUser && (
                                <Badge variant="outline" className="ml-2 text-xs">Você</Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.profile?.email || `ID: ${member.user_id.slice(0, 8)}...`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[member.role]}>
                          <RoleIcon className="mr-1 h-3 w-3" />
                          {roleLabels[member.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openChangeRole(member)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Alterar Função
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => openRemoveMember(member)}
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Remover Membro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={changeRoleOpen} onOpenChange={setChangeRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Função</DialogTitle>
            <DialogDescription>
              Altere a função de {selectedMember?.profile?.full_name || 'este membro'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Nova Função</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="auditor">Auditor</SelectItem>
                <SelectItem value="analyst">Analista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeRole} disabled={updateMemberRole.isPending}>
              {updateMemberRole.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={removeMemberOpen} onOpenChange={setRemoveMemberOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {memberToRemove?.profile?.full_name || 'este membro'} da organização?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMember.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
