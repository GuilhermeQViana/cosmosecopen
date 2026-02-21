import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { StarField } from '@/components/ui/star-field';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { AUTH_ROUTE } from '@/lib/constants';
import { DocumentationSidebar, documentationSections } from '@/components/documentacao/DocumentationSidebar';
import { 
  DocumentationSection, 
  DocTip, 
  DocFeature, 
  DocStep, 
  DocBadgeList, 
  DocTable,
  DocKeyboardShortcut 
} from '@/components/documentacao/DocumentationSection';
import { 
  ArrowLeft,
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  FileCheck,
  ListTodo,
  FileBarChart,
  Map,
  Shield,
  Building2,
  Users,
  Radar,
  Calendar,
  BarChart3,
  TrendingUp,
  Bell,
  Upload,
  Kanban,
  Activity,
  Lock,
  Zap,
  Target,
  Layers,
  FileText,
  Edit3,
  CheckCircle2,
  BookOpen,
  Send,
  Brain,
  Sparkles,
  Bot,
  Eye,
  ShieldCheck,
  Mail,
  UserCheck,
  Download,
  Save,
  History,
  Filter,
  FileSpreadsheet,
  Briefcase,
  Scale,
  AlertCircle,
  Search,
  Clipboard,
  FolderOpen,
  Link2
} from 'lucide-react';

