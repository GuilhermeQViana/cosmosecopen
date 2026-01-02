import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, ArrowRight, Loader2, Sparkles, Rocket } from 'lucide-react';
import { StarField } from '@/components/ui/star-field';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createOrganization, organizations, loading: orgLoading } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

  // Redirecionar se usuário já tem organizações
  useEffect(() => {
    if (!orgLoading && organizations.length > 0) {
      navigate('/selecionar-organizacao', { replace: true });
    }
  }, [organizations, orgLoading, navigate]);

  // Mostrar loading enquanto verifica organizações
  if (orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <StarField starCount={60} dustCount={20} shootingStarCount={2} />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground animate-pulse">Verificando...</p>
        </div>
      </div>
    );
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado.',
        variant: 'destructive',
      });
      return;
    }

    if (!orgName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome da organização.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const org = await createOrganization(orgName.trim(), orgDescription.trim() || undefined);

      if (org) {
        toast({
          title: 'Organização criada!',
          description: 'Sua organização foi configurada com sucesso.',
        });
        navigate('/dashboard');
      } else {
        throw new Error('Falha ao criar organização');
      }
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Erro ao criar organização',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
      <StarField starCount={80} dustCount={25} shootingStarCount={3} />
      
      {/* Nebula Effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full blur-2xl" />
      
      {/* Animated Orbs */}
      <div className="absolute top-20 right-20 w-3 h-3 bg-primary rounded-full animate-float opacity-60" />
      <div className="absolute bottom-32 left-24 w-2 h-2 bg-secondary rounded-full animate-float opacity-40" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-nebula rounded-full animate-float opacity-50" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-lg relative z-10">
        {/* Logo and Welcome */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="relative mb-6">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150 animate-pulse" />
            <CosmoSecLogo size="xl" className="relative z-10" />
          </div>
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Bem-vindo ao universo GRC
            </div>
            <h1 className="text-3xl font-bold text-foreground font-space bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
              Vamos Começar!
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Configure sua primeira organização para iniciar sua jornada de compliance
            </p>
          </div>
        </div>

        {/* Card with glassmorphism */}
        <Card className="border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl shadow-primary/5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div>
                <CardTitle className="text-xl font-space">Dados da Organização</CardTitle>
                <CardDescription className="text-sm">
                  Informe os dados básicos. Você poderá editar depois.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrganization} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="org-name" className="text-sm font-medium">
                  Nome da organização <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="org-name"
                  placeholder="Ex: Empresa XYZ S.A."
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  className="h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-description" className="text-sm font-medium">
                  Descrição <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Textarea
                  id="org-description"
                  placeholder="Breve descrição da organização..."
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  rows={3}
                  className="bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 placeholder:text-muted-foreground/50 resize-none"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 group" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando sua organização...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 group-hover:animate-pulse" />
                    Iniciar Jornada
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bottom decoration */}
        <div className="flex items-center justify-center gap-1 mt-8 opacity-40">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
