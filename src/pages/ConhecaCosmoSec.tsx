import { useMemo } from 'react';
import { 
  Shield, 
  Building2, 
  Brain, 
  FileText,
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  FolderLock,
  ListTodo,
  Users,
  Map,
  History,
  CheckCircle2,
  MessageSquare,
  PenTool,
  GitBranch,
  Mail,
  BookTemplate,
  Clock,
  Search,
  Handshake,
  Timer,
  Globe,
  FileSignature,
  Workflow,
  Kanban,
  UserMinus,
  BarChart3,
  Lightbulb,
  ShieldAlert,
  FileBarChart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { StarField } from '@/components/ui/star-field';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { TourProgressBar } from '@/components/conheca/TourProgressBar';
import { TourNavigation } from '@/components/conheca/TourNavigation';
import { QuickNavigationCards } from '@/components/conheca/QuickNavigationCards';
import { ExpandableFeatureCard } from '@/components/conheca/ExpandableFeatureCard';
import { ModuleComparisonSection } from '@/components/conheca/ModuleComparisonSection';
import { EnhancedCTASection } from '@/components/conheca/EnhancedCTASection';
import { DashboardScreenshotGallery } from '@/components/conheca/DashboardScreenshotGallery';

const modules = [
  {
    id: 'grc',
    icon: Shield,
    title: 'Módulo GRC Frameworks',
    subtitle: 'Governança, Risco e Conformidade',
    description: 'Gerencie sua conformidade com frameworks de segurança em uma plataforma integrada.',
    features: [
      {
        icon: LayoutDashboard,
        title: 'Dashboard Executivo',
        description: 'Visão consolidada com score de segurança, gráficos de tendência e alertas de riscos críticos.',
        highlights: ['Score em tempo real', 'Gráficos interativos', 'Alertas automáticos'],
        extendedDescription: 'O dashboard executivo oferece uma visão 360° da sua postura de segurança, com widgets personalizáveis, drill-down em métricas e exportação para relatórios gerenciais.',
      },
      {
        icon: ClipboardCheck,
        title: 'Diagnóstico de Controles',
        description: 'Avalie cada controle com níveis de maturidade de 0 a 5. Defina metas e acompanhe evolução.',
        highlights: ['Maturidade 0-5', 'Histórico de versões', 'Comentários e threads'],
        extendedDescription: 'Sistema completo de avaliação com wizard guiado, bulk edit para produtividade, e timeline de evolução para acompanhar o progresso ao longo do tempo.',
      },
      {
        icon: AlertTriangle,
        title: 'Matriz de Riscos',
        description: 'Visualize riscos em matriz 5x5 interativa com impacto vs probabilidade.',
        highlights: ['Matriz 5x5', 'Histórico de mudanças', 'Vinculação com controles'],
        extendedDescription: 'Matriz baseada em metodologia ISO 31000 com cálculo automático de risco residual, vinculação com controles mitigadores e histórico completo de alterações.',
      },
      {
        icon: FolderLock,
        title: 'Cofre de Evidências',
        description: 'Armazene documentos e políticas organizados em pastas com classificação de sigilo.',
        highlights: ['Organização em pastas', 'Classificação de sigilo', 'Preview de arquivos'],
        extendedDescription: 'Cofre digital com versionamento automático, preview de documentos, vinculação a controles específicos e alertas de validade para certificações.',
      },
      {
        icon: ListTodo,
        title: 'Planos de Ação',
        description: 'Crie e acompanhe planos de remediação com Kanban, calendário e timeline.',
        highlights: ['Kanban e Calendário', 'Atribuição de tarefas', 'Notificações de prazo'],
        extendedDescription: 'Gestão completa com visualizações Kanban, calendário e lista. Atribua responsáveis, defina prazos e receba notificações automáticas de vencimento.',
      },
      {
        icon: Map,
        title: 'Mapeamento entre Frameworks',
        description: 'Visualize correspondências entre controles de diferentes frameworks.',
        highlights: ['NIST ↔ ISO ↔ BCB', 'Matriz de correspondência', 'Gaps identificados'],
        extendedDescription: 'Entenda como os controles se relacionam entre frameworks, identifique gaps e otimize sua jornada de conformidade múltipla.',
      },
    ],
  },
  {
    id: 'vrm',
    icon: Building2,
    title: 'Módulo VRM',
    subtitle: 'Vendor Risk Management',
    description: 'Avalie e monitore riscos de segurança de terceiros com workflows completos de due diligence, SLA tracking e portal de fornecedores.',
    features: [
      {
        icon: Users,
        title: 'Cadastro de Fornecedores',
        description: 'Registre fornecedores com dados de contrato, criticidade, contatos e pipeline visual.',
        highlights: ['Criticidade (Crítico a Baixo)', 'Pipeline Kanban/Funnel', 'Importação em lote'],
        extendedDescription: 'Cadastro completo com classificação por criticidade, dados contratuais, pipeline visual em Kanban e Funnel, importação em massa e histórico de relacionamento.',
      },
      {
        icon: ClipboardCheck,
        title: 'Avaliação Estruturada',
        description: '45+ requisitos em 4 domínios: Segurança, Cyber, Privacidade e Continuidade.',
        highlights: ['4 domínios', 'Score ponderado', 'Workflow de aprovação'],
        extendedDescription: 'Framework de avaliação completo com requisitos customizáveis, ponderação por criticidade e workflow de aprovação multi-nível para finalização.',
      },
      {
        icon: Search,
        title: 'Due Diligence Completa',
        description: 'Processo estruturado de due diligence com assistência de IA para análise de riscos.',
        highlights: ['Assistência por IA', 'Checklist estruturado', 'Relatório automático'],
        extendedDescription: 'Conduza processos de due diligence completos com apoio de IA generativa, checklists pré-configurados e geração automática de relatórios de conclusão.',
      },
      {
        icon: Timer,
        title: 'SLA Tracking',
        description: 'Monitore acordos de nível de serviço com métricas de conformidade em tempo real.',
        highlights: ['Métricas em tempo real', 'Alertas de violação', 'Histórico de SLA'],
        extendedDescription: 'Acompanhe o cumprimento de SLAs por fornecedor, receba alertas automáticos de violações e visualize tendências de conformidade ao longo do tempo.',
      },
      {
        icon: Globe,
        title: 'Portal de Fornecedores',
        description: 'Portal dedicado onde fornecedores respondem avaliações e enviam evidências.',
        highlights: ['Acesso externo seguro', 'Upload de evidências', 'Autoavaliação'],
        extendedDescription: 'Fornecedores acessam um portal dedicado para responder questionários, enviar documentos e certificações, reduzindo o trabalho manual da equipe interna.',
      },
      {
        icon: FileSignature,
        title: 'Gestão de Contratos',
        description: 'Centralize contratos de fornecedores com alertas de vencimento e renovação.',
        highlights: ['Centralização', 'Alertas de vencimento', 'Vinculação ao fornecedor'],
        extendedDescription: 'Gerencie contratos ativos, acompanhe datas de renovação, vincule a avaliações de risco e mantenha histórico completo de acordos.',
      },
      {
        icon: AlertTriangle,
        title: 'Heat Map de Riscos',
        description: 'Visualize todos os fornecedores em uma matriz de risco colorida com filtros avançados.',
        highlights: ['Visualização por cores', 'Filtro por criticidade', 'Comparação entre fornecedores'],
        extendedDescription: 'Identifique rapidamente fornecedores de alto risco com visualização heat map, compare fornecedores lado a lado e exporte para relatórios gerenciais.',
      },
      {
        icon: ListTodo,
        title: 'Planos de Ação VRM',
        description: 'Crie planos de remediação específicos por fornecedor vinculados a requisitos.',
        highlights: ['Por fornecedor', 'Vinculado a requisitos', 'Geração por IA'],
        extendedDescription: 'Gestão de planos de ação específicos para cada fornecedor, vinculados aos requisitos não conformes, com possibilidade de geração automática por IA.',
      },
      {
        icon: FolderLock,
        title: 'Cofre de Evidências VRM',
        description: 'Armazene documentos recebidos do fornecedor com validade e categorização.',
        highlights: ['Por fornecedor', 'Categorização', 'Alertas de validade'],
        extendedDescription: 'Cofre digital dedicado para armazenar certificações, políticas, contratos e relatórios de auditoria de cada fornecedor com alertas de expiração.',
      },
      {
        icon: History,
        title: 'Agenda de Reavaliação',
        description: 'Sistema sugere próxima avaliação baseado na criticidade do fornecedor.',
        highlights: ['Sugestão automática', 'Alertas', 'Ciclo contínuo'],
        extendedDescription: 'Fornecedores críticos são reavaliados trimestralmente. O sistema agenda automaticamente e envia alertas de vencimento para manter o ciclo de gestão.',
      },
      {
        icon: ShieldAlert,
        title: 'Registro de Incidentes',
        description: 'Registre e acompanhe incidentes de segurança envolvendo fornecedores.',
        highlights: ['Análise por IA', 'Timeline de incidentes', 'Impacto no score'],
        extendedDescription: 'Registre incidentes com análise automatizada por IA, acompanhe a timeline de resolução e veja o impacto direto no score de risco do fornecedor.',
      },
      {
        icon: UserMinus,
        title: 'Offboarding de Fornecedores',
        description: 'Wizard guiado para desligamento seguro de fornecedores com checklist.',
        highlights: ['Wizard passo a passo', 'Checklist de segurança', 'Registro de auditoria'],
        extendedDescription: 'Processo estruturado para desligar fornecedores com segurança, garantindo revogação de acessos, devolução de dados e registro completo para auditoria.',
      },
    ],
  },
  {
    id: 'policies',
    icon: FileText,
    title: 'Gestão de Políticas',
    subtitle: 'Políticas, Aprovações e Aceite',
    description: 'Crie, aprove e distribua políticas de segurança com editor inteligente, fluxos de aprovação e campanhas de aceite.',
    features: [
      {
        icon: PenTool,
        title: 'Editor Rich-Text com IA',
        description: 'Editor completo com geração de conteúdo por IA, tabelas, imagens e formatação avançada.',
        highlights: ['Geração por IA', 'Tabelas e imagens', 'Formatação avançada'],
        extendedDescription: 'Editor TipTap completo com assistente de IA que gera políticas a partir de prompts. Suporte a tabelas, imagens, links e formatação profissional.',
      },
      {
        icon: LayoutDashboard,
        title: 'Dashboard de Políticas',
        description: 'Painel com métricas de status, categorias e políticas próximas do vencimento.',
        highlights: ['Métricas consolidadas', 'Filtros por status', 'Alertas de revisão'],
        extendedDescription: 'Visão centralizada de todas as políticas com métricas de publicação, rascunhos pendentes, políticas expiradas e próximas da data de revisão.',
      },
      {
        icon: Workflow,
        title: 'Fluxos de Aprovação',
        description: 'Workflows multi-nível com aprovadores definidos por papel ou usuário.',
        highlights: ['Multi-nível', 'Comentários do aprovador', 'Histórico de decisões'],
        extendedDescription: 'Configure workflows de aprovação com até 2 níveis, defina aprovadores por cargo ou usuário específico, e acompanhe o histórico completo de decisões.',
      },
      {
        icon: Mail,
        title: 'Campanhas de Aceite',
        description: 'Distribua políticas para colaboradores e rastreie a aderência em tempo real.',
        highlights: ['Rastreamento de aceite', 'Prazo configurável', 'Relatório de aderência'],
        extendedDescription: 'Crie campanhas de aceite com público-alvo, prazo e acompanhamento em tempo real. Visualize quem leu e aceitou cada política com data, hora e IP.',
      },
      {
        icon: BookTemplate,
        title: 'Templates de Políticas',
        description: 'Biblioteca de templates pré-configurados para acelerar a criação de políticas.',
        highlights: ['Templates por framework', 'Customizáveis', 'Reutilizáveis'],
        extendedDescription: 'Utilize templates prontos para políticas comuns (Segurança da Informação, Privacidade, Continuidade) ou crie seus próprios templates reutilizáveis.',
      },
      {
        icon: GitBranch,
        title: 'Versionamento e Histórico',
        description: 'Controle de versões automático com comparação e histórico de alterações.',
        highlights: ['Versões automáticas', 'Exportação PDF', 'Vinculação a controles'],
        extendedDescription: 'Cada alteração gera uma nova versão com registro do autor e resumo das mudanças. Exporte para PDF profissional e vincule políticas a controles e riscos.',
      },
    ],
  },
  {
    id: 'advanced',
    icon: Brain,
    title: 'Recursos Avançados',
    subtitle: 'Inteligência, Relatórios e Automação',
    description: 'Funcionalidades inteligentes que aceleram sua jornada de conformidade com IA generativa, relatórios executivos e trilha de auditoria.',
    features: [
      {
        icon: Brain,
        title: 'IA Generativa para Planos',
        description: 'IA gera planos detalhados com título, descrição, tarefas e prioridade.',
        highlights: ['Geração automática', 'Tarefas detalhadas', 'Prioridade sugerida'],
        extendedDescription: 'Nossa IA analisa controles não conformes e gera automaticamente planos de ação completos, economizando horas de trabalho manual.',
      },
      {
        icon: Lightbulb,
        title: 'Assistente de Implementação',
        description: 'Guia inteligente que sugere como implementar cada controle do framework.',
        highlights: ['Guia passo a passo', 'Exemplos práticos', 'Adaptado ao contexto'],
        extendedDescription: 'O assistente de IA analisa o controle selecionado e gera um guia de implementação personalizado com etapas práticas, exemplos de evidências e melhores práticas.',
      },
      {
        icon: FileBarChart,
        title: '6 Tipos de Relatórios',
        description: 'Relatórios executivos em PDF: Conformidade, Riscos, Evidências, Gap Analysis, Executivo e Planos de Ação.',
        highlights: ['6 tipos especializados', 'Export PDF/HTML', 'Branding personalizado'],
        extendedDescription: 'Gere relatórios profissionais para diretoria e auditorias com gráficos, métricas consolidadas e branding da organização. Inclui Gap Analysis e relatório executivo.',
      },
      {
        icon: History,
        title: 'Trilha de Auditoria',
        description: 'Registro automático de todas as ações para compliance com filtros avançados.',
        highlights: ['Log de alterações', 'Filtros por usuário/ação', 'Timeline visual'],
        extendedDescription: 'Registro completo de quem alterou o quê, quando e qual era o valor anterior. Gráficos de atividade e timeline visual para investigações e auditorias.',
      },
      {
        icon: CheckCircle2,
        title: 'Workflow de Aprovação',
        description: 'Avaliações de fornecedores passam por revisão antes de serem finalizadas.',
        highlights: ['Revisão obrigatória', 'Comentários', 'Histórico'],
        extendedDescription: 'Gestores podem aprovar, reprovar ou solicitar correções em avaliações de fornecedores antes da finalização, garantindo qualidade e governança.',
      },
      {
        icon: MessageSquare,
        title: 'Colaboração em Tempo Real',
        description: 'Comentários em controles, menções, reações e threads de discussão.',
        highlights: ['Comentários aninhados', 'Reações', 'Pins e notificações'],
        extendedDescription: 'Sistema de colaboração com threads, menções de usuários, reações emoji, pins para itens importantes e notificações para alinhar equipes distribuídas.',
      },
      {
        icon: Shield,
        title: 'Frameworks Customizados',
        description: 'Crie frameworks personalizados do zero ou importe controles via CSV.',
        highlights: ['Criação manual', 'Import CSV', 'Edição completa'],
        extendedDescription: 'Flexibilidade total para criar frameworks personalizados, importar controles de planilhas existentes e gerenciar estruturas de conformidade sob medida.',
      },
      {
        icon: ShieldAlert,
        title: 'Análise de Incidentes por IA',
        description: 'IA analisa incidentes de fornecedores e sugere ações de mitigação.',
        highlights: ['Análise automática', 'Sugestões de ação', 'Impacto calculado'],
        extendedDescription: 'A IA analisa o contexto do incidente, classifica severidade, calcula impacto potencial e sugere ações de mitigação baseadas em melhores práticas.',
      },
    ],
  },
];

const navigationSections = [
  { id: 'grc', label: 'GRC Frameworks', icon: Shield },
  { id: 'vrm', label: 'VRM Fornecedores', icon: Building2 },
  { id: 'policies', label: 'Gestão de Políticas', icon: FileText },
  { id: 'advanced', label: 'Recursos Avançados', icon: Brain },
  { id: 'contact', label: 'Falar Conosco', icon: MessageSquare },
];

export default function ConhecaCosmoSec() {
  const sections = useMemo(() => navigationSections.map(s => ({ id: s.id, label: s.label })), []);
  const { progress, activeSection, scrollToSection } = useScrollProgress(sections);

  return (
    <div className="min-h-screen bg-background relative">
      <StarField starCount={60} dustCount={20} />
      <Navbar />
      <TourProgressBar progress={progress} />
      <TourNavigation 
        sections={navigationSections} 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
      />
      
      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary animate-fade-in">
                Conheça a CosmoSec
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-space animate-fade-in" style={{ animationDelay: '100ms' }}>
                Descubra como a <span className="text-gradient-cosmic">CosmoSec</span> transforma sua governança
              </h1>
              <p className="text-lg text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
                Explore cada módulo da plataforma que simplifica sua jornada de conformidade, 
                gestão de riscos, políticas de segurança e avaliação de fornecedores.
              </p>
              
              <QuickNavigationCards onNavigate={scrollToSection} />
            </div>
          </div>
        </section>

        {/* Module Sections */}
        {modules.map((module, moduleIndex) => (
          <section 
            key={module.id} 
            id={module.id}
            className={`py-16 md:py-24 ${moduleIndex % 2 === 1 ? 'bg-muted/30 dark:bg-muted/10' : ''}`}
          >
            <div className="container mx-auto px-4 lg:pl-56">
              {/* Module Header */}
              <div className="flex items-center gap-4 mb-12">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
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

              {/* Features Grid with Expandable Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {module.features.map((feature, index) => (
                  <ExpandableFeatureCard
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    highlights={feature.highlights}
                    extendedDescription={feature.extendedDescription}
                    index={index}
                  />
                ))}
              </div>
              
              {/* Dashboard Gallery for GRC module */}
              {module.id === 'grc' && <DashboardScreenshotGallery />}
            </div>
          </section>
        ))}

        {/* Module Comparison Section */}
        <ModuleComparisonSection onNavigate={scrollToSection} />

        {/* Enhanced CTA Section */}
        <EnhancedCTASection />
      </main>

      <Footer />
    </div>
  );
}
