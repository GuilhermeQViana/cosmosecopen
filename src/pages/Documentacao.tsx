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
  Layers
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
            
            {/* Primeiros Passos */}
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
                Clique em "Começar Agora" na página inicial ou acesse diretamente /auth.
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
                A CosmoSec oferece dois módulos principais:
              </p>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <DocFeature 
                  icon={Shield}
                  title="GRC Frameworks"
                  description="Gestão de conformidade com frameworks como NIST CSF, ISO 27001 e BCB/CMN."
                />
                <DocFeature 
                  icon={Building2}
                  title="VRM (Fornecedores)"
                  description="Gestão de riscos de terceiros com avaliações e monitoramento contínuo."
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
            </DocumentationSection>

            {/* Módulo GRC */}
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
                Use os filtros de período para comparar métricas ao longo do tempo e identificar tendências.
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
                <DocFeature icon={Upload} title="Upload de Arquivos" description="Arraste ou selecione arquivos para upload seguro." />
                <DocFeature icon={Layers} title="Organização em Pastas" description="Crie estrutura de pastas para categorizar evidências." />
              </div>

              <h3 id="plano-acao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Plano de Ação</h3>
              <p className="text-muted-foreground mb-4">
                Gerencie ações de remediação e melhorias:
              </p>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <DocFeature icon={Kanban} title="Visualização Kanban" description="Arraste cards entre colunas de status." />
                <DocFeature icon={Calendar} title="Visualização Calendário" description="Veja prazos em formato de calendário mensal." />
              </div>
              <DocTip variant="tip">
                Use a geração automática com IA para criar planos de ação a partir de gaps identificados.
              </DocTip>

              <h3 id="relatorios" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Relatórios</h3>
              <p className="text-muted-foreground mb-4">
                Gere relatórios executivos e detalhados para stakeholders.
              </p>

              <h3 id="mapeamento-frameworks" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Mapeamento de Frameworks</h3>
              <p className="text-muted-foreground mb-4">
                Crie equivalências entre controles de diferentes frameworks para reutilizar avaliações.
              </p>

              <h3 id="auditoria-logs" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Auditoria de Logs</h3>
              <p className="text-muted-foreground mb-4">
                Rastreie todas as ações realizadas na plataforma para fins de auditoria e compliance.
              </p>
            </DocumentationSection>

            {/* Módulo VRM */}
            <DocumentationSection
              id="modulo-vrm"
              title="Módulo VRM (Gestão de Fornecedores)"
              description="Avalie e monitore riscos de terceiros"
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

              <h3 id="requisitos-customizados" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Requisitos Customizados</h3>
              <p className="text-muted-foreground mb-4">
                Crie requisitos específicos para sua organização além dos padrões.
              </p>

              <h3 id="agenda-reavaliacao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Agenda de Reavaliação</h3>
              <p className="text-muted-foreground mb-4">
                Programe reavaliações periódicas baseadas na criticidade do fornecedor.
              </p>

              <h3 id="planos-acao-vrm" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Planos de Ação VRM</h3>
              <p className="text-muted-foreground mb-4">
                Crie ações de mitigação específicas para gaps identificados em fornecedores.
              </p>
            </DocumentationSection>

            {/* Equipe e Colaboração */}
            <DocumentationSection
              id="equipe-colaboracao"
              title="Equipe e Colaboração"
              description="Trabalhe em equipe com controle de acesso"
            >
              <h3 id="gestao-equipe" className="text-lg font-semibold mb-4 scroll-mt-24">Gestão de Equipe</h3>
              <p className="text-muted-foreground mb-4">
                Convide membros e defina permissões:
              </p>
              <DocTable 
                headers={['Papel', 'Permissões']}
                rows={[
                  ['Admin', 'Acesso total: configurações, equipe, exclusão de dados'],
                  ['Auditor', 'Leitura completa, comentários, exportação de relatórios'],
                  ['Analista', 'Edição de avaliações, riscos e planos de ação'],
                ]}
              />

              <h3 id="comentarios-discussoes" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Comentários e Discussões</h3>
              <p className="text-muted-foreground mb-4">
                Colabore em avaliações e controles através de threads de comentários com reações e respostas.
              </p>
            </DocumentationSection>

            {/* Configurações */}
            <DocumentationSection
              id="configuracoes"
              title="Configurações"
              description="Personalize a plataforma"
            >
              <h3 id="perfil-usuario" className="text-lg font-semibold mb-4 scroll-mt-24">Perfil do Usuário</h3>
              <p className="text-muted-foreground mb-4">
                Atualize foto de perfil, nome e altere sua senha.
              </p>

              <h3 id="configuracao-organizacao" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Organização</h3>
              <p className="text-muted-foreground mb-4">
                Configure nome, descrição e logo da organização.
              </p>

              <h3 id="frameworks-customizados" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Frameworks Customizados</h3>
              <p className="text-muted-foreground mb-4">
                Crie frameworks personalizados e importe controles via CSV.
              </p>

              <h3 id="notificacoes" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Notificações</h3>
              <p className="text-muted-foreground mb-4">
                Configure alertas de prazos, riscos críticos e emails.
              </p>

              <h3 id="aparencia" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Aparência</h3>
              <p className="text-muted-foreground mb-4">
                Alterne entre tema claro e escuro. Ajuste a densidade do layout.
              </p>

              <h3 id="backup-dados" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Backup de Dados</h3>
              <p className="text-muted-foreground mb-4">
                Exporte e importe dados da organização em formato JSON.
              </p>
            </DocumentationSection>

            {/* Assinatura e Planos */}
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
                <DocFeature icon={Zap} title="Geração com IA" description="Crie planos de ação automaticamente." />
                <DocFeature icon={FileBarChart} title="Relatórios Avançados" description="Relatórios executivos e comparativos." />
                <DocFeature icon={Users} title="Equipe Ilimitada" description="Convide quantos membros precisar." />
                <DocFeature icon={Lock} title="Suporte Prioritário" description="Atendimento prioritário por email." />
              </div>

              <h3 id="gerenciamento-assinatura" className="text-lg font-semibold mt-8 mb-4 scroll-mt-24">Gerenciamento</h3>
              <p className="text-muted-foreground mb-4">
                Acesse o portal de pagamento para atualizar método de pagamento, ver faturas e gerenciar assinatura.
              </p>
            </DocumentationSection>

            {/* Atalhos de Teclado */}
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
                <DocKeyboardShortcut keys={['Ctrl', 'T']} description="Alternar Tema" />
                <DocKeyboardShortcut keys={['?']} description="Ver todos os atalhos" />
              </div>
            </DocumentationSection>

            {/* Metodologia de Risco */}
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
