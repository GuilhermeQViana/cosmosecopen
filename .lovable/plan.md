

# Plano: Corrigir Guia de Instalacao e Remover Restos de Stripe

## Problemas Identificados

### 1. Stripe ainda presente em 3 locais

| Arquivo | Problema |
|---------|----------|
| `src/components/landing/ROICalculatorSection.tsx` | Lista "Stripe (pagamentos)" nas integracoes opcionais e 3 variaveis STRIPE_* nas env vars |
| `src/pages/PoliticaPrivacidade.tsx` | Menciona Stripe como processador de pagamentos (linhas 94 e 128) |
| `README.md` | Lista 5 edge functions Stripe deletadas, menciona "Pagamentos: Stripe (opcional)", e lista STRIPE_* nas variaveis |

### 2. Schema SQL tem colunas Stripe

O arquivo `supabase/schema.sql` ainda contem:
- `stripe_customer_id TEXT` na tabela organizations
- `stripe_subscription_id TEXT` na tabela organizations
- `subscription_status TEXT DEFAULT 'trialing'`
- `trial_ends_at TIMESTAMPTZ`
- `subscription_ends_at TIMESTAMPTZ`
- View `organizations_safe` que expoe esses campos
- Funcao `check_organization_access` que verifica trial/subscription

### 3. Guia de Instalacao incompleto

O `AudienceSection.tsx` tem problemas:
- **Falta `VITE_SUPABASE_PROJECT_ID`** no passo 4 (variavel obrigatoria)
- **Falta o passo "Criar Super Admin"** -- sem isso o usuario nao consegue usar a ferramenta completamente
- **Falta mencionar `http://localhost:5173`** no passo 5
- **Docker enganoso** -- diz "rode tudo" mas so builda o frontend, ainda precisa do Supabase externo
- **Falta o deploy das Edge Functions** -- o usuario precisa saber que precisa fazer `supabase functions deploy` ou configurar via Supabase Dashboard

### 4. Inconsistencia no README

- URL do repositorio usa `seu-usuario/cosmosec` em vez de `cosmosec-labs/cosmosec` (constante `GITHUB_URL`)

---

## Correcoes Planejadas

### 1. `src/components/landing/ROICalculatorSection.tsx`
- Remover "Stripe (pagamentos)" da lista de integracoes opcionais
- Remover as 3 variaveis `STRIPE_*` da tabela de env vars

### 2. `src/pages/PoliticaPrivacidade.tsx`
- Remover mencoes ao Stripe como processador de pagamentos
- Remover secao "Dados de Pagamento"

### 3. `src/components/landing/AudienceSection.tsx`
- Adicionar `VITE_SUPABASE_PROJECT_ID` ao passo 4
- Adicionar passo 6: "Crie seu Super Admin" com o comando SQL
- Adicionar `http://localhost:5173` ao passo 5
- Corrigir texto do Docker para deixar claro que precisa de Supabase externo
- Adicionar nota sobre deploy de Edge Functions (necessario para funcionalidades de IA, email, etc.)

### 4. `README.md`
- Corrigir URL do repositorio para `cosmosec-labs/cosmosec`
- Remover as 5 edge functions Stripe da tabela
- Remover "Pagamentos: Stripe (opcional)" da arquitetura
- Remover `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` das variaveis opcionais
- Adicionar passo sobre deploy de Edge Functions

### 5. `supabase/schema.sql`
- Remover colunas `stripe_customer_id` e `stripe_subscription_id` da tabela organizations
- Remover `trial_ends_at`, `subscription_status`, `subscription_ends_at`
- Simplificar a view `organizations_safe` (sem campos de subscription)
- Simplificar ou remover a funcao `check_organization_access` (sempre retorna true)

### 6. Migracao de banco de dados
- Criar migracao SQL para remover as colunas Stripe da tabela organizations existente
- Atualizar a view `organizations_safe`
- Atualizar a funcao `check_organization_access` para sempre retornar true

---

## Ordem de Execucao

1. Migracao SQL (remover colunas Stripe do banco)
2. Atualizar `supabase/schema.sql` (schema consolidado)
3. Corrigir `ROICalculatorSection.tsx` (remover Stripe)
4. Corrigir `PoliticaPrivacidade.tsx` (remover Stripe)
5. Corrigir `AudienceSection.tsx` (guia completo com super admin, project ID, Edge Functions)
6. Atualizar `README.md` (corrigir URL, remover Stripe, adicionar Edge Functions deploy)

---

## Detalhes Tecnicos

### Novo passo no guia: Deploy de Edge Functions

O usuario precisa saber que para funcionalidades como IA, email e exportacao, precisa fazer deploy das Edge Functions. Isso sera apresentado como um passo opcional apos rodar o projeto, com instrucoes sobre:
- Instalar o Supabase CLI
- Linkar ao projeto (`supabase link`)
- Fazer deploy (`supabase functions deploy`)
- Configurar secrets (`supabase secrets set AI_API_KEY=...`)

### Novo passo no guia: Super Admin

Apos cadastrar-se, o usuario precisa executar um SQL para se tornar super admin. Sem isso, varias funcionalidades ficam restritas. O comando sera mostrado com bloco copiavel.

