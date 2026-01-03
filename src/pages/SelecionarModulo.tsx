import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Building, ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { StarField } from '@/components/ui/star-field';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Navigate } from 'react-router-dom';

const modules = [
  {
    id: 'frameworks',
    title: 'GRC Frameworks',
    description: 'Gestão de Compliance baseada em frameworks como NIST CSF, ISO 27001 e BCB/CMN. Diagnóstico de controles, riscos e planos de ação.',
    icon: Shield,
    colorClass: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-500',
    bgGlow: 'bg-blue-500/20',
    route: '/selecionar-framework',
  },
  {
    id: 'vendors',
    title: 'Gestão de Fornecedores',
    description: 'VRM independente para avaliação de terceiros. Segurança da Informação, Cyber Security, Privacidade (LGPD) e Continuidade de Negócios.',
    icon: Building,
    colorClass: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-500',
    bgGlow: 'bg-purple-500/20',
    route: '/vrm',
  },
];

export default function SelecionarModulo() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { organization, organizations, loading: orgLoading } = useOrganization();

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <StarField starCount={60} dustCount={20} shootingStarCount={2} />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (organizations.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!organization) {
    return <Navigate to="/selecionar-organizacao" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
      <StarField starCount={80} dustCount={25} shootingStarCount={3} />
      
      {/* Nebula Effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container max-w-4xl mx-auto py-12 px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150 animate-pulse" />
              <CosmoSecLogo size="xl" className="relative z-10" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Escolha seu Módulo
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-3 font-space">
            O que você deseja gerenciar?
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Escolha o módulo que deseja acessar. Você pode alternar entre eles a qualquer momento.
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {modules.map((module, index) => {
            const IconComponent = module.icon;
            
            return (
              <Card
                key={module.id}
                className="relative cursor-pointer transition-all duration-300 border-border/50 bg-card/40 backdrop-blur-xl hover:shadow-xl hover:shadow-primary/10 group animate-fade-in hover:border-primary/50"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(module.route)}
              >
                <CardHeader className="pb-3">
                  <div className="relative mb-4">
                    <div className={`absolute inset-0 ${module.bgGlow} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br border ${module.colorClass}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-space">{module.title}</CardTitle>
                  <CardDescription className="text-sm min-h-[60px]">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Button
                    className="w-full bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90 shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all"
                  >
                    Acessar
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Back button */}
        <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button
            variant="ghost"
            onClick={() => navigate('/selecionar-organizacao')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Trocar organização
          </Button>
        </div>
      </div>
    </div>
  );
}
