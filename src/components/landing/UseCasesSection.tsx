import { 
  Shield, 
  UserCheck, 
  Building2, 
  FileSearch, 
  Users,
  Target,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const personas = [
  {
    icon: Shield,
    role: 'CISO / Diretor de Segurança',
    company: 'Empresas de médio e grande porte',
    description: 'Responsável pela estratégia de segurança da informação e reporte ao board executivo.',
    painPoints: [
      'Dificuldade em consolidar métricas de conformidade',
      'Falta de visibilidade sobre riscos críticos',
      'Preparação manual para auditorias'
    ],
    benefits: [
      'Dashboard executivo com score de maturidade',
      'Alertas automáticos de riscos prioritários',
      'Relatórios PDF prontos para o board'
    ],
    gradient: 'from-primary/20 to-secondary/20'
  },
  {
    icon: UserCheck,
    role: 'Compliance Officer / DPO',
    company: 'Instituições reguladas (Financeiro, Saúde)',
    description: 'Garante aderência a normas regulatórias como LGPD, BCB e ISO 27001.',
    painPoints: [
      'Múltiplos frameworks para gerenciar simultaneamente',
      'Controles repetidos entre normas diferentes',
      'Evidências espalhadas em vários sistemas'
    ],
    benefits: [
      'Mapeamento automático entre frameworks',
      'Cofre centralizado de evidências',
      'Trilha de auditoria completa'
    ],
    gradient: 'from-secondary/20 to-accent/20'
  },
  {
    icon: FileSearch,
    role: 'Analista de Segurança / GRC',
    company: 'Equipes de Segurança da Informação',
    description: 'Executa avaliações de controles e gerencia planos de ação no dia a dia.',
    painPoints: [
      'Planilhas manuais para controle de maturidade',
      'Dificuldade em priorizar remediações',
      'Tempo excessivo em tarefas repetitivas'
    ],
    benefits: [
      'Interface intuitiva para diagnóstico',
      'IA que sugere planos de ação',
      'Kanban para gestão de tarefas'
    ],
    gradient: 'from-accent/20 to-primary/20'
  },
  {
    icon: Building2,
    role: 'Gestor de Fornecedores',
    company: 'Empresas com cadeia de suprimentos crítica',
    description: 'Avalia e monitora riscos de terceiros e parceiros estratégicos.',
    painPoints: [
      'Avaliações de fornecedores em Excel',
      'Falta de padronização nos questionários',
      'Dificuldade em comparar fornecedores'
    ],
    benefits: [
      'Módulo VRM com 45+ requisitos prontos',
      'Heat map de riscos de terceiros',
      'Histórico de avaliações por fornecedor'
    ],
    gradient: 'from-primary/20 to-accent/20'
  }
];

const useCases = [
  {
    title: 'Implementação de ISO 27001',
    description: 'Empresa de tecnologia precisa certificar-se em ISO 27001 para atender requisitos de clientes enterprise.',
    steps: [
      'Diagnóstico inicial de 114 controles',
      'Identificação de gaps e maturidade atual',
      'Geração automática de planos de ação',
      'Coleta e organização de evidências',
      'Acompanhamento até a certificação'
    ],
    result: 'Certificação obtida em 6 meses com 40% menos esforço manual'
  },
  {
    title: 'Adequação ao BCB 4893',
    description: 'Fintech precisa demonstrar conformidade com a resolução de segurança cibernética do Banco Central.',
    steps: [
      'Mapeamento dos 8 domínios da resolução',
      'Avaliação de maturidade por controle',
      'Vinculação de políticas e procedimentos',
      'Relatórios para envio ao regulador',
      'Monitoramento contínuo de gaps'
    ],
    result: 'Conformidade demonstrada em auditoria sem ressalvas'
  },
  {
    title: 'Gestão de Riscos de Fornecedores',
    description: 'Banco precisa avaliar e monitorar mais de 50 fornecedores críticos de TI.',
    steps: [
      'Cadastro e classificação por criticidade',
      'Envio de questionários padronizados',
      'Análise de respostas e evidências',
      'Score de risco automático',
      'Planos de remediação por fornecedor'
    ],
    result: 'Redução de 60% no tempo de avaliação de terceiros'
  }
];

export function UseCasesSection() {
  const scrollToContact = () => {
    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="casos-de-uso" className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div 
        className="absolute top-0 left-1/4 w-[500px] h-[500px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.4), transparent 60%)',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-secondary/30 dark:border-secondary/50 text-secondary">
            <Users className="w-3 h-3 mr-1" />
            Casos de Uso
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-space">
            Quem usa a <span className="text-gradient-cosmic">CosmoSec</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conheça os perfis que mais se beneficiam da plataforma e como resolvemos seus desafios do dia a dia.
          </p>
        </div>

        {/* Personas Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {personas.map((persona, index) => (
            <Card 
              key={index}
              className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 group overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${persona.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <persona.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{persona.role}</h3>
                    <p className="text-sm text-muted-foreground">{persona.company}</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4 text-sm">
                  {persona.description}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Pain Points */}
                  <div>
                    <h4 className="text-xs font-medium text-destructive/80 uppercase tracking-wide mb-2">
                      Desafios Atuais
                    </h4>
                    <ul className="space-y-1.5">
                      {persona.painPoints.map((point, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive/60 mt-0.5">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Benefits */}
                  <div>
                    <h4 className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
                      Com a CosmoSec
                    </h4>
                    <ul className="space-y-1.5">
                      {persona.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Use Cases */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 border-primary/30 dark:border-primary/50 text-primary">
              <Target className="w-3 h-3 mr-1" />
              Cenários Reais
            </Badge>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground font-space">
              Casos de sucesso
            </h3>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <Card 
                key={index}
                className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-primary/10 hover:border-secondary/30 transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-bold mb-3">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-foreground text-lg mb-2">{useCase.title}</h4>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Jornada na Plataforma
                    </h5>
                    <ol className="space-y-2">
                      {useCase.steps.map((step, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                            {idx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-4 border-t border-primary/10">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium text-secondary">{useCase.result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Identificou-se com algum desses cenários?
          </p>
          <Button variant="cosmic" size="lg" onClick={scrollToContact} className="group">
            Falar com Especialista
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
