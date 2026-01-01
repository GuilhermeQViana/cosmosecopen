import { useNavigate } from 'react-router-dom';
import { useFrameworkContext, FrameworkCode } from '@/contexts/FrameworkContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Building2, Landmark, Check, Loader2, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const frameworkIcons: Record<FrameworkCode, React.ReactNode> = {
  nist_csf: <Shield className="w-8 h-8" />,
  iso_27001: <Building2 className="w-8 h-8" />,
  bcb_cmn: <Landmark className="w-8 h-8" />,
};

const frameworkColors: Record<FrameworkCode, string> = {
  nist_csf: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  iso_27001: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  bcb_cmn: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

const frameworkDescriptions: Record<FrameworkCode, string> = {
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando frameworks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Selecione um Framework
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Escolha o framework de compliance que deseja trabalhar. Você pode trocar a qualquer momento.
          </p>
        </div>

        {/* Framework Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {frameworks.map((framework) => {
            const code = framework.code as FrameworkCode;
            const isSelected = currentFramework?.code === code;
            const controlCount = controlCounts[framework.id] || 0;

            return (
              <Card
                key={framework.id}
                className={`relative cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => handleSelectFramework(code)}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3 ${frameworkColors[code]}`}>
                    {frameworkIcons[code]}
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {framework.name}
                    {framework.version && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        v{framework.version}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {frameworkDescriptions[code]}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Controles</span>
                    <span className="font-semibold text-foreground">{controlCount}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
