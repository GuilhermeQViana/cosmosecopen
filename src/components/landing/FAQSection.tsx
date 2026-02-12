import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'O que é a CosmoSec?',
    answer: 'A CosmoSec é uma plataforma completa de Governança, Risco e Conformidade (GRC) que integra gestão de frameworks, políticas de segurança, avaliação de riscos de terceiros (VRM) e relatórios automatizados em uma única solução. Permite diagnosticar controles, gerenciar riscos, armazenar evidências, criar e aprovar políticas, e gerar planos de ação com IA.',
  },
  {
    question: 'Quais frameworks são suportados?',
    answer: 'Atualmente oferecemos NIST Cybersecurity Framework 2.0, ISO 27001:2022 e BCB/CMN 4.893. Além disso, você pode criar frameworks personalizados do zero ou importar controles via arquivo CSV.',
  },
  {
    question: 'O que é o módulo VRM?',
    answer: 'O módulo de Vendor Risk Management (VRM) oferece o ciclo completo de gestão de terceiros: Due Diligence, 45+ requisitos de avaliação em 4 domínios, SLA Tracking, gestão de contratos, portal de fornecedores, registro de incidentes, pipeline visual e wizard de offboarding.',
  },
  {
    question: 'Como funciona o módulo de Gestão de Políticas?',
    answer: 'O módulo inclui editor rich-text com geração por IA, fluxos de aprovação multi-nível, campanhas de aceite com rastreamento de aderência, templates reutilizáveis, versionamento completo com histórico e exportação para PDF. Todo o ciclo de vida da política é gerenciado em um único lugar.',
  },
  {
    question: 'Quais relatórios posso gerar?',
    answer: 'A plataforma oferece 6 tipos de relatórios automatizados: Conformidade, Riscos, Evidências, Planos de Ação, Executivo e Gap Analysis. Todos podem ser exportados em PDF/HTML e, para consultorias, incluem branding personalizado.',
  },
  {
    question: 'Como funciona a contratação?',
    answer: 'Para contratar, basta entrar em contato conosco através do formulário na página ou por email. Nossa equipe comercial irá agendar uma demonstração personalizada e apresentar a proposta ideal para sua organização.',
  },
  {
    question: 'Os dados estão seguros?',
    answer: 'Absolutamente. Utilizamos criptografia de ponta a ponta, políticas de segurança em nível de linha (RLS), autenticação segura e trilha de auditoria completa. Todos os dados são armazenados em infraestrutura cloud certificada com backups automáticos.',
  },
  {
    question: 'Quanto tempo leva a implantação?',
    answer: 'O tempo de implantação varia conforme a complexidade da organização. Em geral, a configuração inicial leva de 1 a 2 semanas, incluindo treinamento da equipe e importação de dados existentes. Nossa equipe de Customer Success acompanha todo o processo.',
  },
  {
    question: 'A CosmoSec funciona para consultorias e auditores externos?',
    answer: 'Sim. A plataforma permite gerenciar múltiplas organizações em um único painel, ideal para consultores que atendem vários clientes. Você pode padronizar diagnósticos, gerar relatórios com a identidade da sua consultoria, reutilizar templates de políticas e manter trilha de auditoria separada por cliente.',
  },
  {
    question: 'Existe um programa de parceiros?',
    answer: 'Sim. Consultores, auditores e empresas de tecnologia podem se cadastrar no nosso programa de parceiros para obter condições comerciais especiais, suporte prioritário, materiais de co-marketing e acesso antecipado a novos recursos. Entre em contato pelo formulário para saber mais.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Perguntas Frequentes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight font-space">
            Tire suas{' '}
            <span className="text-gradient-cosmic">dúvidas</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Encontre respostas rápidas sobre a plataforma e nossos módulos.
          </p>
        </div>

        {/* FAQ Accordion - Single Column */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-primary/20 dark:border-primary/30 rounded-xl px-6 data-[state=open]:border-secondary/40"
              >
                <AccordionTrigger className="text-left hover:text-primary hover:no-underline py-5 text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-2">
            Não encontrou o que procurava?
          </p>
          <a 
            href="#contact" 
            className="text-primary hover:text-secondary font-medium transition-colors"
          >
            Fale com nossa equipe →
          </a>
        </div>
      </div>
    </section>
  );
}
