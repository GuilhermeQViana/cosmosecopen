import { useMemo } from 'react';
import { 
  Shield, 
  Building2, 
  Brain, 
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
    description: 'Avalie e monitore riscos de segurança de terceiros e fornecedores críticos.',
    features: [
      {
        icon: Users,
        title: 'Cadastro de Fornecedores',
        description: 'Registre fornecedores com dados de contrato, criticidade e contatos.',
        highlights: ['Criticidade (Crítico a Baixo)', 'Dados de contrato', 'Contatos'],
        extendedDescription: 'Cadastro completo com classificação por criticidade, dados contratuais, contatos principais e histórico de relacionamento com a organização.',
      },
      {
        icon: ClipboardCheck,
        title: 'Avaliação Estruturada',
        description: '45+ requisitos em 4 domínios: Segurança, Cyber, Privacidade e Continuidade.',
        highlights: ['4 domínios', 'Score ponderado', 'Customizável'],
        extendedDescription: 'Framework de avaliação completo baseado em melhores práticas de mercado, com requisitos customizáveis e ponderação por criticidade.',
      },
      {
        icon: AlertTriangle,
        title: 'Heat Map de Riscos',
        description: 'Visualize todos os fornecedores em uma matriz de risco colorida.',
        highlights: ['Visualização por cores', 'Filtro por criticidade', 'Export'],
        extendedDescription: 'Identifique rapidamente fornecedores de alto risco com visualização heat map, filtros avançados e exportação para relatórios gerenciais.',
      },
      {
        icon: ListTodo,
        title: 'Planos de Ação VRM',
        description: 'Crie planos de remediação específicos por fornecedor.',
        highlights: ['Por fornecedor', 'Vinculado a requisitos', 'Status'],
        extendedDescription: 'Gestão de planos de ação específicos para cada fornecedor, vinculados aos requisitos não conformes identificados na avaliação.',
      },
      {
        icon: FolderLock,
        title: 'Cofre de Evidências VRM',
        description: 'Armazene documentos recebidos do fornecedor com validade.',
        highlights: ['Por fornecedor', 'Categorização', 'Validade'],
        extendedDescription: 'Cofre digital dedicado para armazenar certificações, políticas, contratos e relatórios de auditoria de cada fornecedor.',
      },
      {
        icon: History,
        title: 'Agenda de Reavaliação',
        description: 'Sistema sugere próxima avaliação baseado na criticidade.',
        highlights: ['Sugestão automática', 'Alertas', 'Histórico'],
        extendedDescription: 'Fornecedores críticos são reavaliados trimestralmente. O sistema agenda automaticamente e envia alertas de vencimento.',
      },
    ],
  },
  {
    id: 'advanced',
    icon: Brain,
    title: 'Recursos Avançados',
    subtitle: 'Inteligência e Automação',
    description: 'Funcionalidades inteligentes que aceleram sua jornada de conformidade.',
    features: [
      {
        icon: Brain,
        title: 'IA Generativa para Planos',
        description: 'IA gera planos detalhados com título, descrição, tarefas e prioridade.',
        highlights: ['Geração automática', 'Tarefas detalhadas', 'Prioridade sugerida'],
        extendedDescription: 'Nossa IA analisa controles não conformes e gera automaticamente planos de ação completos, economizando horas de trabalho manual.',
      },
      {
        icon: FileText,
        title: 'Relatórios Executivos PDF',
        description: 'Exporte relatórios profissionais para diretoria e auditorias.',
        highlights: ['Layout executivo', 'Gráficos inclusos', 'GRC e VRM'],
        extendedDescription: 'Relatórios em PDF com layout profissional, gráficos de tendência, métricas consolidadas e branding personalizado da organização.',
      },
      {
        icon: History,
        title: 'Trilha de Auditoria',
        description: 'Registro automático de todas as ações para compliance.',
        highlights: ['Log de alterações', 'Filtros avançados', 'Export'],
        extendedDescription: 'Registro completo de quem alterou o quê, quando e qual era o valor anterior. Essencial para auditorias e investigações.',
      },
      {
        icon: CheckCircle2,
        title: 'Workflow de Aprovação',
        description: 'Avaliações passam por revisão antes de serem finalizadas.',
        highlights: ['Revisão obrigatória', 'Comentários', 'Histórico'],
        extendedDescription: 'Gestores podem aprovar, reprovar ou solicitar correções em avaliações de fornecedores antes da finalização.',
      },
      {
        icon: MessageSquare,
        title: 'Colaboração em Tempo Real',
        description: 'Comentários em controles, menções e threads de discussão.',
        highlights: ['Comentários aninhados', 'Reações', 'Notificações'],
        extendedDescription: 'Sistema de colaboração com threads, menções de usuários, reações e pins para alinhar equipes distribuídas.',
      },
      {
        icon: Shield,
        title: 'Frameworks Customizados',
        description: 'Crie frameworks personalizados ou importe via CSV.',
        highlights: ['Criação manual', 'Import CSV', 'Edição'],
        extendedDescription: 'Flexibilidade total para criar frameworks personalizados do zero ou importar controles de planilhas existentes.',
      },
    ],
  },
];

const navigationSections = [
  { id: 'grc', label: 'GRC Frameworks', icon: Shield },
  { id: 'vrm', label: 'VRM Fornecedores', icon: Building2 },
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
                Explore cada módulo e funcionalidade da plataforma que simplifica 
                sua jornada de conformidade e gestão de riscos.
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
