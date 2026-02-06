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
    answer: 'A CosmoSec é uma plataforma completa de Governança, Risco e Conformidade (GRC) que integra gestão de frameworks de segurança e avaliação de riscos de terceiros (VRM) em uma única solução. Permite diagnosticar controles, gerenciar riscos, armazenar evidências e criar planos de ação automatizados com IA.',
  },
  {
    question: 'Quais frameworks são suportados?',
    answer: 'Atualmente oferecemos NIST Cybersecurity Framework 2.0, ISO 27001:2022 e BCB/CMN 4.893. Além disso, você pode criar frameworks personalizados do zero ou importar controles via arquivo CSV.',
  },
  {
    question: 'O que é o módulo VRM?',
    answer: 'O módulo de Vendor Risk Management (VRM) permite avaliar e monitorar riscos de segurança de terceiros e fornecedores. Inclui 45 requisitos padrão divididos em 4 domínios: Segurança da Informação, Cyber Security, Privacidade (LGPD) e Continuidade de Negócios.',
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
