

# Plano: Transformar Landing Page em Pagina Open Source

## Visao Geral

Redesenhar completamente a landing page para apresentar o CosmoSec como uma ferramenta open source, focando em: o que e a ferramenta, como baixar/instalar, como configurar e contribuir.

---

## Estrutura da Nova Landing Page

A pagina tera as seguintes secoes, nesta ordem:

### 1. Hero Section (reescrever)
- Titulo: enfatizar que e **open source e gratuito**
- Subtitulo: "Plataforma GRC completa para governanca de seguranca da informacao"
- Dois CTAs principais:
  - **"Baixar no GitHub"** (botao primario, link para repositorio)
  - **"Ver Documentacao"** (botao secundario, ancora para secao de setup)
- Badge "MIT License" e "Open Source" visiveis
- Manter a ilustracao orbital existente (e bonita e relevante)

### 2. Platform Section (manter, ajustar textos)
- Manter os 4 cards de modulos (GRC, VRM, Politicas, IA) -- sao o coracao da ferramenta
- Ajustar apenas o header: remover mencao a "consultoria" e focar em "o que voce pode fazer com a ferramenta"

### 3. Nova Secao: "Como Comecar" (substituir AudienceSection)
- Guia passo a passo visual com 5 etapas:
  1. **Clonar o repositorio** -- comando git clone
  2. **Criar projeto Supabase** -- link para supabase.com, explicacao breve
  3. **Executar o schema SQL** -- indicar o arquivo `supabase/schema.sql`
  4. **Configurar `.env`** -- mostrar as variaveis obrigatorias
  5. **Rodar o projeto** -- `npm install && npm run dev`
- Alternativa Docker destacada em card separado
- Cada passo com icone, titulo, descricao e bloco de codigo copiavel

### 4. Nova Secao: "Requisitos e Stack Tecnologica" (substituir ROICalculatorSection)
- Grid visual mostrando:
  - **Pre-requisitos**: Node.js 18+, npm/bun, conta Supabase
  - **Stack Frontend**: React 18, TypeScript, Tailwind CSS, Vite, shadcn/ui
  - **Stack Backend**: Supabase (PostgreSQL + Auth + Edge Functions + Storage)
  - **Opcionais**: IA (qualquer API OpenAI-compativel), Resend (emails), Stripe (pagamentos), Docker
- Tabela de **Edge Functions** disponiveis com descricao curta (dados ja existem no README)
- Tabela de **variaveis de ambiente** opcionais

### 5. Nova Secao: "Configuracoes Opcionais" (nova)
- Cards para cada integracao opcional:
  - **IA Generativa**: como configurar AI_API_KEY e AI_BASE_URL
  - **Envio de E-mails**: como configurar RESEND_API_KEY
  - **Pagamentos (Stripe)**: como configurar STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID
  - **CORS personalizado**: ALLOWED_ORIGINS
  - **Branding**: como trocar logo, cores, nome da empresa (apontar para constants.ts e tailwind.config.ts)
- Cada card com icone, descricao e exemplo de configuracao

### 6. Trust Section (manter, ajustar)
- Manter os badges de frameworks suportados
- Manter as metricas animadas (sao dados da ferramenta, nao comerciais)
- Ajustar a quote para algo como: "Governanca de seguranca acessivel para todas as organizacoes"

### 7. FAQ Section (reescrever conteudo)
- Novas perguntas focadas em open source:
  - "A ferramenta e realmente gratuita?"
  - "Preciso de conta Supabase paga?"
  - "Posso usar em producao?"
  - "Como atualizo para novas versoes?"
  - "Posso customizar os frameworks?"
  - "Quais frameworks ja vem incluidos?"
  - "Como funciona a IA?"
  - "Como contribuir?"
  - "Qual a licenca?"
  - "Posso usar para minha empresa/consultoria?"

### 8. Nova Secao: "Contribua" (substituir CTASection)
- Card principal com link para GitHub (Issues, PRs)
- Convencoes de commit (Conventional Commits)
- Link para CONTRIBUTING.md
- Badges: stars, forks, license
- Canais de contato da comunidade

### 9. Footer (ajustar)
- Links atualizados:
  - Produto: Plataforma, Recursos, Documentacao
  - Comunidade: GitHub, Contribuir, Issues
  - Legal: Licenca MIT, Termos, Privacidade
- Remover links comerciais (consultoria, contato comercial)

### 10. Navbar (ajustar)
- Links: Plataforma, Como Comecar, Recursos, FAQ
- CTAs: "GitHub" (icone) + "Comecar Agora" (ancora para secao de setup)
- Remover "Falar com Especialista"

---

## Arquivos Modificados

| Arquivo | Acao |
|---------|------|
| `src/pages/Landing.tsx` | Atualizar composicao das secoes |
| `src/components/landing/Navbar.tsx` | Novos links e CTAs |
| `src/components/landing/HeroSection.tsx` | Reescrever para open source |
| `src/components/landing/PlatformSection.tsx` | Ajustar header |
| `src/components/landing/TrustSection.tsx` | Ajustar quote |
| `src/components/landing/AudienceSection.tsx` | Reescrever como "Como Comecar" |
| `src/components/landing/ROICalculatorSection.tsx` | Reescrever como "Stack e Requisitos" |
| `src/components/landing/CTASection.tsx` | Reescrever como secao "Contribua" |
| `src/components/landing/FAQSection.tsx` | Novas perguntas open source |
| `src/components/landing/Footer.tsx` | Ajustar links |
| **Novo:** `src/components/landing/OptionalConfigSection.tsx` | Secao de configuracoes opcionais |

---

## Detalhes Tecnicos

- Nenhuma nova dependencia necessaria
- Todos os dados para a pagina de setup ja existem no README.md -- serao convertidos em componentes visuais
- Os componentes reutilizam os mesmos padroes visuais (cards com glassmorphism, gradients cosmicos, badges)
- Blocos de codigo usarao `<pre><code>` com estilo consistente com o tema
- Links para GitHub usarao a constante `APP_DOMAIN` de `src/lib/constants.ts` (ou nova constante `GITHUB_URL`)
- Nova constante `GITHUB_URL` adicionada em `src/lib/constants.ts`

### Ordem de Execucao

1. Adicionar `GITHUB_URL` em `src/lib/constants.ts`
2. Reescrever `HeroSection.tsx`
3. Ajustar `PlatformSection.tsx` (apenas header)
4. Reescrever `AudienceSection.tsx` como "Como Comecar"
5. Reescrever `ROICalculatorSection.tsx` como "Stack e Requisitos"
6. Criar `OptionalConfigSection.tsx`
7. Ajustar `TrustSection.tsx`
8. Reescrever `CTASection.tsx` como "Contribua"
9. Reescrever `FAQSection.tsx`
10. Atualizar `Navbar.tsx`
11. Atualizar `Footer.tsx`
12. Atualizar `Landing.tsx` (composicao final)

