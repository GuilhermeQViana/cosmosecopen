

## Atualizar Termos de Uso - Modelo Consultivo com Contrato

### Contexto

A estrategia comercial migrou de autoatendimento (trial + assinatura mensal) para um modelo consultivo (demonstracao + contrato). Os Termos de Uso ainda mencionam "periodo de teste gratuito de 7 dias" e "assinatura cobrada mensalmente", o que nao reflete mais a realidade.

### Mudancas no arquivo `src/pages/TermosDeUso.tsx`

**1. Secao 1 - Aceitacao dos Termos**
- Adicionar referencia a formalizacao via contrato: "Ao assinar o contrato de prestacao de servicos e/ou acessar a plataforma..."

**2. Secao 3 - Elegibilidade**
- Adicionar item: "Passou pelo processo de demonstracao e formalizou a contratacao"

**3. Secao 7 - Renomear de "Pagamentos e Assinatura" para "Contratacao e Pagamentos"**
- Remover mencao a "periodo de teste gratuito de 7 dias"
- Remover "assinatura cobrada mensalmente via cartao de credito"
- Novo conteudo refletindo modelo contratual:
  - Acesso condicionado a formalizacao de contrato de prestacao de servicos
  - Planos mensais ou anuais conforme proposta comercial
  - Valores e condicoes definidos em proposta comercial individualizada
  - Pagamento via boleto, Pix ou cartao de credito
  - Renovacao automatica salvo manifestacao contraria com 30 dias de antecedencia
  - Rescisao conforme clausulas do contrato firmado

**4. Secao 6 - Propriedade Intelectual**
- Adicionar clausula sobre conteudo gerado por IA: "Conteudos gerados pelas funcionalidades de IA da plataforma (politicas, planos de acao, relatorios) sao de propriedade do cliente, cabendo ao CosmoSec apenas o papel de ferramenta facilitadora."

**5. Secao 8 - Disponibilidade (adicionar SLA)**
- Adicionar referencia a SLA contratual: "Niveis de servico (SLA) especificos podem ser definidos em contrato."

**6. Secao 9 - Limitacao de Responsabilidade**
- Reforcar que IA e ferramenta de apoio: "Os conteudos gerados por inteligencia artificial sao sugestoes e devem ser revisados por profissionais qualificados antes de sua adocao."

**7. Nova Secao - "Confidencialidade e Protecao de Dados" (antes da secao de Lei Aplicavel)**
- Referencia cruzada com a Politica de Privacidade (/privacidade) e LGPD (/lgpd)
- Compromisso de confidencialidade sobre dados inseridos na plataforma
- Tratamento de dados conforme LGPD

### Resultado

Os Termos de Uso passarao a refletir o modelo comercial consultivo baseado em contrato, sem mencoes a trial ou autoatendimento, e com clausulas adequadas para IA generativa e protecao de dados.
