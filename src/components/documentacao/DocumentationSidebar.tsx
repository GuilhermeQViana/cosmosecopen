import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Rocket,
  ClipboardCheck,
  Building,
  Users,
  Settings,
  CreditCard,
  Keyboard,
  Calculator,
  ChevronRight,
  BookOpen,
  FileText,
  Brain
} from 'lucide-react';

export interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  subsections?: { id: string; title: string }[];
}

export const documentationSections: DocSection[] = [
  {
    id: 'primeiros-passos',
    title: 'Primeiros Passos',
    icon: Rocket,
    subsections: [
      { id: 'criando-conta', title: 'Criando sua conta' },
      { id: 'configurando-organizacao', title: 'Configurando organização' },
      { id: 'navegacao', title: 'Navegação na plataforma' },
      { id: 'escolhendo-modulo', title: 'Escolhendo um módulo' },
      { id: 'selecionando-framework', title: 'Selecionando um framework' },
      { id: 'onboarding-checklist', title: 'Onboarding Checklist' },
    ],
  },
  {
    id: 'modulo-grc',
    title: 'Módulo GRC Frameworks',
    icon: ClipboardCheck,
    subsections: [
      { id: 'dashboard-executivo', title: 'Dashboard Executivo' },
      { id: 'diagnostico-controles', title: 'Diagnóstico de Controles' },
      { id: 'snapshots-diagnostico', title: 'Snapshots de Diagnóstico' },
      { id: 'registro-riscos', title: 'Registro de Riscos' },
      { id: 'cofre-evidencias', title: 'Cofre de Evidências' },
      { id: 'plano-acao', title: 'Plano de Ação' },
      { id: 'relatorios', title: 'Relatórios' },
      { id: 'mapeamento-frameworks', title: 'Mapeamento de Frameworks' },
      { id: 'auditoria-logs', title: 'Auditoria de Logs' },
    ],
  },
  {
    id: 'modulo-politicas',
    title: 'Módulo de Políticas',
    icon: FileText,
    subsections: [
      { id: 'dashboard-politicas', title: 'Dashboard de Políticas' },
      { id: 'central-politicas', title: 'Central de Políticas' },
      { id: 'editor-politicas', title: 'Editor de Políticas' },
      { id: 'fluxos-aprovacao', title: 'Fluxos de Aprovação' },
      { id: 'campanhas-aceite', title: 'Campanhas de Aceite' },
      { id: 'biblioteca-modelos', title: 'Biblioteca de Modelos' },
    ],
  },
  {
    id: 'modulo-vrm',
    title: 'Módulo VRM (Fornecedores)',
    icon: Building,
    subsections: [
      { id: 'dashboard-vrm', title: 'Dashboard VRM' },
      { id: 'cadastro-fornecedores', title: 'Cadastro de Fornecedores' },
      { id: 'avaliacoes-fornecedores', title: 'Avaliações' },
      { id: 'qualificacao-fornecedores', title: 'Qualificação de Fornecedores' },
      { id: 'requisitos-customizados', title: 'Requisitos Customizados' },
      { id: 'cofre-evidencias-vrm', title: 'Cofre de Evidências VRM' },
      { id: 'contratos-slas', title: 'Contratos e SLAs' },
      { id: 'incidentes-fornecedores', title: 'Incidentes' },
      { id: 'due-diligence', title: 'Due Diligence' },
      { id: 'agenda-reavaliacao', title: 'Agenda de Reavaliação' },
      { id: 'planos-acao-vrm', title: 'Planos de Ação VRM' },
    ],
  },
  {
    id: 'equipe-colaboracao',
    title: 'Equipe e Colaboração',
    icon: Users,
    subsections: [
      { id: 'gestao-equipe', title: 'Gestão de Equipe' },
      { id: 'permissoes-rbac', title: 'Permissões por Função (RBAC)' },
      { id: 'convites-email', title: 'Convites por Email' },
      { id: 'comentarios-discussoes', title: 'Comentários e Discussões' },
    ],
  },
  {
    id: 'inteligencia-artificial',
    title: 'Inteligência Artificial',
    icon: Brain,
    subsections: [
      { id: 'ia-visao-geral', title: 'Visão Geral da IA' },
      { id: 'ia-planos-acao', title: 'Geração de Planos de Ação' },
      { id: 'ia-implementacao', title: 'Assistente de Implementação' },
      { id: 'ia-politicas', title: 'Escritor de Políticas' },
      { id: 'ia-risco-fornecedores', title: 'Análise de Risco de Fornecedores' },
      { id: 'ia-criticidade', title: 'Classificação de Criticidade' },
    ],
  },
  {
    id: 'configuracoes',
    title: 'Configurações',
    icon: Settings,
    subsections: [
      { id: 'perfil-usuario', title: 'Perfil do Usuário' },
      { id: 'configuracao-organizacao', title: 'Organização' },
      { id: 'frameworks-customizados', title: 'Frameworks Customizados' },
      { id: 'importacao-exportacao', title: 'Importação e Exportação' },
      { id: 'notificacoes', title: 'Notificações' },
      { id: 'aparencia', title: 'Aparência' },
      { id: 'backup-dados', title: 'Backup de Dados' },
    ],
  },
  {
    id: 'assinatura-planos',
    title: 'Assinatura e Planos',
    icon: CreditCard,
    subsections: [
      { id: 'plano-pro', title: 'Plano Pro' },
      { id: 'gerenciamento-assinatura', title: 'Gerenciamento' },
    ],
  },
  {
    id: 'atalhos-teclado',
    title: 'Atalhos de Teclado',
    icon: Keyboard,
  },
  {
    id: 'metodologia-risco',
    title: 'Metodologia de Risco',
    icon: Calculator,
    subsections: [
      { id: 'formula-risk-score', title: 'Fórmula do Risk Score' },
      { id: 'matriz-5x5', title: 'Matriz 5x5' },
      { id: 'niveis-classificacao', title: 'Níveis de Classificação' },
    ],
  },
];

interface DocumentationSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function DocumentationSidebar({ activeSection, onSectionChange }: DocumentationSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['primeiros-passos']);

  const filteredSections = documentationSections.filter((section) => {
    const matchesTitle = section.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubsection = section.subsections?.some((sub) =>
      sub.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesTitle || matchesSubsection;
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    // Expand parent section if clicking on subsection
    const parentSection = documentationSections.find((s) =>
      s.subsections?.some((sub) => sub.id === sectionId)
    );
    if (parentSection && !expandedSections.includes(parentSection.id)) {
      setExpandedSections((prev) => [...prev, parentSection.id]);
    }
  };

  return (
    <aside className="w-72 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold font-space text-foreground">Documentação</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar na documentação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2">
          {filteredSections.map((section) => (
            <div key={section.id} className="mb-1">
              <button
                onClick={() => {
                  if (section.subsections) {
                    toggleSection(section.id);
                  }
                  handleSectionClick(section.id);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeSection === section.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <section.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left truncate">{section.title}</span>
                {section.subsections && (
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform",
                      expandedSections.includes(section.id) && "rotate-90"
                    )}
                  />
                )}
              </button>

              {section.subsections && expandedSections.includes(section.id) && (
                <div className="ml-6 mt-1 space-y-1">
                  {section.subsections
                    .filter((sub) =>
                      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      searchTerm === ''
                    )
                    .map((subsection) => (
                      <button
                        key={subsection.id}
                        onClick={() => handleSectionClick(subsection.id)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                          activeSection === subsection.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {subsection.title}
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
