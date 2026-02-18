import { useState } from 'react';
import {
  Shield, Building2, Sparkles, CheckCircle2, ChevronDown, FileText, ClipboardCheck,
  LayoutDashboard, AlertTriangle, FolderLock, ListTodo, Map,
  Users, Search, Timer, Globe, FileSignature,
  PenTool, Workflow, Mail, BookTemplate, GitBranch,
  Brain, Lightbulb, FileBarChart, MessageSquare, ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SubFeature {
  icon: typeof Shield;
  title: string;
  description: string;
  highlights: string[];
}

interface ModuleColor {
  border: string;
  borderHover: string;
  bg: string;
  text: string;
  icon: string;
  glow: string;
  badge: string;
}

interface Platform {
  id: string;
  icon: typeof Shield;
  title: string;
  description: string;
  features: string[];
  color: ModuleColor;
  subFeatures: SubFeature[];
}

const moduleColors: Record<string, ModuleColor> = {
  grc: {
    border: 'border-blue-500/20',
    borderHover: 'hover:border-blue-500/50',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    icon: 'from-blue-600 to-blue-400',
    glow: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  vrm: {
    border: 'border-cyan-500/20',
    borderHover: 'hover:border-cyan-500/50',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    icon: 'from-cyan-600 to-cyan-400',
    glow: 'hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  politicas: {
    border: 'border-violet-500/20',
    borderHover: 'hover:border-violet-500/50',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    icon: 'from-violet-600 to-violet-400',
    glow: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  ia: {
    border: 'border-amber-500/20',
    borderHover: 'hover:border-amber-500/50',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    icon: 'from-amber-500 to-orange-400',
    glow: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
};

const platforms: Platform[] = [
  {
    id: 'grc',
    icon: Shield,
    title: 'GRC Frameworks',
    description: 'Diagnóstico completo de controles de segurança com frameworks reconhecidos e customizáveis.',
    features: [
      'NIST CSF 2.0, ISO 27001, BCB/CMN',
      'Frameworks customizados e importação CSV',
      'Risk Score automático e matriz de riscos',
      'Gestão de evidências e mapeamento cruzado',
    ],
    color: moduleColors.grc,
    subFeatures: [
      { icon: LayoutDashboard, title: 'Dashboard Executivo', description: 'Score de segurança, gráficos de tendência e alertas de riscos críticos.', highlights: ['Score em tempo real', 'Gráficos interativos'] },
      { icon: ClipboardCheck, title: 'Diagnóstico de Controles', description: 'Avalie controles com maturidade 0-5, metas e evolução temporal.', highlights: ['Maturidade 0-5', 'Bulk edit'] },
      { icon: AlertTriangle, title: 'Matriz de Riscos', description: 'Matriz 5x5 interativa com impacto vs probabilidade e risco residual.', highlights: ['ISO 31000', 'Risco residual'] },
      { icon: FolderLock, title: 'Cofre de Evidências', description: 'Documentos organizados em pastas com classificação de sigilo.', highlights: ['Preview de arquivos', 'Validade'] },
      { icon: ListTodo, title: 'Planos de Ação', description: 'Kanban, calendário e timeline com notificações de prazo.', highlights: ['Kanban', 'Notificações'] },
      { icon: Map, title: 'Mapeamento Cruzado', description: 'Correspondências entre controles de diferentes frameworks.', highlights: ['NIST ↔ ISO', 'Gap analysis'] },
    ],
  },
  {
    id: 'vrm',
    icon: Building2,
    title: 'VRM Fornecedores',
    description: 'Ciclo completo de gestão de riscos de terceiros, do onboarding ao offboarding.',
    features: [
      'Due Diligence e 45+ requisitos de avaliação',
      'SLA Tracking e gestão de contratos',
      'Portal de fornecedores e pipeline visual',
      'Incidentes, offboarding e agenda de reavaliação',
    ],
    color: moduleColors.vrm,
    subFeatures: [
      { icon: Users, title: 'Cadastro & Pipeline', description: 'Registre fornecedores com criticidade e pipeline visual Kanban/Funnel.', highlights: ['Pipeline visual', 'Import em lote'] },
      { icon: ClipboardCheck, title: 'Avaliação Estruturada', description: '45+ requisitos em 4 domínios com score ponderado.', highlights: ['4 domínios', 'Score ponderado'] },
      { icon: Search, title: 'Due Diligence', description: 'Processo estruturado com assistência de IA para análise de riscos.', highlights: ['Assistência IA', 'Relatório auto'] },
      { icon: Timer, title: 'SLA Tracking', description: 'Monitore SLAs com métricas de conformidade em tempo real.', highlights: ['Alertas de violação', 'Histórico'] },
      { icon: Globe, title: 'Portal de Fornecedores', description: 'Fornecedores respondem avaliações e enviam evidências.', highlights: ['Acesso externo', 'Autoavaliação'] },
      { icon: FileSignature, title: 'Contratos & Offboarding', description: 'Gestão de contratos com wizard de desligamento seguro.', highlights: ['Alertas de vencimento', 'Checklist'] },
    ],
  },
  {
    id: 'politicas',
    icon: FileText,
    title: 'Gestão de Políticas',
    description: 'Ciclo de vida completo de políticas com editor rico, aprovações e campanhas de aceite.',
    features: [
      'Editor rich-text com geração por IA',
      'Fluxos de aprovação multi-nível',
      'Campanhas de aceite com rastreamento',
      'Templates, versionamento e export PDF',
    ],
    color: moduleColors.politicas,
    subFeatures: [
      { icon: PenTool, title: 'Editor Rich-Text + IA', description: 'Editor completo com geração de conteúdo por IA, tabelas e imagens.', highlights: ['Geração por IA', 'Formatação avançada'] },
      { icon: Workflow, title: 'Fluxos de Aprovação', description: 'Workflows multi-nível com aprovadores por papel ou usuário.', highlights: ['Multi-nível', 'Histórico'] },
      { icon: Mail, title: 'Campanhas de Aceite', description: 'Distribua políticas e rastreie aderência em tempo real.', highlights: ['Rastreamento', 'Relatório'] },
      { icon: BookTemplate, title: 'Templates', description: 'Biblioteca de templates pré-configurados por framework.', highlights: ['Por framework', 'Customizáveis'] },
      { icon: GitBranch, title: 'Versionamento', description: 'Controle de versões automático com exportação PDF.', highlights: ['Versões auto', 'Export PDF'] },
      { icon: LayoutDashboard, title: 'Dashboard', description: 'Métricas de status, categorias e alertas de revisão.', highlights: ['Métricas', 'Alertas'] },
    ],
  },
  {
    id: 'ia',
    icon: Sparkles,
    title: 'IA Generativa',
    description: 'Automação inteligente em todos os módulos para acelerar a conformidade.',
    features: [
      'Planos de ação e políticas gerados por IA',
      'Assistente de implementação de controles',
      'Análise de incidentes e criticidade automática',
      '6 tipos de relatórios automatizados',
    ],
    color: moduleColors.ia,
    subFeatures: [
      { icon: Brain, title: 'Planos de Ação por IA', description: 'IA gera planos detalhados com tarefas e prioridade automática.', highlights: ['Geração automática', 'Tarefas detalhadas'] },
      { icon: Lightbulb, title: 'Assistente de Implementação', description: 'Guia inteligente com passos práticos para cada controle.', highlights: ['Passo a passo', 'Contextual'] },
      { icon: FileBarChart, title: '6 Tipos de Relatórios', description: 'Conformidade, Riscos, Gap Analysis, Executivo e mais.', highlights: ['Export PDF', 'Branding'] },
      { icon: ShieldAlert, title: 'Análise de Incidentes', description: 'IA analisa incidentes e sugere ações de mitigação.', highlights: ['Severidade auto', 'Sugestões'] },
      { icon: MessageSquare, title: 'Colaboração Inteligente', description: 'Comentários, threads e notificações em todos os módulos.', highlights: ['Threads', 'Reações'] },
      { icon: Shield, title: 'Frameworks Customizados', description: 'Crie frameworks do zero ou importe via CSV.', highlights: ['Import CSV', 'Edição completa'] },
    ],
  },
];

export function PlatformSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const topRow = platforms.slice(0, 3);
  const bottomRow = platforms.slice(3);

  return (
    <section id="platform" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-space tracking-tight">
            Uma Plataforma.{' '}
            <span className="text-gradient-cosmic">Segurança Completa.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Consolide governança, fornecedores e políticas em uma única solução com IA — usada pela nossa consultoria e disponível para sua equipe.
          </p>
        </div>

        {/* 2x2 Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              isExpanded={expandedId === platform.id}
              onToggle={() => toggleExpanded(platform.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformCard({
  platform,
  isExpanded,
  onToggle,
}: {
  platform: Platform;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { color } = platform;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div
        className={cn(
          'group relative bg-card/60 dark:bg-card/40 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-500 overflow-hidden',
          color.border,
          color.borderHover,
          color.glow,
          isExpanded && 'ring-1',
          isExpanded ? `ring-current ${color.text}` : ''
        )}
        style={isExpanded ? { borderColor: 'currentColor' } : undefined}
      >
        {/* Icon */}
        <div className={`w-14 h-14 bg-gradient-to-br ${color.icon} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <platform.icon className="w-7 h-7 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-3 font-space">
          {platform.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-6">{platform.description}</p>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {platform.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className={cn('w-4 h-4 flex-shrink-0 mt-0.5', color.text)} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Expand Button */}
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'w-full flex items-center justify-center gap-2 text-sm py-2 rounded-lg transition-colors',
              color.text,
              color.bg,
              'hover:opacity-80'
            )}
          >
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform duration-300',
                isExpanded && 'rotate-180'
              )}
            />
            {isExpanded ? 'Recolher' : 'Ver Detalhes'}
          </button>
        </CollapsibleTrigger>

        {/* Expanded Sub-Features */}
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="mt-8 pt-8 border-t border-border/50">
            <p className={cn('text-xs font-semibold uppercase tracking-widest mb-4', color.text)}>
              Funcionalidades
            </p>
            <div className="flex flex-col gap-3">
              {platform.subFeatures.map((sub) => (
                <SubFeatureCard key={sub.title} sub={sub} color={color} />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function SubFeatureCard({ sub, color }: { sub: SubFeature; color: ModuleColor }) {
  return (
    <div className={cn(
      'flex items-start gap-4 rounded-lg border border-white/[0.06] px-5 py-4 transition-all duration-300',
      'bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]',
    )}>
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', color.bg)}>
        <sub.icon className={cn('w-5 h-5', color.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground mb-1">{sub.title}</h4>
        <p className="text-xs text-muted-foreground leading-snug mb-2">{sub.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {sub.highlights.map((h) => (
            <Badge key={h} variant="outline" className={cn('text-[11px] px-2 py-0 rounded-full', color.badge)}>
              {h}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
