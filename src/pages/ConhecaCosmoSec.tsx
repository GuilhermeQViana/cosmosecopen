import { Link } from 'react-router-dom';
import { 
  Shield, 
  Building2, 
  Brain, 
  ArrowRight,
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  FolderLock,
  ListTodo,
  Users,
  FileText,
  Map,
  History,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { StarField } from '@/components/ui/star-field';

const modules = [
  {
    id: 'grc',
    icon: Shield,
    title: 'Módulo GRC Frameworks',
    subtitle: 'Governança, Risco e Conformidade',
    description: 'Gerencie sua conformidade com frameworks de segurança em uma plataforma integrada.',
    color: 'primary',
    features: [
      {
        icon: LayoutDashboard,
        title: 'Dashboard Executivo',
        description: 'Visão consolidada com score de segurança, gráficos de tendência, métricas de conformidade por framework e alertas de riscos críticos.',
        highlights: ['Score em tempo real', 'Gráficos interativos', 'Alertas automáticos'],
      },
      {
        icon: ClipboardCheck,
        title: 'Diagnóstico de Controles',
        description: 'Avalie cada controle com níveis de maturidade de 0 a 5. Defina metas, registre observações e acompanhe a evolução histórica.',
        highlights: ['Maturidade 0-5', 'Histórico de versões', 'Comentários e threads'],
      },
      {
        icon: AlertTriangle,
        title: 'Matriz de Riscos',
        description: 'Visualize riscos em matriz 5x5 interativa. Calcule impacto vs probabilidade, defina tratamentos e vincule controles mitigadores.',
        highlights: ['Matriz 5x5', 'Histórico de mudanças', 'Vinculação com controles'],
      },
      {
        icon: FolderLock,
        title: 'Cofre de Evidências',
        description: 'Armazene documentos, políticas e comprovantes organizados em pastas. Classifique por confidencialidade e vincule a controles.',
        highlights: ['Organização em pastas', 'Classificação de sigilo', 'Preview de arquivos'],
      },
      {
        icon: ListTodo,
        title: 'Planos de Ação',
        description: 'Crie e acompanhe planos de remediação com Kanban, calendário e timeline. Atribua responsáveis e defina prazos.',
        highlights: ['Kanban e Calendário', 'Atribuição de tarefas', 'Notificações de prazo'],
      },
      {
        icon: Map,
        title: 'Mapeamento entre Frameworks',
        description: 'Visualize correspondências entre controles de diferentes frameworks. Entenda como NIST, ISO e BCB se relacionam.',
        highlights: ['NIST ↔ ISO ↔ BCB', 'Matriz de correspondência', 'Gaps identificados'],
      },
    ],
  },
  {
    id: 'vrm',
    icon: Building2,
    title: 'Módulo VRM',
    subtitle: 'Vendor Risk Management',
    description: 'Avalie e monitore riscos de segurança de terceiros e fornecedores críticos.',
    color: 'secondary',
    features: [
      {
        icon: Users,
        title: 'Cadastro de Fornecedores',
        description: 'Registre fornecedores com dados de contrato, criticidade, categoria e contatos. Organize e filtre por status e risco.',
        highlights: ['Criticidade (Crítico a Baixo)', 'Dados de contrato', 'Contatos do fornecedor'],
      },
      {
        icon: ClipboardCheck,
        title: 'Avaliação Estruturada',
        description: '45+ requisitos pré-definidos em 4 domínios: Segurança da Informação, Cyber Security, Privacidade (LGPD) e Continuidade.',
        highlights: ['4 domínios de avaliação', 'Score ponderado', 'Requisitos customizáveis'],
      },
      {
        icon: AlertTriangle,
        title: 'Heat Map de Riscos',
        description: 'Visualize todos os fornecedores em uma matriz de risco colorida. Identifique rapidamente os mais críticos.',
        highlights: ['Visualização por cores', 'Filtro por criticidade', 'Export para relatório'],
      },
      {
        icon: ListTodo,
        title: 'Planos de Ação VRM',
        description: 'Crie planos de remediação específicos por fornecedor. Acompanhe correções e prazos de regularização.',
        highlights: ['Por fornecedor', 'Vinculado a requisitos', 'Acompanhamento de status'],
      },
      {
        icon: FolderLock,
        title: 'Cofre de Evidências VRM',
        description: 'Armazene documentos recebidos do fornecedor: certificações, políticas, relatórios de auditoria e contratos.',
        highlights: ['Por fornecedor', 'Categorização', 'Validade de documentos'],
      },
      {
        icon: History,
        title: 'Agenda de Reavaliação',
        description: 'Sistema sugere próxima avaliação baseado na criticidade. Fornecedores críticos são reavaliados trimestralmente.',
        highlights: ['Sugestão automática', 'Alertas de vencimento', 'Histórico de avaliações'],
      },
    ],
  },
  {
    id: 'advanced',
    icon: Brain,
    title: 'Recursos Avançados',
    subtitle: 'Inteligência e Automação',
    description: 'Funcionalidades inteligentes que aceleram sua jornada de conformidade.',
    color: 'primary',
    features: [
      {
        icon: Brain,
        title: 'IA Generativa para Planos de Ação',
        description: 'Nossa IA analisa controles não conformes e gera automaticamente planos detalhados com título, descrição, tarefas e prioridade.',
        highlights: ['Geração automática', 'Tarefas detalhadas', 'Prioridade sugerida'],
      },
      {
        icon: FileText,
        title: 'Relatórios Executivos PDF',
        description: 'Exporte relatórios profissionais para apresentações a diretoria, auditorias e stakeholders.',
        highlights: ['Layout executivo', 'Gráficos inclusos', 'GRC e VRM'],
      },
      {
        icon: History,
        title: 'Trilha de Auditoria Completa',
        description: 'Registro automático de todas as ações: quem alterou, o quê, quando e qual valor anterior.',
        highlights: ['Log de alterações', 'Filtros avançados', 'Export para auditoria'],
      },
      {
        icon: CheckCircle2,
        title: 'Workflow de Aprovação VRM',
        description: 'Avaliações passam por revisão antes de serem finalizadas. Gestor pode aprovar, reprovar ou solicitar correções.',
        highlights: ['Revisão obrigatória', 'Comentários do revisor', 'Histórico de aprovações'],
      },
      {
        icon: MessageSquare,
        title: 'Colaboração em Tempo Real',
        description: 'Comentários em controles, menções de usuários e threads de discussão para alinhar equipes.',
        highlights: ['Comentários aninhados', 'Reações e pins', 'Notificações'],
      },
      {
        icon: Shield,
        title: 'Frameworks Customizados',
        description: 'Crie frameworks personalizados do zero ou importe controles via CSV para atender requisitos específicos.',
        highlights: ['Criação manual', 'Import CSV', 'Edição de controles'],
      },
    ],
  },
];

export default function TourProduto() {
  return (
    <div className="min-h-screen bg-background relative">
      <StarField starCount={60} dustCount={20} />
      <Navbar />
      
      <main className="relative z-10 pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                Tour Completo
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-space">
                Conheça a <span className="text-gradient-cosmic">CosmoSec</span> por dentro
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Explore cada funcionalidade e descubra como podemos transformar 
                sua gestão de conformidade e riscos de terceiros.
              </p>
              <Button variant="cosmic" size="lg" asChild>
                <a href="#contact">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Solicitar Demonstração
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Modules */}
        {modules.map((module, moduleIndex) => (
          <section 
            key={module.id} 
            id={module.id}
            className={`py-16 md:py-24 ${moduleIndex % 2 === 1 ? 'bg-muted/30 dark:bg-muted/10' : ''}`}
          >
            <div className="container mx-auto px-4">
              {/* Module Header */}
              <div className="flex items-center gap-4 mb-12">
                <div className={`w-14 h-14 bg-gradient-to-br from-${module.color} to-${module.color}/70 rounded-xl flex items-center justify-center shadow-lg`}>
                  <module.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground font-space">
                    {module.title}
                  </h2>
                  <p className="text-muted-foreground">{module.subtitle}</p>
                </div>
              </div>

              <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
                {module.description}
              </p>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {module.features.map((feature, index) => (
                  <Card 
                    key={index}
                    className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                          <feature.icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {feature.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {feature.highlights.map((highlight, hIndex) => (
                          <Badge 
                            key={hIndex} 
                            variant="secondary" 
                            className="text-xs bg-primary/10 text-primary border-0"
                          >
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section id="contact" className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-space">
              Quer ver ao vivo?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Agende uma demonstração personalizada e veja como a CosmoSec 
              pode atender às necessidades específicas da sua organização.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cosmic" size="lg" asChild className="group">
                <Link to="/#contact">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Falar com Especialista
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/">Voltar para Home</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
