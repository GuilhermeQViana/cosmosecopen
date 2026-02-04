import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Building2, 
  Sparkles, 
  ArrowRight,
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  FolderLock,
  ListTodo,
  Users,
  FileText,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const tourData = {
  grc: {
    title: 'Módulo GRC Frameworks',
    description: 'Gerencie conformidade com NIST, ISO 27001 e BCB em uma única plataforma',
    features: [
      {
        icon: LayoutDashboard,
        title: 'Dashboard Executivo',
        description: 'Visão consolidada do score de segurança, métricas de conformidade e alertas prioritários em tempo real.',
      },
      {
        icon: ClipboardCheck,
        title: 'Diagnóstico de Controles',
        description: 'Avalie cada controle com níveis de maturidade (0-5), defina metas e acompanhe a evolução.',
      },
      {
        icon: AlertTriangle,
        title: 'Matriz de Riscos',
        description: 'Visualize riscos em matriz 5x5, calcule impacto vs probabilidade e priorize tratamentos.',
      },
      {
        icon: FolderLock,
        title: 'Cofre de Evidências',
        description: 'Armazene documentos, políticas e comprovantes organizados por controle com versionamento.',
      },
    ],
  },
  vrm: {
    title: 'Módulo VRM',
    description: 'Avalie e monitore riscos de terceiros e fornecedores críticos',
    features: [
      {
        icon: Users,
        title: 'Gestão de Fornecedores',
        description: 'Cadastre fornecedores, classifique por criticidade e monitore status de conformidade.',
      },
      {
        icon: ClipboardCheck,
        title: 'Avaliação Estruturada',
        description: '45+ requisitos em 4 domínios: Segurança, Cyber, Privacidade e Continuidade.',
      },
      {
        icon: AlertTriangle,
        title: 'Heat Map de Riscos',
        description: 'Visualize todos os fornecedores em uma matriz de risco para decisões rápidas.',
      },
      {
        icon: ListTodo,
        title: 'Planos de Ação VRM',
        description: 'Crie planos de remediação por fornecedor e acompanhe prazos de correção.',
      },
    ],
  },
  advanced: {
    title: 'Recursos Avançados',
    description: 'Funcionalidades inteligentes para acelerar sua jornada de conformidade',
    features: [
      {
        icon: Brain,
        title: 'IA Generativa',
        description: 'Gere planos de ação automaticamente com descrição, tarefas e prioridade sugerida.',
      },
      {
        icon: Shield,
        title: 'Mapeamento Multi-Framework',
        description: 'Visualize correspondências entre controles NIST, ISO e BCB em uma única tela.',
      },
      {
        icon: FileText,
        title: 'Relatórios Executivos',
        description: 'Exporte PDFs profissionais para apresentações a stakeholders e auditorias.',
      },
      {
        icon: ClipboardCheck,
        title: 'Trilha de Auditoria',
        description: 'Registro completo de todas as ações para compliance e investigações.',
      },
    ],
  },
};

export function ProductTourSection() {
  const [activeTab, setActiveTab] = useState('grc');

  return (
    <section id="tour" className="py-24 relative overflow-hidden">
      {/* Background gradients */}
      <div 
        className="absolute top-1/4 right-0 w-[600px] h-[600px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.3), transparent 60%)',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30 dark:border-primary/50 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            Tour do Produto
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-space">
            Veja a plataforma <span className="text-gradient-cosmic">em ação</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conheça as principais funcionalidades que vão transformar sua gestão de conformidade.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="grc" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">GRC Frameworks</span>
              <span className="sm:hidden">GRC</span>
            </TabsTrigger>
            <TabsTrigger value="vrm" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Fornecedores</span>
              <span className="sm:hidden">VRM</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Avançado</span>
              <span className="sm:hidden">IA</span>
            </TabsTrigger>
          </TabsList>

          {Object.entries(tourData).map(([key, data]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">{data.title}</h3>
                <p className="text-muted-foreground">{data.description}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {data.features.map((feature, index) => (
                  <Card 
                    key={index} 
                    className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                          <feature.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-12">
          <Button variant="cosmic" size="lg" asChild className="group">
            <Link to="/tour">
              Ver Tour Completo
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
