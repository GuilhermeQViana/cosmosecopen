import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'A ferramenta é realmente gratuita?',
    answer: 'Sim! O CosmoSec é 100% open source sob licença MIT. Você pode baixar, usar, modificar e distribuir livremente — inclusive para uso comercial. Não há custos de licenciamento.',
  },
  {
    question: 'Preciso de uma conta Supabase paga?',
    answer: 'Não. O plano gratuito do Supabase é suficiente para a maioria dos cenários. Ele inclui banco de dados PostgreSQL, autenticação, storage e Edge Functions. Você só precisará de um plano pago se sua organização crescer significativamente em volume de dados ou usuários.',
  },
  {
    question: 'Posso usar em produção?',
    answer: 'Sim. A plataforma foi projetada para uso em produção com segurança de nível empresarial: Row Level Security (RLS), autenticação robusta, trilha de auditoria e criptografia. Recomendamos usar um plano Supabase Pro para ambientes de produção com dados sensíveis.',
  },
  {
    question: 'Como atualizo para novas versões?',
    answer: 'Como é um repositório Git, basta fazer um git pull para obter as atualizações. Se houver migrações de banco de dados, elas estarão documentadas no CHANGELOG. Para quem usa Docker, basta reconstruir a imagem.',
  },
  {
    question: 'Posso customizar os frameworks?',
    answer: 'Sim! Além dos 3 frameworks incluídos (NIST CSF 2.0, ISO 27001:2022 e BCB/CMN 4.893), você pode criar frameworks completamente personalizados do zero ou importar controles via arquivo CSV.',
  },
  {
    question: 'Quais frameworks já vêm incluídos?',
    answer: 'A plataforma inclui NIST Cybersecurity Framework 2.0, ISO 27001:2022 e BCB/CMN 4.893 pré-configurados com todos os controles, categorias e pesos. Todos podem ser customizados após a instalação.',
  },
  {
    question: 'Como funciona a IA?',
    answer: 'A IA é opcional e funciona com qualquer API compatível com o padrão OpenAI (OpenAI, Azure OpenAI, Ollama, LM Studio, etc.). Basta configurar AI_API_KEY e AI_BASE_URL nas variáveis de ambiente. Sem IA, todas as funcionalidades manuais continuam disponíveis.',
  },
  {
    question: 'Como posso contribuir?',
    answer: 'Contribuições são muito bem-vindas! Leia o arquivo CONTRIBUTING.md no repositório para entender as convenções de código e commit (Conventional Commits). Você pode contribuir reportando bugs, sugerindo features, enviando PRs ou melhorando a documentação.',
  },
  {
    question: 'Qual a licença?',
    answer: 'MIT License — a licença mais permissiva. Você pode usar, copiar, modificar, publicar, distribuir, sublicenciar e até vender cópias do software. A única exigência é manter o aviso de copyright.',
  },
  {
    question: 'Posso usar para minha empresa ou consultoria?',
    answer: 'Absolutamente! A licença MIT permite uso comercial sem restrições. Consultorias podem usar a plataforma para atender múltiplos clientes, e empresas podem implantar internamente para sua equipe de GRC.',
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
            Tudo que você precisa saber para começar a usar o CosmoSec.
          </p>
        </div>

        {/* FAQ Accordion */}
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
            href="#contribute" 
            className="text-primary hover:text-secondary font-medium transition-colors"
          >
            Fale com a comunidade →
          </a>
        </div>
      </div>
    </section>
  );
}
