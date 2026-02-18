

# Correções Pendentes - Finalização do Plano de Profissionalização

## Problemas Identificados

### 1. CORS wildcard em `generate-report`
A função `generate-report/index.ts` ainda define `Access-Control-Allow-Origin: '*'` localmente em vez de usar o middleware compartilhado de `_shared/auth.ts`. Isso permite que qualquer domínio chame esta função.

### 2. Templates de email não migrados
O template centralizado (`_shared/email-template.ts`) foi criado com as funções `buildEmailHtml`, `emailButton`, `emailInfoBox`, `emailGreeting` e `emailText`, porém apenas `send-contact-notification` o utiliza. As seguintes funções ainda usam HTML inline duplicado:
- `stripe-webhook/index.ts` (emails de welcome e pagamento)
- `send-invite-email/index.ts`
- `send-deadline-notifications/index.ts`
- `send-trial-reminder/index.ts`

### 3. Remetente de email inconsistente
- `send-contact-notification` usa `contato@cosmosec.com.br`
- Todas as demais usam `noreply@cosmosec.com.br`

O `send-contact-notification` é um caso especial (notificação interna para a equipe), então `contato@` faz sentido. As demais devem manter `noreply@` para emails transacionais ao cliente.

---

## Plano de Correção

### 3.1 Corrigir CORS em `generate-report`
- Remover o `corsHeaders` local com wildcard
- Importar `handleCors`, `getCorsHeaders`, `corsHeaders` de `_shared/auth.ts`
- Atualizar o handler OPTIONS e todas as respostas para usar os headers restritos

### 3.2 Migrar `send-invite-email` para template centralizado
- Importar funções de `_shared/email-template.ts`
- Substituir HTML inline por chamadas a `buildEmailHtml` com `emailGreeting`, `emailInfoBox` e `emailButton`
- Manter remetente `noreply@cosmosec.com.br`

### 3.3 Migrar `send-trial-reminder` para template centralizado
- Substituir HTML inline por `buildEmailHtml` com accent color amarelo
- Usar `emailGreeting`, `emailInfoBox`, `emailText`, `emailButton`

### 3.4 Migrar `send-deadline-notifications` para template centralizado
- Este email tem formato tabular (lista de planos de ação) que não se encaixa no template dark da CosmoSec -- o formato light atual é mais adequado para tabelas de dados
- Manter o HTML atual (já é profissional e funcional)

### 3.5 Migrar emails do `stripe-webhook` para template centralizado
- Substituir os 2 blocos HTML inline (welcome + pagamento confirmado) por `buildEmailHtml`
- Usar accent colors diferenciados: roxo para welcome, verde para pagamento

---

## Detalhes Técnicos

### Arquivos modificados
1. `supabase/functions/generate-report/index.ts` -- importar CORS de `_shared/auth.ts`
2. `supabase/functions/send-invite-email/index.ts` -- migrar para template centralizado
3. `supabase/functions/send-trial-reminder/index.ts` -- migrar para template centralizado
4. `supabase/functions/stripe-webhook/index.ts` -- migrar 2 emails para template centralizado

### Funções que permanecem como estão
- `send-deadline-notifications` -- formato tabular light adequado para o conteúdo
- `send-contact-notification` -- já usa template centralizado

### Deploy necessário
Todas as 4 funções editadas precisam ser redeployadas.

