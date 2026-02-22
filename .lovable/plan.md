#  Plano: Preparacao Open Source Completa do CosmoSec

Este plano cobre os 5 eixos solicitados: parametrizacao de segredos, exportacao do banco, containerizacao Docker, limpeza de dependencias e documentacao tecnica.

---

## 1. Parametrizacao e Seguranca (Variaveis de Ambiente)

### Problemas encontrados


| Local                                         | Problema                                                                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `supabase/functions/_shared/auth.ts`          | URLs hardcoded: `cosmosec.com.br`, `cosmosec.lovable.app` na lista `ALLOWED_ORIGINS`                                       |
| `supabase/functions/customer-portal/index.ts` | Fallback hardcoded: `https://app.lovable.dev`                                                                              |
| 11 Edge Functions de IA                       | URL hardcoded: `https://ai.gateway.lovable.dev/v1/chat/completions`                                                        |
| `supabase/config.toml`                        | `project_id = "tsuzjyejcwbzmsheclsp"` (hardcoded)                                                                          |
| 2 migracoes SQL                               | URL hardcoded `https://tsuzjyejcwbzmsheclsp.supabase.co/functions/v1/notify-new-signup` dentro de funcao `handle_new_user` |
| `src/integrations/lovable/index.ts`           | Dependencia de `@lovable.dev/cloud-auth-js` (proprietario)                                                                 |
| `src/pages/Gateway.tsx`                       | Import de `lovable` para OAuth do Google                                                                                   |


### Acoes

1. `**supabase/functions/_shared/auth.ts**`: Substituir `ALLOWED_ORIGINS` hardcoded por leitura de `Deno.env.get("ALLOWED_ORIGINS")` (comma-separated) com fallback para `*` em dev
2. `**supabase/functions/customer-portal/index.ts**`: Remover fallback `app.lovable.dev`, usar apenas `req.headers.get("origin")`
3. **11 Edge Functions de IA**: Substituir `https://ai.gateway.lovable.dev/v1/chat/completions` por `Deno.env.get("AI_BASE_URL")` e `LOVABLE_API_KEY` por `AI_API_KEY`
4. **Migracao SQL**: Criar nova migracao que atualiza `handle_new_user` para usar `vault.decrypted_secrets` para obter a URL do Supabase em vez de hardcoded
5. `**src/pages/Gateway.tsx**`: Substituir login via `lovable.auth.signInWithOAuth` por `supabase.auth.signInWithOAuth` nativo
6. **Criar `.env.example**` com todas as variaveis necessarias:

```text
# Frontend (obrigatorias)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
VITE_SUPABASE_PROJECT_ID=seu-project-id

# Backend - Supabase Secrets (configurar via Supabase Dashboard > Settings > Secrets)
# SUPABASE_URL (auto-configurado pelo Supabase)
# SUPABASE_ANON_KEY (auto-configurado)
# SUPABASE_SERVICE_ROLE_KEY (auto-configurado)

# Opcionais
# AI_API_KEY=sua-chave-openai-ou-similar
# AI_BASE_URL=https://api.openai.com/v1/chat/completions
# RESEND_API_KEY=sua-chave-resend
# STRIPE_SECRET_KEY=sua-chave-stripe
# STRIPE_WEBHOOK_SECRET=seu-webhook-secret
# ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
```

---

## 2. Exportacao do Banco de Dados e Regras

### Acao

Criar arquivo `**supabase/schema.sql**` contendo um script SQL consolidado com:

- Tipos enum customizados (`app_role`, `maturity_level`, `conformity_status`, `task_priority`, `task_status`)
- Criacao de todas as 30+ tabelas com colunas, defaults e constraints
- Todas as foreign keys
- Todas as politicas RLS (Row Level Security) -- 60+ politicas
- Todas as funcoes do banco (`handle_new_user`, `user_belongs_to_org`, `has_role`, `set_active_organization`, `create_organization_with_admin`, `log_risk_change`, `check_critical_risk_score`, `check_deadline_notifications`, `log_access_event`, `log_table_changes`, `delete_organization`, `leave_organization`, `accept_organization_invite`, etc.)
- Todos os triggers
- Configuracao de storage buckets (evidences, avatars, logos, vendor-evidences, vendor-contracts)
- View `organizations_safe`
- Tabela `super_admins`
- Habilitacao de extensoes (`pg_net`)

O script sera gerado a partir da analise das migracoes existentes (42 arquivos) e do schema atual do banco.

---

## 3. Containerizacao (Docker)

### Arquivos a criar

`**Dockerfile**` (build multi-stage otimizado):

```text
Estagio 1: Build com Node 20 Alpine
- npm ci
- npm run build

Estagio 2: Nginx Alpine para servir arquivos estaticos
- Copiar dist/ para /usr/share/nginx/html
- Configuracao Nginx customizada para SPA (fallback para index.html)
- Expor porta 80
```

`**nginx.conf**`:

- Configurar `try_files $uri $uri/ /index.html` para suporte a SPA routing
- Headers de seguranca (X-Frame-Options, X-Content-Type-Options, CSP)
- Compressao gzip
- Cache de assets estaticos

`**docker-compose.yml**`:

