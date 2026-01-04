import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: 'Plataforma',
    questions: [
      {
        question: 'O que é a CosmoSec?',
        answer: 'A CosmoSec é uma plataforma completa de Governança, Risco e Conformidade (GRC) que integra gestão de frameworks de segurança e avaliação de riscos de terceiros (VRM) em uma única solução. Permite diagnosticar controles, gerenciar riscos, armazenar evidências e criar planos de ação automatizados com IA.',
      },
      {
        question: 'Como funciona o período de teste gratuito?',
        answer: 'Oferecemos 7 dias de teste gratuito com acesso completo a todas as funcionalidades Pro, incluindo ambos os módulos (GRC e VRM), frameworks ilimitados, fornecedores ilimitados e suporte prioritário. Não é necessário cartão de crédito para começar.',
      },
      {
        question: 'Posso gerenciar múltiplas organizações?',
        answer: 'Sim! A plataforma suporta múltiplas organizações com workspaces isolados. Você pode alternar entre organizações facilmente e cada uma mantém seus próprios dados, frameworks, riscos e fornecedores completamente separados.',
      },
      {
        question: 'Os dados estão seguros?',
        answer: 'Absolutamente. Utilizamos criptografia de ponta a ponta, políticas de segurança em nível de linha (RLS), autenticação segura e trilha de auditoria completa. Todos os dados são armazenados em infraestrutura cloud certificada com backups automáticos.',
      },
    ],
  },
  {
    category: 'Frameworks',
    questions: [
      {
        question: 'Quais frameworks estão disponíveis?',
        answer: 'Atualmente oferecemos NIST Cybersecurity Framework 2.0, ISO 27001:2022 e BCB/CMN 4.893. Além disso, você pode criar frameworks personalizados do zero ou importar controles via arquivo CSV.',
      },
      {
        question: 'Posso criar meu próprio framework?',
        answer: 'Sim! Com a funcionalidade de Frameworks Customizados, você pode criar frameworks personalizados para atender requisitos específicos da sua organização. É possível definir controles, categorias, pesos e criticidade de cada item.',
      },
      {
        question: 'Como funciona o mapeamento entre frameworks?',
        answer: 'O módulo de Mapeamento permite visualizar correspondências entre controles de diferentes frameworks. Por exemplo, você pode ver como um controle do NIST se relaciona com requisitos da ISO 27001, facilitando auditorias multi-framework.',
      },
      {
        question: 'O que é o Risk Score automático?',
        answer: 'O Risk Score é calculado automaticamente com base no nível de maturidade, criticidade e peso de cada controle. Controles não conformes com alta criticidade aumentam significativamente o score de risco, ajudando a priorizar ações corretivas.',
      },
    ],
  },
  {
    category: 'Gestão de Fornecedores (VRM)',
    questions: [
      {
        question: 'O que é o módulo VRM?',
        answer: 'O módulo de Vendor Risk Management (VRM) permite avaliar e monitorar riscos de segurança de terceiros e fornecedores. Inclui 45 requisitos padrão divididos em 4 domínios: Segurança da Informação, Cyber Security, Privacidade (LGPD) e Continuidade de Negócios.',
      },
      {
        question: 'Como funciona a avaliação de fornecedores?',
        answer: 'Você cadastra o fornecedor, inicia uma avaliação e responde aos requisitos de cada domínio. O sistema calcula automaticamente um score de conformidade ponderado e classifica o nível de risco (Baixo, Médio, Alto ou Crítico).',
      },
      {
        question: 'Posso customizar os requisitos de avaliação?',
        answer: 'Sim! Além dos 45 requisitos padrão, você pode criar requisitos personalizados para cada domínio, definindo nome, descrição, peso e exemplos de evidência esperados.',
      },
      {
        question: 'O que é o workflow de aprovação?',
        answer: 'Após concluir uma avaliação, ela pode passar por um fluxo de aprovação onde um gestor revisa os resultados antes de finalizar. Isso garante uma segunda verificação e permite adicionar observações ou solicitar correções.',
      },
      {
        question: 'Como funciona a agenda de reavaliação?',
        answer: 'Com base na criticidade do fornecedor (Crítico, Alto, Médio, Baixo), o sistema sugere automaticamente a próxima data de reavaliação. Fornecedores críticos são reavaliados trimestralmente, enquanto os de baixa criticidade podem ser anuais.',
      },
    ],
  },
  {
    category: 'Recursos Avançados',
    questions: [
      {
        question: 'Como funcionam os planos de ação com IA?',
        answer: 'Nossa IA analisa controles não conformes e gera automaticamente planos de ação detalhados com título, descrição, tarefas, prioridade sugerida e prazo estimado. Você pode gerar planos individuais ou em lote para múltiplos controles.',
      },
      {
        question: 'Posso exportar relatórios em PDF?',
        answer: 'Sim! Tanto o módulo de GRC quanto o VRM permitem gerar relatórios executivos em PDF. Os relatórios incluem gráficos, métricas, status de conformidade e podem ser customizados para apresentações a stakeholders.',
      },
      {
        question: 'Como funciona a trilha de auditoria?',
        answer: 'Todas as ações importantes são registradas automaticamente: alterações em controles, riscos, avaliações, uploads de evidências, etc. A trilha mostra quem fez o quê, quando e em qual entidade, facilitando auditorias externas.',
      },
      {
        question: 'Existe integração com outras ferramentas?',
        answer: 'Atualmente oferecemos exportação de dados em formatos padrão e API para integrações customizadas. Estamos constantemente expandindo nossas integrações com ferramentas populares de segurança e gestão.',
      },
    ],
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Perguntas Frequentes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Tire suas{' '}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              dúvidas
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encontre respostas para as perguntas mais comuns sobre a plataforma, 
            frameworks suportados e módulo de gestão de fornecedores.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {faqs.map((category) => (
            <div 
              key={category.category}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {category.category}
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`${category.category}-${index}`}
                    className="border-border/30 data-[state=open]:border-primary/30"
                  >
                    <AccordionTrigger className="text-left text-sm hover:text-primary hover:no-underline py-3">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Não encontrou o que procurava?
          </p>
          <a 
            href="/documentacao" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Consulte nossa documentação completa →
          </a>
        </div>
      </div>
    </section>
  );
}