export default function Documentacao() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('primeiros-passos');

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setActiveSection(hash);
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    window.history.replaceState(null, '', `#${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <StarField starCount={100} shootingStarCount={2} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <CosmoSecLogo size="sm" />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to={AUTH_ROUTE}>Entrar</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <DocumentationSidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <main className="max-w-4xl mx-auto p-8 space-y-8">
            
            {/* ==================== PRIMEIROS PASSOS ==================== */}
            <DocumentationSection
              id="primeiros-passos"
              title="Primeiros Passos"
              description="Aprenda a configurar e navegar na plataforma CosmoSec GRC"
            >
              <p className="text-muted-foreground mb-6">
                Bem-vindo à CosmoSec! Esta seção irá guiá-lo através dos primeiros passos para configurar sua conta e começar a usar a plataforma.
              </p>

              <h3 id="criando-conta" className="text-lg font-semibold mt-6 mb-4 scroll-mt-24">Criando sua conta</h3>
              <DocStep number={1} title="Acesse a página de autenticação">
                Clique em "Começar Agora" na página inicial ou no botão "Entrar" no topo desta página.
              </DocStep>
              <DocStep number={2} title="Preencha seus dados">
                Informe seu nome completo, email e crie uma senha segura.
              </DocStep>
              <DocStep number={3} title="Confirme seu email">
                Verifique sua caixa de entrada e clique no link de confirmação.
              </DocStep>

              <h3 id="configurando-organizacao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Configurando sua organização</h3>
              <p className="text-muted-foreground mb-4">
                Após criar sua conta, você será guiado pelo processo de onboarding para configurar sua primeira organização.
              </p>
              <DocTip variant="info" title="Múltiplas Organizações">
                Você pode criar ou participar de múltiplas organizações. Use o seletor no menu lateral para alternar entre elas.
              </DocTip>

              <h3 id="navegacao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Navegação na plataforma</h3>
              <p className="text-muted-foreground mb-4">
                A interface da CosmoSec é dividida em três áreas principais:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <DocFeature 
                  icon={LayoutDashboard}
                  title="Menu Lateral (Sidebar)"
                  description="Navegue entre os módulos e funcionalidades principais da plataforma."
                />
                <DocFeature 
                  icon={Zap}
                  title="Command Palette (Ctrl+K)"
                  description="Acesse rapidamente qualquer funcionalidade digitando seu nome."
                />
              </div>

              <h3 id="escolhendo-modulo" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Escolhendo um módulo</h3>
              <p className="text-muted-foreground mb-4">
                A CosmoSec oferece três módulos principais:
              </p>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <DocFeature 
                  icon={Shield}
                  title="GRC Frameworks"
                  description="Gestão de conformidade com frameworks como NIST CSF, ISO 27001 e BCB/CMN."
                />
                <DocFeature 
                  icon={FileText}
                  title="Gestão de Políticas"
                  description="Crie, aprove e distribua políticas de segurança com versionamento e fluxos de aprovação."
                />
                <DocFeature 
                  icon={Building2}
                  title="VRM (Fornecedores)"
                  description="Gestão de riscos de terceiros com avaliações, qualificações e monitoramento contínuo."
                />
              </div>

              <h3 id="selecionando-framework" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Selecionando um framework</h3>
              <p className="text-muted-foreground mb-4">
                No módulo GRC, você pode trabalhar com diferentes frameworks de conformidade:
              </p>
              <DocBadgeList items={[
                { label: 'NIST CSF', description: 'Framework de Cibersegurança do NIST com 6 funções e 23 categorias.' },
                { label: 'ISO 27001', description: 'Norma internacional para Sistemas de Gestão de Segurança da Informação.' },
                { label: 'BCB/CMN', description: 'Regulamentações do Banco Central e CMN para instituições financeiras.' },
                { label: 'Custom', description: 'Crie seus próprios frameworks personalizados.', color: 'warning' },
              ]} />

              <h3 id="onboarding-checklist" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Onboarding Checklist</h3>
              <p className="text-muted-foreground mb-4">
                Ao acessar a plataforma pela primeira vez, um widget de checklist aparecerá no canto inferior direito com tarefas guiadas para configurar sua organização:
              </p>
              <DocStep number={1} title="Criar organização">Defina o nome e descrição da sua empresa.</DocStep>
              <DocStep number={2} title="Selecionar módulo">Escolha entre GRC, Políticas ou VRM.</DocStep>
              <DocStep number={3} title="Configurar framework">Selecione o framework de conformidade desejado.</DocStep>
              <DocStep number={4} title="Realizar primeiro diagnóstico">Avalie pelo menos um controle para começar.</DocStep>
              <DocTip variant="tip">
                O checklist desaparece automaticamente ao completar todas as etapas, mas você pode ocultá-lo a qualquer momento.
              </DocTip>
            </DocumentationSection>

            {/* ==================== MÓDULO GRC ==================== */}
            <DocumentationSection
              id="modulo-grc"
              title="Módulo GRC Frameworks"
              description="Gerencie conformidade, riscos e controles de segurança"
            >
              <h3 id="dashboard-executivo" className="text-lg font-semibold mb-4 scroll-mt-24">Dashboard Executivo</h3>
              <p className="text-muted-foreground mb-4">
                O Dashboard oferece uma visão consolidada do seu programa de segurança:
              </p>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <DocFeature icon={Target} title="Score de Conformidade" description="Percentual geral de conformidade com o framework selecionado." />
                <DocFeature icon={AlertTriangle} title="Riscos Críticos" description="Quantidade de riscos com nível crítico que requerem atenção." />
                <DocFeature icon={FileCheck} title="Evidências" description="Total de evidências coletadas e vinculadas a controles." />
                <DocFeature icon={ListTodo} title="Ações Pendentes" description="Planos de ação em andamento ou atrasados." />
              </div>
              <DocTip variant="tip">
                Use os filtros de período para comparar métricas ao longo do tempo e identificar tendências. O dashboard é personalizável com widgets redimensionáveis e reposicionáveis.
              </DocTip>

              <h3 id="diagnostico-controles" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Diagnóstico de Controles</h3>
              <p className="text-muted-foreground mb-4">
                Avalie o nível de maturidade dos controles do framework selecionado:
              </p>
              <DocTable 
                headers={['Nível', 'Descrição', 'Significado']}
                rows={[
                  ['0', 'Inexistente', 'Controle não existe ou não está implementado'],
                  ['1', 'Inicial', 'Processos são ad hoc e desorganizados'],
                  ['2', 'Repetível', 'Processos básicos estabelecidos'],
                  ['3', 'Definido', 'Processos documentados e padronizados'],
                  ['4', 'Gerenciado', 'Processos medidos e controlados'],
                  ['5', 'Otimizado', 'Melhoria contínua implementada'],
                ]}
              />
              <DocTip variant="info" title="Risk Score">
                O Risk Score é calculado automaticamente: (Maturidade Alvo - Maturidade Atual) × Peso do Controle.
              </DocTip>
              <p className="text-muted-foreground mt-4 mb-2">Recursos avançados do diagnóstico:</p>
              <div className="grid gap-4 md:grid-cols-2">
                <DocFeature icon={Filter} title="Filtros Avançados" description="Filtre controles por status de conformidade, categoria, criticidade e risk score." />
                <DocFeature icon={Eye} title="Modo Auditoria" description="Visualize controles em formato de tabela otimizado para auditores, com foco em evidências e observações." />
                <DocFeature icon={Sparkles} title="Geração em Lote com IA" description="Gere planos de ação automaticamente para todos os gaps identificados de uma só vez." />
                <DocFeature icon={ClipboardCheck} title="Edição em Massa" description="Selecione múltiplos controles para aplicar status ou maturidade de uma vez." />
              </div>

              <h3 id="snapshots-diagnostico" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Snapshots de Diagnóstico</h3>
              <p className="text-muted-foreground mb-4">
                Salve versões do seu diagnóstico para comparação temporal. Cada snapshot captura o estado completo de todas as avaliações naquele momento:
              </p>
              <DocStep number={1} title="Salvar Versão">Clique em "Salvar Versão" na barra de ações do diagnóstico e dê um nome descritivo (ex: "Pré-auditoria Q1 2026").</DocStep>
              <DocStep number={2} title="Comparar Versões">Acesse o histórico para visualizar snapshots anteriores e comparar a evolução da maturidade ao longo do tempo.</DocStep>
              <DocTip variant="tip">
                Snapshots são ideais para apresentar evolução em auditorias e comitês executivos.
              </DocTip>

              <h3 id="registro-riscos" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Registro de Riscos</h3>
              <p className="text-muted-foreground mb-4">
                Gerencie riscos de segurança usando a metodologia de matriz 5x5:
              </p>
              <DocBadgeList items={[
                { label: 'Muito Baixo', description: 'Score 1-2: Monitoramento padrão', color: 'success' },
                { label: 'Baixo', description: 'Score 3-5: Acompanhamento periódico' },
                { label: 'Médio', description: 'Score 6-11: Atenção requerida', color: 'warning' },
                { label: 'Alto', description: 'Score 12-19: Prioridade alta', color: 'destructive' },
                { label: 'Crítico', description: 'Score 20-25: Ação imediata', color: 'destructive' },
              ]} />

              <h3 id="cofre-evidencias" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Cofre de Evidências</h3>
              <p className="text-muted-foreground mb-4">
                Armazene e organize documentos que comprovam a implementação de controles:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <DocFeature icon={Upload} title="Upload de Arquivos" description="Arraste ou selecione arquivos para upload seguro com classificação por confidencialidade." />
                <DocFeature icon={Layers} title="Organização em Pastas" description="Crie estrutura de pastas hierárquicas para categorizar evidências." />
              </div>

              <h3 id="plano-acao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Plano de Ação</h3>
              <p className="text-muted-foreground mb-4">
                Gerencie ações de remediação e melhorias:
              </p>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <DocFeature icon={Kanban} title="Visualização Kanban" description="Arraste cards entre colunas de status (Pendente, Em Progresso, Concluído)." />
                <DocFeature icon={Calendar} title="Visualização Calendário" description="Veja prazos em formato de calendário mensal." />
              </div>
              <DocTip variant="tip">
                Use a geração automática com IA para criar planos de ação a partir de gaps identificados. A ação "Excluir Todos" é restrita a administradores e exige confirmação por digitação.
              </DocTip>

              <h3 id="relatorios" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Relatórios</h3>
              <p className="text-muted-foreground mb-4">
                Gere relatórios executivos e detalhados para stakeholders. Todos os relatórios gerados são persistidos em um histórico consultável:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <DocFeature icon={FileBarChart} title="Relatório Executivo" description="Visão resumida com métricas-chave, score de conformidade e principais riscos." />
                <DocFeature icon={History} title="Histórico de Relatórios" description="Consulte todos os relatórios previamente gerados na aba Histórico com data, tipo e framework." />
              </div>

              <h3 id="mapeamento-frameworks" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Mapeamento de Frameworks</h3>
              <p className="text-muted-foreground mb-4">
                Crie equivalências entre controles de diferentes frameworks para reutilizar avaliações. Utilize a matriz visual para mapear correspondências entre frameworks como NIST CSF e ISO 27001.
              </p>

              <h3 id="auditoria-logs" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Auditoria de Logs</h3>
              <p className="text-muted-foreground mb-4">
                Rastreie todas as ações realizadas na plataforma para fins de auditoria e compliance. Visualize quem fez o quê e quando com timeline cronológica e filtros por tipo de ação.
              </p>
            </DocumentationSection>

            {/* ==================== MÓDULO DE POLÍTICAS ==================== */}
            <DocumentationSection
              id="modulo-politicas"
              title="Módulo de Políticas"
              description="Crie, aprove e distribua políticas de segurança da informação"
            >
              <h3 id="dashboard-politicas" className="text-lg font-semibold mb-4 scroll-mt-24">Dashboard de Políticas</h3>
              <p className="text-muted-foreground mb-4">
                Visão consolidada do ciclo de vida das suas políticas:
              </p>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <DocFeature icon={FileText} title="Total de Políticas" description="Quantidade total de políticas cadastradas na organização." />
                <DocFeature icon={CheckCircle2} title="Publicadas" description="Políticas aprovadas e publicadas para consulta." />
                <DocFeature icon={Edit3} title="Em Revisão" description="Políticas em processo de edição ou aguardando aprovação." />
                <DocFeature icon={AlertCircle} title="Próximas Revisões" description="Políticas com data de revisão próxima ou expiradas." />
              </div>

              <h3 id="central-politicas" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Central de Políticas</h3>
              <p className="text-muted-foreground mb-4">
                Listagem completa das políticas da organização com filtros por status (Rascunho, Em Revisão, Publicada, Expirada) e por categoria (Segurança, Privacidade, Continuidade, etc.).
              </p>
              <DocStep number={1} title="Criar Nova Política">Clique em "Nova Política", defina título, categoria e framework associado.</DocStep>
              <DocStep number={2} title="Editar Conteúdo">Use o editor rico para escrever o corpo da política.</DocStep>
              <DocStep number={3} title="Submeter para Aprovação">Envie a política para o fluxo de aprovação configurado.</DocStep>

              <h3 id="editor-politicas" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Editor de Políticas</h3>
              <p className="text-muted-foreground mb-4">
                Editor profissional WYSIWYG baseado em TipTap com recursos avançados:
              </p>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <DocFeature icon={Edit3} title="Formatação Rica" description="Negrito, itálico, headings, listas, tabelas, links e imagens inline." />
                <DocFeature icon={Save} title="Salvamento Automático" description="Conteúdo salvo automaticamente a cada 30 segundos. Atalho Ctrl+S para salvamento manual." />
                <DocFeature icon={History} title="Versionamento Automático" description="Cada salvamento cria uma versão imutável com possibilidade de restaurar versões anteriores." />
                <DocFeature icon={Link2} title="Vinculações" description="Vincule a política a controles e riscos específicos para rastreabilidade completa." />
              </div>
              <DocTip variant="info" title="Painel Lateral">
                O editor possui um painel lateral colapsável com abas para Metadados, Vínculos, Histórico de Versões e Discussões (comentários).
              </DocTip>

              <h3 id="fluxos-aprovacao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Fluxos de Aprovação</h3>
              <p className="text-muted-foreground mb-4">
                Configure workflows de aprovação multi-nível para governança de políticas:
              </p>
              <DocTable
                headers={['Recurso', 'Descrição']}
                rows={[
                  ['Até 5 Níveis', 'Defina até 5 etapas de aprovação sequenciais, cada uma com aprovador e área responsável (ex: TI, Jurídico, Diretoria).'],
                  ['SLA de Aprovação', 'Configure o prazo em dias para cada nível de aprovação.'],
                  ['Comentários Obrigatórios', 'Rejeições exigem justificativa. Aprovações permitem comentários opcionais.'],
                  ['Histórico Completo', 'Todas as decisões (aprovação/rejeição) ficam registradas com data, autor e comentário.'],
                ]}
              />

              <h3 id="campanhas-aceite" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Campanhas de Aceite</h3>
              <p className="text-muted-foreground mb-4">
                Distribua políticas publicadas para que funcionários confirmem leitura e aceite:
              </p>
              <DocStep number={1} title="Criar Campanha">Selecione a política publicada, defina título, público-alvo e prazo.</DocStep>
              <DocStep number={2} title="Acompanhar Progresso">Monitore a taxa de aceite em tempo real no dashboard de campanhas.</DocStep>
              <DocStep number={3} title="Relatório de Conformidade">Exporte a lista de quem aceitou e quem ainda está pendente.</DocStep>

              <h3 id="biblioteca-modelos" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Biblioteca de Modelos</h3>
              <p className="text-muted-foreground mb-4">
                Acesse modelos pré-construídos de políticas organizados por categoria e framework:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <DocFeature icon={BookOpen} title="Modelos por Categoria" description="Modelos para Segurança da Informação, Privacidade, Uso Aceitável, Continuidade e mais." />
                <DocFeature icon={Download} title="Importar/Exportar DOCX" description="Importe documentos Word existentes ou exporte políticas para DOCX." />
              </div>
              <DocTip variant="tip">
                Use o Escritor de Políticas com IA para gerar rascunhos baseados no framework selecionado e adaptar modelos ao contexto da sua organização.
              </DocTip>
            </DocumentationSection>

            {/* ==================== MÓDULO VRM ==================== */}
            <DocumentationSection
              id="modulo-vrm"
              title="Módulo VRM (Gestão de Fornecedores)"
              description="Avalie, qualifique e monitore riscos de terceiros"
            >
              <h3 id="dashboard-vrm" className="text-lg font-semibold mb-4 scroll-mt-24">Dashboard VRM</h3>
              <p className="text-muted-foreground mb-4">
                Visão consolidada do programa de gestão de fornecedores:
              </p>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <DocFeature icon={Radar} title="Gráfico Radar" description="Visualize conformidade por domínio de segurança." />
                <DocFeature icon={BarChart3} title="Heat Map de Riscos" description="Identifique rapidamente fornecedores de alto risco." />
                <DocFeature icon={TrendingUp} title="Tendências" description="Acompanhe evolução dos scores ao longo do tempo." />
                <DocFeature icon={Bell} title="Alertas" description="Notificações de contratos expirando e avaliações pendentes." />
              </div>

              <h3 id="cadastro-fornecedores" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Cadastro de Fornecedores</h3>
              <p className="text-muted-foreground mb-4">
                Registre informações essenciais dos seus fornecedores:
              </p>
              <DocBadgeList items={[
                { label: 'Crítico', description: 'Fornecedores essenciais para operação', color: 'destructive' },
                { label: 'Alto', description: 'Fornecedores com acesso a dados sensíveis', color: 'warning' },
                { label: 'Médio', description: 'Fornecedores com acesso limitado' },
                { label: 'Baixo', description: 'Fornecedores sem acesso a sistemas ou dados', color: 'success' },
              ]} />

              <h3 id="avaliacoes-fornecedores" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Avaliações de Fornecedores</h3>
              <p className="text-muted-foreground mb-4">
                O sistema inclui 45 requisitos padrão organizados em 4 domínios:
              </p>
              <DocTable 
                headers={['Domínio', 'Requisitos', 'Foco']}
                rows={[
                  ['Segurança da Informação', '~12', 'Políticas, controles de acesso, criptografia'],
                  ['Cyber Security', '~12', 'Proteção de rede, monitoramento, resposta a incidentes'],
                  ['Privacidade (LGPD)', '~10', 'Tratamento de dados pessoais, consentimento'],
                  ['Continuidade de Negócios', '~11', 'BCP, DRP, resiliência operacional'],
                ]}
              />

              <h3 id="qualificacao-fornecedores" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Qualificação de Fornecedores</h3>
              <p className="text-muted-foreground mb-4">
                Sistema completo de qualificação com templates, campanhas e portal externo:
              </p>
              <DocTable
                headers={['Recurso', 'Descrição']}
                rows={[
                  ['Templates de Qualificação', 'Crie questionários com perguntas por seção, cada uma com peso numérico. Marque perguntas como KO (eliminatórias).'],
                  ['Versionamento de Templates', 'Cada edição cria uma nova versão, preservando dados de campanhas anteriores.'],
                  ['Campanhas por Link', 'Envie campanhas para fornecedores preencherem via portal externo, sem necessidade de conta na plataforma.'],
                  ['Score Automático (0-100)', 'O sistema calcula automaticamente o score ponderado e classifica o risco (Baixo, Médio, Alto, Crítico).'],
                  ['Comparativo Side-by-Side', 'Compare resultados de múltiplos fornecedores lado a lado.'],
                ]}
              />
              <DocTip variant="info" title="Perguntas KO">
                Perguntas marcadas como KO (Knock-Out) reprovam automaticamente o fornecedor se respondidas negativamente, independente do score geral.
              </DocTip>

              <h3 id="requisitos-customizados" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Requisitos Customizados</h3>
              <p className="text-muted-foreground mb-4">
                Crie requisitos específicos para sua organização além dos 45 padrões incluídos.
              </p>

              <h3 id="cofre-evidencias-vrm" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Cofre de Evidências VRM</h3>
              <p className="text-muted-foreground mb-4">
                Página dedicada para armazenar e gerenciar documentos de fornecedores:
              </p>
              <DocTable
                headers={['Categoria', 'Exemplos']}
                rows={[
                  ['Contrato', 'Contratos assinados, aditivos, termos de confidencialidade'],
                  ['Certificação', 'ISO 27001, SOC 2, PCI-DSS'],
                  ['DDQ (Questionário)', 'Questionários de due diligence preenchidos'],
                  ['Política', 'Políticas de segurança do fornecedor'],
                  ['Relatório de Auditoria', 'Relatórios de auditoria independente'],
                ]}
              />
              <DocTip variant="tip">
                Configure datas de validade para receber alertas automáticos quando certificações ou documentos expirarem.
              </DocTip>

              <h3 id="contratos-slas" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Contratos e SLAs</h3>
              <p className="text-muted-foreground mb-4">
                Gerencie contratos com valores, moedas e datas de vigência. Acompanhe SLAs com métricas como disponibilidade, tempo de resposta e tempo de resolução de incidentes.
              </p>

              <h3 id="incidentes-fornecedores" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Incidentes de Fornecedores</h3>
              <p className="text-muted-foreground mb-4">
                Registre incidentes com severidade (Baixa, Média, Alta, Crítica), categoria, causa raiz e ações corretivas. Utilize IA para analisar automaticamente o impacto e gerar recomendações.
              </p>

              <h3 id="due-diligence" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Due Diligence</h3>
              <p className="text-muted-foreground mb-4">
                Checklist estruturado por categoria para avaliação aprofundada de fornecedores:
              </p>
              <DocStep number={1} title="Iniciar Due Diligence">Selecione o fornecedor e inicie o processo de avaliação.</DocStep>
              <DocStep number={2} title="Preencher Checklist">Avalie cada item por categoria (Jurídico, Financeiro, Técnico, Compliance) marcando como Aprovado, Reprovado ou Pendente.</DocStep>
              <DocStep number={3} title="Aprovação Final">Após avaliar todos os itens, aprove ou reprove a due diligence com comentários de justificativa.</DocStep>

              <h3 id="agenda-reavaliacao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Agenda de Reavaliação</h3>
              <p className="text-muted-foreground mb-4">
                Programe reavaliações periódicas baseadas na criticidade do fornecedor.
              </p>

              <h3 id="planos-acao-vrm" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Planos de Ação VRM</h3>
              <p className="text-muted-foreground mb-4">
                Crie ações de mitigação específicas para gaps identificados em fornecedores, com responsáveis, prazos e acompanhamento de progresso.
              </p>
            </DocumentationSection>

            {/* ==================== EQUIPE E COLABORAÇÃO ==================== */}
            <DocumentationSection
              id="equipe-colaboracao"
              title="Equipe e Colaboração"
              description="Trabalhe em equipe com controle de acesso granular"
            >
              <h3 id="gestao-equipe" className="text-lg font-semibold mb-4 scroll-mt-24">Gestão de Equipe</h3>
              <p className="text-muted-foreground mb-4">
                Convide membros e gerencie sua equipe. Administradores podem convidar novos membros, alterar funções e remover usuários da organização.
              </p>

              <h3 id="permissoes-rbac" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Permissões por Função (RBAC)</h3>
              <p className="text-muted-foreground mb-4">
                A plataforma implementa controle de acesso baseado em funções (Role-Based Access Control) com 3 perfis:
              </p>
              <DocTable 
                headers={['Permissão', 'Admin', 'Analista', 'Auditor']}
                rows={[
                  ['Criar, editar e excluir registros', '✅', '✅', '❌'],
                  ['Excluir em massa (Excluir Todos)', '✅', '❌', '❌'],
                  ['Gerenciar equipe e convites', '✅', '❌', '❌'],
                  ['Configurações da organização', '✅', '❌', '❌'],
                  ['Exportar e importar dados', '✅', '❌', '✅'],
                  ['Visualizar todos os dados', '✅', '✅', '✅'],
                  ['Adicionar comentários', '✅', '✅', '✅'],
                ]}
              />
              <DocTip variant="warning" title="Auditor = Somente Leitura">
                O perfil Auditor tem acesso completo de visualização e pode exportar relatórios, mas não pode criar, editar ou excluir nenhum registro.
              </DocTip>

              <h3 id="convites-email" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Convites por Email</h3>
              <p className="text-muted-foreground mb-4">
                O fluxo de convite funciona da seguinte forma:
              </p>
              <DocStep number={1} title="Enviar Convite">O administrador informa o email e a função do novo membro. Um email é enviado com um link de convite.</DocStep>
              <DocStep number={2} title="Aceitar Convite">O convidado clica no link, cria sua conta (ou faz login se já tiver) e é adicionado automaticamente à organização.</DocStep>
              <DocStep number={3} title="Validações">O sistema verifica se o convite não expirou, se não foi aceito anteriormente e se o email do usuário logado corresponde ao email do convite.</DocStep>
              <DocTip variant="info" title="Expiração">
                Convites expiram após 7 dias. Convites vencidos podem ser reenviados pelo administrador.
              </DocTip>

              <h3 id="comentarios-discussoes" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Comentários e Discussões</h3>
              <p className="text-muted-foreground mb-4">
                Colabore em avaliações, controles e políticas através de threads de comentários com respostas aninhadas, reações com emoji e possibilidade de fixar comentários importantes.
              </p>
            </DocumentationSection>

            {/* ==================== INTELIGÊNCIA ARTIFICIAL ==================== */}
            <DocumentationSection
              id="inteligencia-artificial"
              title="Inteligência Artificial"
              description="Recursos de IA integrados para acelerar seu programa de segurança"
            >
              <h3 id="ia-visao-geral" className="text-lg font-semibold mb-4 scroll-mt-24">Visão Geral da IA</h3>
              <p className="text-muted-foreground mb-4">
                A CosmoSec integra inteligência artificial em diversos pontos da plataforma para automatizar tarefas repetitivas e fornecer insights acionáveis. Todos os recursos de IA são opcionais e os resultados podem ser editados antes de salvar.
              </p>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <DocFeature icon={Sparkles} title="Geração Automática" description="Crie planos de ação, análises de risco e rascunhos de políticas com um clique." />
                <DocFeature icon={Bot} title="Assistentes Contextuais" description="Receba orientações específicas para implementação de controles de segurança." />
              </div>

              <h3 id="ia-planos-acao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Geração de Planos de Ação</h3>
              <p className="text-muted-foreground mb-4">
                Disponível em dois modos:
              </p>
              <DocTable
                headers={['Modo', 'Descrição']}
                rows={[
                  ['Individual', 'Gere um plano de ação específico para um controle com gap, com título, descrição e passos detalhados.'],
                  ['Em Lote', 'Gere planos de ação automaticamente para TODOS os controles com gap identificado no diagnóstico. Ideal para preencher rapidamente o backlog de remediação.'],
                ]}
              />

              <h3 id="ia-implementacao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Assistente de Implementação</h3>
              <p className="text-muted-foreground mb-4">
                Receba um guia contextual e passo a passo para implementar controles de segurança específicos. O assistente considera o framework selecionado e o contexto do controle para fornecer orientações práticas.
              </p>

              <h3 id="ia-politicas" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Escritor de Políticas com IA</h3>
              <p className="text-muted-foreground mb-4">
                Gere rascunhos completos de políticas baseados no framework selecionado. Informe o tipo de política desejada e a IA gera um documento estruturado que pode ser editado e refinado no editor.
              </p>

              <h3 id="ia-risco-fornecedores" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Análise de Risco de Fornecedores</h3>
              <p className="text-muted-foreground mb-4">
                Solicite uma análise automática de risco para qualquer fornecedor. A IA avalia o perfil, categoria, criticidade e dados disponíveis para gerar:
              </p>
              <DocBadgeList items={[
                { label: 'Risk Score', description: 'Score numérico de 0-100 indicando o nível de risco.' },
                { label: 'Top Concerns', description: 'Lista dos principais pontos de atenção identificados.' },
                { label: 'Recomendações', description: 'Ações sugeridas para mitigar os riscos encontrados.' },
              ]} />

              <h3 id="ia-criticidade" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Classificação de Criticidade</h3>
              <p className="text-muted-foreground mb-4">
                A IA sugere automaticamente o nível de criticidade de fornecedores com base em fatores como categoria de serviço, acesso a dados e sistemas, e dependência operacional.
              </p>
            </DocumentationSection>

            {/* ==================== CONFIGURAÇÕES ==================== */}
            <DocumentationSection
              id="configuracoes"
              title="Configurações"
              description="Personalize a plataforma"
            >
              <h3 id="perfil-usuario" className="text-lg font-semibold mb-4 scroll-mt-24">Perfil do Usuário</h3>
              <p className="text-muted-foreground mb-4">
                Atualize foto de perfil (com recorte de imagem), nome e altere sua senha.
              </p>

              <h3 id="configuracao-organizacao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Organização</h3>
              <p className="text-muted-foreground mb-4">
                Configure nome, descrição e logo da organização. Apenas administradores podem alterar essas configurações.
              </p>

              <h3 id="frameworks-customizados" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Frameworks Customizados</h3>
              <p className="text-muted-foreground mb-4">
                Crie frameworks personalizados com controles próprios. Importe controles em massa via CSV com mapeamento de campos configurável.
              </p>

              <h3 id="importacao-exportacao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Importação e Exportação de Dados</h3>
              <p className="text-muted-foreground mb-4">
                Recursos de portabilidade de dados da plataforma:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <DocFeature icon={Upload} title="Importar Controles CSV" description="Importe controles de frameworks externos via arquivo CSV com mapeamento de colunas." />
                <DocFeature icon={Download} title="Exportar Backup JSON" description="Exporte todos os dados da organização em formato JSON para backup ou migração." />
                <DocFeature icon={FileSpreadsheet} title="Importar Dados JSON" description="Restaure dados a partir de um backup JSON previamente exportado." />
                <DocFeature icon={FileBarChart} title="Exportar Relatórios" description="Gere e exporte relatórios em formato HTML com gráficos e métricas." />
              </div>
              <DocTip variant="warning" title="Permissão Necessária">
                Importação e exportação de dados requerem perfil Admin ou Auditor. Analistas não têm acesso a esses recursos.
              </DocTip>

              <h3 id="notificacoes" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Notificações</h3>
              <p className="text-muted-foreground mb-4">
                A plataforma possui um centro de notificações em tempo real acessível pelo ícone de sino no cabeçalho. Receba alertas sobre prazos de planos de ação, riscos críticos, convites de equipe e atualizações relevantes.
              </p>

              <h3 id="aparencia" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Aparência</h3>
              <p className="text-muted-foreground mb-4">
                Alterne entre tema claro e escuro. A preferência é salva por usuário e persiste entre sessões.
              </p>

              <h3 id="backup-dados" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Backup de Dados</h3>
              <p className="text-muted-foreground mb-4">
                Exporte e importe dados da organização em formato JSON. O backup inclui avaliações, riscos, planos de ação, evidências e configurações.
              </p>
            </DocumentationSection>

            {/* ==================== ASSINATURA ==================== */}
            <DocumentationSection
              id="assinatura-planos"
              title="Assinatura e Planos"
              description="Gerencie sua assinatura"
            >
              <h3 id="plano-pro" className="text-lg font-semibold mb-4 scroll-mt-24">Plano Pro</h3>
              <p className="text-muted-foreground mb-4">
                O plano Pro desbloqueia funcionalidades avançadas:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <DocFeature icon={Zap} title="Geração com IA" description="Crie planos de ação, análises e políticas automaticamente." />
                <DocFeature icon={FileBarChart} title="Relatórios Avançados" description="Relatórios executivos e comparativos com persistência de histórico." />
                <DocFeature icon={Users} title="Equipe Ilimitada" description="Convide quantos membros precisar com RBAC." />
                <DocFeature icon={Lock} title="Suporte Prioritário" description="Atendimento prioritário por email." />
              </div>

              <h3 id="gerenciamento-assinatura" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Gerenciamento</h3>
              <p className="text-muted-foreground mb-4">
                Acesse o portal de pagamento para atualizar método de pagamento, ver faturas e gerenciar assinatura.
              </p>
            </DocumentationSection>

            {/* ==================== ATALHOS ==================== */}
            <DocumentationSection
              id="atalhos-teclado"
              title="Atalhos de Teclado"
              description="Navegue mais rápido com atalhos"
            >
              <div className="space-y-1 bg-muted/30 rounded-lg p-4">
                <DocKeyboardShortcut keys={['Ctrl', 'K']} description="Abrir Command Palette" />
                <DocKeyboardShortcut keys={['Ctrl', 'B']} description="Toggle Sidebar" />
                <DocKeyboardShortcut keys={['Ctrl', 'D']} description="Ir para Dashboard" />
                <DocKeyboardShortcut keys={['Ctrl', 'R']} description="Ir para Riscos" />
                <DocKeyboardShortcut keys={['Ctrl', 'P']} description="Ir para Plano de Ação" />
                <DocKeyboardShortcut keys={['Ctrl', 'E']} description="Ir para Evidências" />
                <DocKeyboardShortcut keys={['Ctrl', 'S']} description="Salvar (no editor de políticas)" />
                <DocKeyboardShortcut keys={['Ctrl', 'T']} description="Alternar Tema" />
                <DocKeyboardShortcut keys={['?']} description="Ver todos os atalhos" />
              </div>
            </DocumentationSection>

            {/* ==================== METODOLOGIA ==================== */}
            <DocumentationSection
              id="metodologia-risco"
              title="Metodologia de Risco"
              description="Entenda como calculamos e classificamos riscos"
            >
              <h3 id="formula-risk-score" className="text-lg font-semibold mb-4 scroll-mt-24">Fórmula do Risk Score</h3>
              <p className="text-muted-foreground mb-4">
                O Risk Score de controles é calculado pela fórmula:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg font-mono text-center text-lg mb-4">
                Risk Score = (Maturidade Alvo - Maturidade Atual) × Peso do Controle
              </div>
              <DocBadgeList items={[
                { label: 'Peso 1', description: 'Controles de baixa criticidade' },
                { label: 'Peso 2', description: 'Controles de média criticidade', color: 'warning' },
                { label: 'Peso 3', description: 'Controles de alta criticidade', color: 'destructive' },
              ]} />

              <h3 id="matriz-5x5" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Matriz 5x5</h3>
              <p className="text-muted-foreground mb-4">
                Para riscos de negócio, usamos a matriz de Probabilidade × Impacto:
              </p>
              <DocTable 
                headers={['', 'Impacto 1', 'Impacto 2', 'Impacto 3', 'Impacto 4', 'Impacto 5']}
                rows={[
                  ['Prob 5', '5', '10', '15', '20', '25'],
                  ['Prob 4', '4', '8', '12', '16', '20'],
                  ['Prob 3', '3', '6', '9', '12', '15'],
                  ['Prob 2', '2', '4', '6', '8', '10'],
                  ['Prob 1', '1', '2', '3', '4', '5'],
                ]}
              />

              <h3 id="niveis-classificacao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Níveis de Classificação</h3>
              <DocTable 
                headers={['Nível', 'Score', 'Ação Recomendada']}
                rows={[
                  ['Baixo', '0-2', 'Monitoramento padrão'],
                  ['Médio', '3-5', 'Acompanhamento periódico'],
                  ['Alto', '6-9', 'Priorizar ações de mitigação'],
                  ['Crítico', '≥10', 'Ação imediata requerida'],
                ]}
              />
              <DocTip variant="warning" title="Riscos Críticos">
                Riscos com score ≥10 geram notificações automáticas para administradores e aparecem em destaque no dashboard.
              </DocTip>
            </DocumentationSection>

          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
