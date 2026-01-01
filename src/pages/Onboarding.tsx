import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, ArrowRight, Loader2, Shield } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createOrganization } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bem-vindo ao Cora GovSec</h1>
          <p className="text-muted-foreground text-sm text-center mt-2">
            Configure sua primeira organização para começar
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Dados da Organização</CardTitle>
            <CardDescription>
              Informe os dados básicos da sua organização. Você poderá editá-los depois.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Nome da organização *</Label>
                <Input
                  id="org-name"
                  placeholder="Ex: Empresa XYZ S.A."
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-description">Descrição (opcional)</Label>
                <Textarea
                  id="org-description"
                  placeholder="Breve descrição da organização..."
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
