

# Plano: Docker Compose Completo com Supabase Local

## Problema Atual

O `docker-compose.yml` atual sobe **apenas o frontend** (Nginx servindo os arquivos estaticos). O usuario ainda precisa:
- Criar uma conta no Supabase Cloud
- Configurar URL + chaves manualmente
- Fazer deploy de Edge Functions separadamente

Isso nao e "rodar tudo com Docker". Para uma ferramenta open source, o ideal e oferecer **duas opcoes claras**:
1. **Frontend + Supabase Cloud** (atual, simplificado)
2. **Tudo local via Docker** (completo, self-hosted)

---

## O Que Sera Feito

### 1. Novo `docker-compose.yml` (completo, com Supabase local)

Usar a stack oficial do Supabase self-hosted com os servicos essenciais:
- **PostgreSQL** (banco de dados com schema pre-carregado)
- **Supabase Auth (GoTrue)** (autenticacao)
- **Supabase REST (PostgREST)** (API REST automatica)
- **Supabase Studio** (painel admin opcional)
- **Supabase Meta** (introspeccao do banco)
- **Frontend (Nginx)** (a aplicacao CosmoSec)

### 2. Novo arquivo `docker-compose.prod.yml`

Renomear o compose atual (so frontend) para `docker-compose.prod.yml`, para quem quer usar com Supabase Cloud em producao.

### 3. Arquivo `.env.docker` (template para Docker local)

Contera as variaveis pre-configuradas para o ambiente Docker local:
- `VITE_SUPABASE_URL=http://localhost:8000`
- `VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key-local>`
- Chaves JWT para o GoTrue
- Senhas do PostgreSQL

### 4. Script `docker/init.sql`

Script de inicializacao que carrega o `supabase/schema.sql` automaticamente no PostgreSQL ao subir o container pela primeira vez.

### 5. Atualizar `AudienceSection.tsx` (guia de instalacao)

Substituir a secao "Alternativa: Docker" por uma secao mais completa com duas opcoes:
- **Docker Completo (Self-Hosted)**: `docker compose up --build` sobe tudo
- **Docker Frontend + Supabase Cloud**: para quem quer usar o Supabase gerenciado

### 6. Atualizar `README.md`

Reescrever a secao Docker para documentar:
- Setup completo com `docker compose up`
- Acesso ao Studio em `http://localhost:3001`
- Criacao do super admin via Studio ou SQL
- Configuracao opcional de Edge Functions

### 7. Atualizar `.dockerignore`

Garantir que arquivos desnecessarios nao entrem no build.

---

## Arquitetura Docker

```text
docker compose up --build
      |
      +-- kong (API Gateway) :8000
      |     Roteia /auth -> GoTrue, /rest -> PostgREST
      |
      +-- db (PostgreSQL 15) :5432
      |     Schema carregado automaticamente
      |
      +-- auth (GoTrue) :9999
      |     Autenticacao, signup, login
      |
      +-- rest (PostgREST) :3000
      |     API REST automatica sobre o banco
      |
      +-- studio (Supabase Studio) :3001
      |     Painel de administracao (opcional)
      |
      +-- app (Nginx + Frontend) :80
            CosmoSec UI
```

---

## Arquivos Impactados

| Arquivo | Acao |
|---------|------|
| `docker-compose.yml` | Reescrever com stack Supabase completa |
| `docker-compose.prod.yml` | Novo (antigo docker-compose, so frontend) |
| `.env.docker` | Novo (template para Docker local) |
| `docker/kong.yml` | Novo (configuracao do API Gateway) |
| `docker/volumes/api/kong.yml` | Config de rotas Kong |
| `.dockerignore` | Atualizar |
| `src/components/landing/AudienceSection.tsx` | Atualizar secao Docker |
| `README.md` | Reescrever secao Docker |
| `Dockerfile` | Ajustar para aceitar build args das env vars |

---

## Detalhes Tecnicos

### Dockerfile (ajuste)

O Dockerfile precisa receber as variaveis `VITE_*` como build args, pois o Vite as embute no bundle em tempo de build:

```text
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
```

### Chaves JWT locais

Para o ambiente Docker local, sera gerado um par de chaves JWT (anon e service_role) usando um secret fixo documentado. O usuario pode trocar em producao. Isso segue o padrao do Supabase self-hosted.

### Edge Functions

As Edge Functions do Supabase **nao serao incluidas** no Docker Compose local porque requerem o Deno runtime e o Supabase Edge Runtime, que adicionam complexidade significativa. O guia deixara claro que:
- Funcionalidades basicas (CRUD, auth, dashboard) funcionam sem Edge Functions
- Para IA, emails e exportacoes, o usuario pode fazer deploy via `supabase functions serve` localmente ou usar Supabase Cloud

### Nota sobre producao

O `docker-compose.yml` local e para **desenvolvimento e testes**. Para producao, sera recomendado usar Supabase Cloud ou o guia oficial de self-hosting do Supabase com configuracoes de seguranca adequadas.

