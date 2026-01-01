import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
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
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Plus, 
  Loader2, 
  Shield, 
  ArrowRight,
  Crown,
  Eye,
  BarChart3,
  LogOut
} from 'lucide-react';

const roleLabels: Record<string, { label: string; icon: any; color: string }> = {
  admin: { label: 'Administrador', icon: Crown, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  auditor: { label: 'Auditor', icon: Eye, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  analyst: { label: 'Analista', icon: BarChart3, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
};

export default function SelecionarOrganizacao() {
  const navigate = useNavigate();
  const { organizations, setActiveOrganization, createOrganization, loading } = useOrganization();
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  const [selecting, setSelecting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');

  const handleSelectOrganization = async (orgId: string) => {
    setSelecting(orgId);
    
    const success = await setActiveOrganization(orgId);
    
    if (success) {
      toast({
        title: 'Organização selecionada',
        description: 'Você foi redirecionado para o dashboard.',
      });
      navigate('/dashboard');
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando organizações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Selecionar Organização</h1>
          <p className="text-muted-foreground text-sm text-center mt-2">
            Escolha a organização que deseja acessar
          </p>
        </div>

        {/* Organizations Grid */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {organizations.map((org) => {
            const roleInfo = roleLabels[org.role || 'analyst'];
            const RoleIcon = roleInfo.icon;
            
            return (
              <Card 
                key={org.id} 
                className="group hover:border-primary/50 transition-all duration-200 cursor-pointer"
                onClick={() => handleSelectOrganization(org.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        {org.logo_url ? (
                          <img src={org.logo_url} alt={org.name} className="w-8 h-8 rounded" />
                        ) : (
                          <span className="text-lg font-bold text-primary">
                            {getInitials(org.name)}
                          </span>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <Badge variant="outline" className={`mt-1 ${roleInfo.color}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-4">
                    {org.description || 'Sem descrição'}
                  </CardDescription>
                  <Button 
                    className="w-full group-hover:bg-primary"
                    variant="outline"
                    disabled={selecting === org.id}
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
              <Card className="border-dashed hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground group-hover:text-primary">
                  <div className="w-12 h-12 border-2 border-dashed rounded-xl flex items-center justify-center mb-3 group-hover:border-primary">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="font-medium">Criar Nova Organização</p>
                  <p className="text-sm text-center mt-1">
                    Configure um novo ambiente de GRC
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateOrganization}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
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
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating}>
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
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => signOut()} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
