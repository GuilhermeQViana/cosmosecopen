import { useNavigate } from 'react-router-dom';
import { useFrameworkContext, FrameworkCode } from '@/contexts/FrameworkContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Building2, Landmark, Check, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StarField } from '@/components/ui/star-field';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';
import { getFrameworkIcon } from '@/lib/framework-icons';

const standardFrameworkColors: Record<string, string> = {
  nist_csf: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-500',
  iso_27001: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-500',
  bcb_cmn: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-500',
};

const customFrameworkColor = 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-500';

const frameworkDescriptions: Record<string, string> = {
  nist_csf: 'Framework de cibersegurança do NIST focado em identificar, proteger, detectar, responder e recuperar.',
  iso_27001: 'Padrão internacional para sistemas de gestão de segurança da informação (SGSI).',
  bcb_cmn: 'Regulamentação do Banco Central do Brasil para instituições financeiras.',
};

export default function SelecionarFramework() {
  const navigate = useNavigate();
  const { frameworks, currentFramework, setFramework, isLoading: frameworksLoading } = useFrameworkContext();

  // Get control counts for each framework
  const { data: controlCounts = {} } = useQuery({
    queryKey: ['framework-control-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('controls')
        .select('framework_id');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((control) => {
        counts[control.framework_id] = (counts[control.framework_id] || 0) + 1;
      });
      return counts;
    },
  });

  const handleSelectFramework = (code: FrameworkCode) => {
    setFramework(code);
    navigate('/dashboard');
  };

  if (frameworksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <StarField starCount={60} dustCount={20} shootingStarCount={2} />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground animate-pulse">Carregando frameworks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
      <StarField starCount={80} dustCount={25} shootingStarCount={3} />
      
      {/* Nebula Effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
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
              Escolha seu Framework
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-3 font-space">
            Selecione um Framework
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Escolha o framework de compliance que deseja trabalhar. Você pode trocar a qualquer momento.
          </p>
        </div>

        {/* Framework Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {frameworks.map((framework, index) => {
            const code = framework.code as FrameworkCode;
            const isSelected = currentFramework?.code === code;
            const controlCount = controlCounts[framework.id] || 0;
            const isCustom = framework.is_custom;
            const colorClass = isCustom ? customFrameworkColor : (standardFrameworkColors[code] || customFrameworkColor);
            const IconComponent = getFrameworkIcon(isCustom ? framework.icon : code);

            return (
              <Card
                key={framework.id}
                className={`relative cursor-pointer transition-all duration-300 border-border/50 bg-card/40 backdrop-blur-xl hover:shadow-xl hover:shadow-primary/10 group animate-fade-in ${
                  isSelected ? 'border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20' : 'hover:border-primary/50'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleSelectFramework(code)}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-lg" 
                         style={{ background: `linear-gradient(135deg, var(--primary) 0%, transparent 100%)` }} />
                    <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br border ${colorClass}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2 font-space">
                    {framework.name}
                    {framework.version && (
                      <Badge variant="secondary" className="text-xs font-normal bg-secondary/50">
                        v{framework.version}
                      </Badge>
                    )}
                    {isCustom && (
                      <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Custom
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm min-h-[60px]">
                    {frameworkDescriptions[code] || framework.description || 'Framework customizado de compliance.'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-background/50 border border-border/30">
                    <span className="text-muted-foreground">Controles</span>
                    <span className="font-bold text-foreground font-space">{controlCount}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Back button */}
        <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
