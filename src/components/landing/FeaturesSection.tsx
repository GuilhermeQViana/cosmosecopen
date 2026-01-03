import { 
  ClipboardCheck, 
  AlertTriangle, 
  FolderLock, 
  ListTodo, 
  BarChart3, 
  History,
  Sparkles,
  Building2,
  Radar,
  CheckSquare,
  Calendar,
  Settings,
  Search
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function FeaturesSection() {
  const grcFeatures = [
    {
      icon: ClipboardCheck,
      title: 'Diagnóstico de Controles',
      description: 'Avalie a maturidade dos seus controles de 0 a 5, com Risk Score automático e observações detalhadas.',
      badge: null,
    },
    {
      icon: AlertTriangle,
      title: 'Gestão de Riscos',
      description: 'Matriz de riscos 5x5, análise de probabilidade e impacto, histórico de tendências e vinculação com controles.',
      badge: null,
    },
    {
      icon: FolderLock,
      title: 'Cofre de Evidências',
      description: 'Armazenamento seguro de documentos com classificação, tags, versionamento e links com avaliações.',
      badge: null,
    },
    {
      icon: ListTodo,
      title: 'Plano de Ação',
      description: 'Visualização Kanban e Calendário, notificações automáticas por email, subtarefas e progresso.',
      badge: 'IA',
    },
    {
      icon: BarChart3,
      title: 'Relatórios Executivos',
      description: 'Dashboards interativos, gráficos de maturidade, tendências e exportação em PDF.',
      badge: null,
    },
    {
      icon: History,
      title: 'Trilha de Auditoria',
      description: 'Registro completo de todas as ações, alterações e acessos para compliance e investigações.',
      badge: null,
    },
  ];

  const vrmFeatures = [
    {
      icon: Building2,
      title: 'Avaliação de Fornecedores',
      description: '45+ requisitos de segurança padrão em 4 domínios: Segurança da Informação, Cyber, Privacidade e BCN.',
      badge: 'Novo',
    },
    {
      icon: Radar,
      title: 'Radar de Conformidade',
      description: 'Visualização gráfica da conformidade por domínio de segurança, identificando gaps rapidamente.',
      badge: null,
    },
    {
      icon: CheckSquare,
      title: 'Workflow de Aprovação',
      description: 'Fluxo de revisão e aprovação de avaliações concluídas com histórico de decisões.',
      badge: 'Novo',
    },
    {
      icon: Calendar,
      title: 'Agenda de Reavaliação',
      description: 'Programação automática de reavaliações por criticidade do fornecedor com alertas antecipados.',
      badge: null,
    },
    {
      icon: BarChart3,
      title: 'Heat Map de Riscos',
      description: 'Visualização consolidada dos níveis de risco de todos os fornecedores em uma única tela.',
      badge: null,
    },
    {
      icon: ListTodo,
      title: 'Planos de Ação VRM',
      description: 'Gestão de ações de mitigação específicas para cada fornecedor com prazos e responsáveis.',
      badge: null,
    },
  ];

  const advancedFeatures = [
    {
      icon: Settings,
      title: 'Frameworks Customizados',
      description: 'Crie seus próprios frameworks de conformidade e importe controles via CSV.',
      badge: 'Novo',
    },
    {
      icon: Search,
      title: 'Busca Global',
      description: 'Command Palette (Ctrl+K) para navegação rápida entre módulos, controles e fornecedores.',
      badge: null,
    },
  ];

  const renderFeatureCard = (feature: typeof grcFeatures[0], index: number) => (
    <Card 
      key={feature.title}
      className="group border border-primary/10 dark:border-primary/20 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-glow-sm hover:-translate-y-1 animate-fade-in bg-card/50 dark:bg-card/40 backdrop-blur-sm"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <feature.icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
          </div>
          {feature.badge && (
            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-glow-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              {feature.badge}
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 font-space">{feature.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
      </CardContent>
    </Card>
  );

  return (
    <section id="features" className="py-20 lg:py-32 relative">
      {/* Subtle nebula background */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-10 dark:opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.3), transparent 70%)',
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-space">
            Funcionalidades <span className="text-gradient-cosmic">Completas</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa para gerenciar a governança de segurança 
            e riscos de terceiros em uma única plataforma.
          </p>
        </div>

        <Tabs defaultValue="grc" className="animate-fade-in">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8 bg-muted/50 dark:bg-muted/30">
            <TabsTrigger value="grc" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              GRC Frameworks
            </TabsTrigger>
            <TabsTrigger value="vrm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              VRM
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Avançado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grc">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grcFeatures.map((feature, index) => renderFeatureCard(feature, index))}
            </div>
          </TabsContent>

          <TabsContent value="vrm">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vrmFeatures.map((feature, index) => renderFeatureCard(feature, index))}
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {advancedFeatures.map((feature, index) => renderFeatureCard(feature, index))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
