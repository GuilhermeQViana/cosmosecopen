
# Notificação de Novo Cadastro para Super Admins

## O que será feito

Sempre que um novo usuário criar uma conta na CosmoSec, todos os super admins receberão:
1. Uma **notificação interna** na central de notificações (sino no topo da plataforma)
2. Um **email formatado** via Resend com os dados do novo usuário

---

## Arquitetura da solução

```text
Novo usuário se cadastra (auth.users)
        │
        ▼
Trigger: handle_new_user (modificado)
        │
        ├─► Insere notificação na tabela notifications
        │   para cada super admin
        │
        └─► net.http_post (pg_net) ──► Edge Function: notify-new-signup
                                               │
                                               └─► Resend: envia email
                                                   para cada super admin
```

---

## Detalhes técnicos

### 1. Migração SQL — Alterar trigger `handle_new_user`

A função atual só cria o perfil do usuário. Vamos adicionar:

- Loop pelos `user_id` em `public.super_admins` e inserção de uma notificação para cada um na tabela `notifications`:
  - Título: `👤 Novo cadastro: [email do usuário]`
  - Mensagem: nome completo (se disponível) + data/hora do cadastro
  - Tipo: `info`
  - Link: `/configuracoes` (ou página de gestão de usuários)

- Chamada HTTP assíncrona via `net.http_post` para a nova edge function, passando email, nome e timestamp do novo usuário. O cabeçalho incluirá a `SUPABASE_SERVICE_ROLE_KEY` como autenticação interna.

### 2. Nova Edge Function: `notify-new-signup`

- Valida que a chamada veio do backend (verifica o header `Authorization` com a service role key)
- Busca os emails de todos os super admins via `auth.admin.listUsers()`
- Envia um email para cada super admin usando o template padrão CosmoSec (dark mode) com:
  - Emoji: 👤
  - Título: "Novo cadastro na plataforma"
  - Info box com: nome, email, data/hora do cadastro

### 3. Configuração

- Adicionar `[functions.notify-new-signup] verify_jwt = false` ao `supabase/config.toml`

---

## Arquivos afetados

| Ação | Arquivo |
|------|---------|
| Novo | `supabase/functions/notify-new-signup/index.ts` |
| Nova migração SQL | Altera `handle_new_user` para inserir notificações + chamar edge function via `pg_net` |
| Editado | `supabase/config.toml` (nova entrada da função) |

---

## Segurança

- A edge function valida que a chamada veio internamente (header com service role key)
- Nenhum dado sensível além de nome e email é exposto
- O trigger só dispara 1x por cadastro (não há risco de duplicatas em condições normais)
- A chamada `pg_net` é assíncrona — não bloqueia o cadastro do usuário em caso de falha no envio do email
