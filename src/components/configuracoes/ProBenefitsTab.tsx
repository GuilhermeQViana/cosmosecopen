import { Crown, Check, Sparkles, Zap, Shield, BarChart3, Clock, Users, FileText, Bot, Database, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { Skeleton } from '@/components/ui/skeleton';

const proBenefits = [
  {
    icon: Shield,
    title: 'Diagnóstico Completo',
    description: 'Acesso a todos os frameworks de compliance (NIST, ISO 27001, BCB/CMN)',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Avançado',
    description: 'Métricas detalhadas com histórico de evolução e tendências',
  },
  {
    icon: Bot,
    title: 'Planos de Ação com IA',
    description: 'Geração automática de planos de ação personalizados por IA',
  },
  {
    icon: FileText,
    title: 'Relatórios Executivos',
    description: 'Exportação de relatórios profissionais em PDF e Excel',
  },
  {
    icon: Users,
    title: 'Equipe Ilimitada',
    description: 'Convide quantos membros precisar para sua organização',
  },
  {
    icon: Database,
    title: 'Backup & Exportação',
    description: 'Exporte todos os dados da sua organização a qualquer momento',
  },
  {
    icon: Clock,
    title: 'Histórico Completo',
    description: 'Auditoria detalhada de todas as alterações e versões',
  },
  {
    icon: Lock,
    title: 'Cofre de Evidências',
    description: 'Armazenamento seguro e ilimitado de documentos e evidências',
  },
  {
    icon: Zap,
    title: 'Notificações Inteligentes',
    description: 'Alertas de prazos, riscos críticos e atualizações importantes',
  },
];

export function ProBenefitsTab() {
  const { subscriptionStatus, isLoading, openCustomerPortal } = useSubscription();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const isProSubscriber = subscriptionStatus === 'active';

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className={isProSubscriber 
        ? "bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/10 border-amber-500/30" 
        : "bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border-primary/30"
      }>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isProSubscriber ? 'bg-amber-500/20' : 'bg-primary/20'}`}>
                <Crown className={`h-8 w-8 ${isProSubscriber ? 'text-amber-500' : 'text-primary'}`} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  Plano Pro
                  {isProSubscriber && (
                    <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {isProSubscriber 
                    ? 'Você tem acesso a todos os recursos exclusivos do CosmoSec' 
                    : 'Desbloqueie todo o potencial do CosmoSec com o plano Pro'
                  }
                </CardDescription>
              </div>
            </div>
            {isProSubscriber && (
              <Button 
                variant="outline" 
                onClick={openCustomerPortal}
                className="border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              >
                Gerenciar Assinatura
              </Button>
            )}
          </div>
        </CardHeader>
        {isProSubscriber && (
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              <span>Todos os benefícios estão ativos para sua organização</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Benefits Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Benefícios Exclusivos do Plano Pro
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {proBenefits.map((benefit, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden transition-all hover:shadow-md ${
                isProSubscriber 
                  ? 'border-amber-500/20 hover:border-amber-500/40' 
                  : 'border-muted hover:border-primary/40'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isProSubscriber 
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium flex items-center gap-2">
                      {benefit.title}
                      {isProSubscriber && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </CardContent>
              {isProSubscriber && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent" />
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Info for non-subscribers */}
      {!isProSubscriber && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <div className="inline-flex items-center gap-2 text-3xl font-bold mb-2">
              <span className="text-muted-foreground line-through text-lg">R$ 599,90</span>
              <span>R$ 449,90</span>
              <span className="text-base font-normal text-muted-foreground">/mês</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Comece com 7 dias de teste grátis. Cancele quando quiser.
            </p>
            <Badge variant="outline" className="text-green-600 border-green-500/30 bg-green-500/10">
              Economia de R$ 150/mês
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}