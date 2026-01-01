import { 
  ClipboardCheck, 
  AlertTriangle, 
  FolderLock, 
  ListTodo, 
  BarChart3, 
  History,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function FeaturesSection() {
  const features = [
    {
      icon: ClipboardCheck,
      title: 'Diagnóstico de Controles',
      description: 'Avalie a maturidade dos seus controles de 0 a 5, com status de conformidade e observações detalhadas.',
      badge: null,
    },
    {
      icon: AlertTriangle,
      title: 'Gestão de Riscos',
      description: 'Matriz de riscos 5x5, análise de probabilidade e impacto, planos de tratamento e vinculação com controles.',
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
      description: 'Visualização Kanban e Calendário, atribuição de responsáveis, prazos e acompanhamento de progresso.',
      badge: 'IA',
    },
    {
      icon: BarChart3,
      title: 'Relatórios Executivos',
      description: 'Dashboards interativos, gráficos de maturidade, tendências e exportação em múltiplos formatos.',
      badge: null,
    },
    {
      icon: History,
      title: 'Trilha de Auditoria',
      description: 'Registro completo de todas as ações, alterações e acessos para compliance e investigações.',
      badge: null,
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Funcionalidades Completas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa para gerenciar a governança de segurança 
            da sua organização em uma única plataforma.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  {feature.badge && (
                    <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}