```text
services:
  app:
    build: .
    ports: "3000:80"
    env_file: .env

  # Desenvolvimento local (opcional)
  supabase-db:
    image: supabase/postgres:15
    ports: "5432:5432"
    volumes: persistentes
    environment: POSTGRES_PASSWORD

  supabase-studio:
    image: supabase/studio
    ports: "3001:3000"
```

`**.dockerignore**`:

- node_modules, .git, .env, dist, etc.

---

## 4. Gestao de Dependencias e Scripts

### Alteracoes no `package.json`


| Item                         | Acao                                                 |
| ---------------------------- | ---------------------------------------------------- |
| `@lovable.dev/cloud-auth-js` | Remover (proprietario Lovable)                       |
| `lovable-tagger` (devDep)    | Remover (ferramenta interna Lovable)                 |
| Script `dev`                 | Manter `vite` (ja generico)                          |
| Script `build`               | Manter `vite build` (ja generico)                    |
| Script `preview`             | Manter `vite preview` (ja generico)                  |
| Adicionar script `start`     | `npx serve dist -s -l 3000` para producao sem Docker |


### Alteracoes no `vite.config.ts`

- Remover import de `lovable-tagger` / `componentTagger`
- Manter o resto como esta (ja generico)

### Arquivos a ajustar


| Arquivo                             | Mudanca                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/integrations/lovable/index.ts` | Reescrever para usar `supabase.auth.signInWithOAuth` nativo, removendo dependencia do `@lovable.dev/cloud-auth-js` |
| `src/pages/Gateway.tsx`             | Atualizar import para usar Supabase nativo em vez de `lovable.auth`                                                |


---

## 5. Documentacao Tecnica (README.md)

### Estrutura do novo README

```text
# CosmoSec - Plataforma GRC Open Source

## Sobre o Projeto
Plataforma completa de Governanca, Riscos e Compliance (GRC)
com modulos de Frameworks, Gestao de Fornecedores e Central de Politicas.

## Pre-requisitos
- Node.js 18+
- npm ou bun
- Docker e Docker Compose (opcional)
- Conta Supabase (gratuita em supabase.com)

## Setup Rapido (Desenvolvimento)

### 1. Clonar o repositorio
### 2. Configurar Supabase
   - Criar projeto no supabase.com
   - Executar schema.sql no SQL Editor
   - Copiar URL e anon key
### 3. Configurar variaveis de ambiente
   - cp .env.example .env
   - Preencher variaveis
### 4. Instalar e rodar
   - npm install
   - npm run dev

## Setup com Docker
### 1. Configurar .env
### 2. docker-compose up --build

## Build para Producao
- npm run build
- Servir pasta dist/ com qualquer servidor web

## Configuracoes Opcionais
- IA (AI_API_KEY + AI_BASE_URL)
- Email (RESEND_API_KEY)
- Pagamentos (STRIPE_SECRET_KEY)

## Arquitetura
- Frontend: React 18, TypeScript, Tailwind CSS, Vite
- Backend: Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- IA: Qualquer API compativel com OpenAI

## Estrutura do Projeto
(arvore de diretorios simplificada)

## Edge Functions
(lista com descricao de cada funcao)

## Contribuindo
(guia basico)

## Licenca
MIT
```

### Arquivos adicionais


| Arquivo           | Conteudo                                |
| ----------------- | --------------------------------------- |
| `LICENSE`         | Licenca MIT completa                    |
| `CONTRIBUTING.md` | Guia de contribuicao (fork, branch, PR) |
| `.env.example`    | Template de variaveis (detalhado acima) |


---

## Resumo de Impacto


| Categoria      | Arquivos Criados                                                      | Arquivos Modificados                                     |
| -------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| Env/Seguranca  | 1 (`.env.example`)                                                    | 13 (edge functions + auth.ts)                            |
| Banco de Dados | 1 (`schema.sql`)                                                      | 1 migracao SQL                                           |
| Docker         | 4 (`Dockerfile`, `nginx.conf`, `docker-compose.yml`, `.dockerignore`) | 0                                                        |
| Dependencias   | 0                                                                     | 3 (`package.json`, `vite.config.ts`, `lovable/index.ts`) |
| Documentacao   | 3 (`README.md`, `LICENSE`, `CONTRIBUTING.md`)                         | 0                                                        |
| **Total**      | **9**                                                                 | **~17**                                                  |


---

## Ordem de Execucao

1. Remover dependencias proprietarias (`package.json`, `vite.config.ts`)
2. Reescrever `src/integrations/lovable/index.ts` (Supabase nativo)
3. Atualizar `src/pages/Gateway.tsx` (remover import lovable)
4. Parametrizar `supabase/functions/_shared/auth.ts` (ALLOWED_ORIGINS)
5. Parametrizar `customer-portal/index.ts` (remover fallback hardcoded)
6. Parametrizar 11 edge functions de IA (AI_BASE_URL + AI_API_KEY)
7. Migracao SQL para `handle_new_user` (remover URL hardcoded)
8. Gerar `supabase/schema.sql` consolidado
9. Criar arquivos Docker (Dockerfile, nginx.conf, docker-compose.yml, .dockerignore)
10. Criar `.env.example`
11. Escrever `README.md`, `LICENSE`, `CONTRIBUTING.md`