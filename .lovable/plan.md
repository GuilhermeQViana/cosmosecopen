

# Plano: Itens Pendentes para Open Source Completo

Apos a analise completa do codigo, identifiquei os seguintes pontos que ainda precisam ser corrigidos para que a aplicacao fique 100% pronta para open source.

---

## 1. URLs e Emails Hardcoded do CosmoSec

Existem **6 edge functions** com URLs e emails `cosmosec.com.br` fixos no codigo. Esses valores precisam ser parametrizados via variaveis de ambiente (`APP_URL`, `EMAIL_FROM`).

### Arquivos afetados:

| Arquivo | Problema |
|---------|----------|
| `supabase/functions/stripe-webhook/index.ts` | CORS hardcoded `https://cosmosec.com.br` + 5 URLs hardcoded + 4 emails `noreply@cosmosec.com.br` |
| `supabase/functions/send-deadline-notifications/index.ts` | URL `cosmosec.com.br/plano-acao` + email `noreply@cosmosec.com.br` |
| `supabase/functions/send-trial-reminder/index.ts` | URL `cosmosec.com.br/configuracoes` + email `noreply@cosmosec.com.br` |
| `supabase/functions/send-invite-email/index.ts` | Email `noreply@cosmosec.com.br` |
| `supabase/functions/notify-new-signup/index.ts` | Email `noreply@cosmosec.com.br` |
| `supabase/functions/send-contact-notification/index.ts` | Email `contato@cosmosec.com.br` |

### Solucao:
- Substituir por `Deno.env.get("APP_URL")` para URLs
- Substituir por `Deno.env.get("EMAIL_FROM") || "noreply@seu-dominio.com"` para remetentes de email
- No `stripe-webhook`, usar `getCorsHeaders(req)` do `auth.ts` em vez de CORS hardcoded
- Atualizar `.env.example` com `APP_URL` e `EMAIL_FROM`

---

## 2. Stripe Price ID Hardcoded

O arquivo `supabase/functions/create-checkout/index.ts` tem o Price ID do Stripe fixo: `price_1SlK8NCqxmkFTPhAWPuMspeK`.

### Solucao:
- Substituir por `Deno.env.get("STRIPE_PRICE_ID")` com erro claro se nao configurado
- Adicionar `STRIPE_PRICE_ID` ao `.env.example`

---

## 3. Arquivo `src/integrations/lovable/index.ts` Orfao

O arquivo existe mas nao e importado por nenhum outro arquivo. E codigo morto que referencia o nome "lovable".

### Solucao:
- Remover o arquivo

---

## 4. Referencia Lovable no `_shared/auth.ts`

A funcao `getAIConfig()` ainda faz fallback para `LOVABLE_API_KEY` e para a URL `ai.gateway.lovable.dev`.

### Solucao:
- Remover o fallback `LOVABLE_API_KEY` -- usar apenas `AI_API_KEY`
- Remover o fallback URL `ai.gateway.lovable.dev` -- retornar `null` se `AI_BASE_URL` nao estiver configurada
- Remover referencias a `lovableproject` e `lovable.app` no CORS (linhas de desenvolvimento)

---

## 5. Metadados no `index.html`

O `index.html` tem URLs `cosmosec.com` fixas nos meta tags Open Graph, Twitter e canonical.

### Solucao:
- Remover ou genericizar as meta tags hardcoded (os contribuidores configurarao no deploy)

---

## 6. Emails de Contato no Frontend

Os arquivos `src/components/landing/ContactSection.tsx` e `src/pages/PoliticaLGPD.tsx` tem emails `contato@cosmosec.com.br` e `dpo@cosmosec.com.br` hardcoded.

### Solucao:
- Extrair para constantes em `src/lib/constants.ts` com valores configuraves, para facilitar a personalizacao

---

## 7. Referencia na Demo de Slides

O arquivo `src/lib/slide-generator-demo.ts` tem `cosmosec.com.br` hardcoded.

### Solucao:
- Substituir por constante de `src/lib/constants.ts`

---

## 8. Atualizar `.env.example`

Adicionar as novas variaveis:

```text
APP_URL=https://seu-dominio.com
EMAIL_FROM=CosmoSec <noreply@seu-dominio.com>
STRIPE_PRICE_ID=price_xxx
```

---

## Resumo de Impacto

| Categoria | Arquivos Modificados |
|-----------|---------------------|
| Edge Functions (URLs/emails) | 6 |
| Edge Function (Stripe price) | 1 |
| Auth compartilhado | 1 |
| Frontend (meta tags) | 1 |
| Frontend (contatos) | 2-3 |
| Arquivo removido | 1 (`lovable/index.ts`) |
| Config | 1 (`.env.example`) |
| **Total** | **~14 arquivos** |

---

## Ordem de Execucao

1. Remover `src/integrations/lovable/index.ts`
2. Atualizar `supabase/functions/_shared/auth.ts` (remover fallbacks Lovable)
3. Parametrizar `stripe-webhook/index.ts` (CORS + URLs + emails)
4. Parametrizar `create-checkout/index.ts` (Stripe Price ID)
5. Parametrizar demais edge functions de email (5 arquivos)
6. Atualizar `index.html` (meta tags)
7. Extrair constantes de contato no frontend
8. Atualizar `.env.example`

