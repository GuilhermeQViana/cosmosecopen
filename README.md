# 🛡️ CosmoSec — Plataforma GRC Open Source

Plataforma completa de **Governança, Riscos e Compliance (GRC)** para organizações que levam cibersegurança a sério. Construída com React, TypeScript, Tailwind CSS e Supabase.

---

## 📋 Funcionalidades

### Módulo GRC (Frameworks)
- Diagnóstico de conformidade com **NIST CSF 2.0**, **ISO 27001:2022** e **BCB/CMN 4.893**
- Frameworks customizados com controles personalizados
- Maturidade por controle (0-5) com metas e gap analysis
- Matriz de riscos 5×5 com histórico e tratamento
- Planos de ação com IA (geração automática)
- Cofre de evidências classificadas
- Mapeamento cross-framework
- Relatórios executivos em HTML

### Módulo VRM (Gestão de Fornecedores)
- Cadastro completo de fornecedores com ciclo de vida
- Avaliação por domínios (Segurança, Cyber, Privacidade, Continuidade)
- Due diligence com checklist configurável
- Gestão de contratos, SLAs e incidentes
- Portal de qualificação para fornecedores
- Análise de risco com IA
- Offboarding estruturado

### Central de Políticas
- Editor rich-text para políticas corporativas
- Workflows de aprovação multi-nível
- Versionamento automático
- Campanhas de aceite com rastreamento
- Templates pré-definidos
- Vinculação a controles e riscos

### Recursos Gerais
- Multi-organização com convites por e-mail
- Roles: Admin, Auditor, Analyst
- Notificações em tempo real
- Trilha de auditoria completa
- Dashboard com métricas e gráficos
- Tema escuro/claro
- IA integrada (opcional)

---

## 🛠️ Pré-requisitos

- **Node.js** 18+ (recomendado: 20 LTS)
- **npm** ou **bun**
- **Docker** e **Docker Compose** (opcional, para deploy containerizado)
- **Conta Supabase** gratuita em [supabase.com](https://supabase.com)

---

## 🚀 Setup Rápido (Desenvolvimento)

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/cosmosec.git
cd cosmosec
```

### 2. Configurar o Supabase

1. Crie um novo projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo do arquivo `supabase/schema.sql`
3. Copie a **URL** e a **anon key** do projeto (Settings → API)

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
```

### 4. Instalar dependências e rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador.

### 5. Criar seu primeiro super admin

Após cadastrar-se na aplicação, execute no SQL Editor do Supabase:

```sql
INSERT INTO public.super_admins (user_id)
SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com';
```

---

## 🐳 Setup com Docker

### 1. Configurar `.env`

```bash
cp .env.example .env
# Editar com suas credenciais do Supabase
```

### 2. Build e execução

```bash
docker-compose up --build
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 📦 Build para Produção

```bash
npm run build
```

A pasta `dist/` contém os arquivos estáticos prontos para deploy. Sirva com qualquer servidor web (Nginx, Apache, Caddy, Vercel, Netlify, etc.).

Para servir localmente:

```bash
npx serve dist -s -l 3000
```

---

## ⚙️ Configurações Opcionais

Configure estas variáveis como **Supabase Secrets** (Dashboard → Settings → Edge Functions → Secrets):

| Variável | Descrição |
|----------|-----------|
| `AI_API_KEY` | Chave de API compatível com OpenAI (GPT, Gemini, etc.) |
| `AI_BASE_URL` | Endpoint da API de IA (ex: `https://api.openai.com/v1/chat/completions`) |
| `RESEND_API_KEY` | Chave do [Resend](https://resend.com) para envio de e-mails |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe (se quiser monetizar) |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook do Stripe |
| `ALLOWED_ORIGINS` | Origens CORS permitidas (comma-separated) |

---

## 🏗️ Arquitetura

```
Frontend (React + Vite)
    ↕ Supabase JS Client
Backend (Supabase)
    ├── PostgreSQL (banco de dados + RLS)
    ├── Auth (autenticação + OAuth)
    ├── Edge Functions (lógica de negócio)
    └── Storage (arquivos e evidências)
```

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, shadcn/ui, Recharts
- **Backend:** Supabase (PostgreSQL 15 + Row Level Security)
- **IA:** Qualquer API compatível com OpenAI (configurável)
- **E-mail:** Resend (opcional)
- **Pagamentos:** Stripe (opcional)

---

## 📁 Estrutura do Projeto

```
cosmosec/
├── public/                    # Assets estáticos
├── src/
│   ├── components/           # Componentes React
│   │   ├── dashboard/        # Widgets do dashboard
│   │   ├── diagnostico/      # Módulo de diagnóstico
│   │   ├── fornecedores/     # Módulo VRM
│   │   ├── politicas/        # Central de políticas
│   │   ├── riscos/           # Gestão de riscos
│   │   ├── layout/           # Layout e navegação
│   │   └── ui/               # Componentes base (shadcn)
│   ├── contexts/             # React Contexts (Auth, Org, Framework)
│   ├── hooks/                # Custom hooks
│   ├── pages/                # Páginas da aplicação
│   ├── lib/                  # Utilitários
│   └── integrations/         # Integrações (Supabase)
├── supabase/
│   ├── functions/            # Edge Functions (Deno)
│   ├── migrations/           # Migrações SQL incrementais
│   └── schema.sql            # Schema consolidado
├── .env.example              # Template de variáveis
├── Dockerfile                # Build containerizado
├── docker-compose.yml        # Orquestração Docker
└── nginx.conf                # Configuração Nginx
```

---

## ⚡ Edge Functions

| Função | Descrição |
|--------|-----------|
| `generate-action-plan` | Gera planos de ação com IA |
| `generate-bulk-action-plans` | Geração em lote de planos |
| `generate-policy` | Gera conteúdo de políticas com IA |
| `generate-report` | Gera relatórios executivos em HTML |
| `generate-implementation-guide` | Guia de implementação por controle |
| `send-invite-email` | Envia convites por e-mail |
| `send-deadline-notifications` | Notificações de prazos |
| `notify-new-signup` | Notifica admins sobre novos cadastros |
| `send-contact-notification` | Notifica sobre contatos comerciais |
| `export-data` | Exportação de dados (Excel/CSV) |
| `import-data` | Importação de dados |
| `generate-vendor-report` | Relatório de fornecedores |
| `vendor-risk-analysis` | Análise de risco de fornecedor com IA |
| `classify-vendor-criticality` | Classificação automática de criticidade |
| `analyze-vendor-incident` | Análise de incidentes com IA |
| `assist-due-diligence` | Assistente de due diligence com IA |
| `generate-vendor-action-plans` | Planos de ação para fornecedores |
| `vendor-qualification-portal` | Portal de qualificação público |
| `export-qualification-template` | Exporta template de qualificação |
| `import-qualification-responses` | Importa respostas de qualificação |
| `create-checkout` | Checkout Stripe (opcional) |
| `check-subscription` | Verifica assinatura (opcional) |
| `stripe-webhook` | Webhook Stripe (opcional) |
| `customer-portal` | Portal do cliente Stripe (opcional) |
| `list-invoices` | Lista faturas Stripe (opcional) |
| `export-policy-pdf` | Exporta política em PDF |

---

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes sobre como contribuir.

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).

---

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) — Backend open source
- [shadcn/ui](https://ui.shadcn.com) — Componentes UI
- [Tailwind CSS](https://tailwindcss.com) — Framework CSS
- [Recharts](https://recharts.org) — Gráficos React
- [Lucide](https://lucide.dev) — Ícones
