
# Análise Técnica: 10 Melhorias para o Lançamento da CosmoSec

Após análise minuciosa de mais de 30 arquivos do projeto (páginas, hooks, edge functions, contextos, componentes de layout e banco de dados), foram identificadas as seguintes melhorias e correções prioritárias para o lançamento da plataforma para outras empresas.

---

## 1. CRÍTICO — Histórico de Relatórios é dados fictícios (hardcoded)

**Arquivo:** `src/pages/Relatorios.tsx` (linha 87–91)

```ts
// Dados inventados, não refletem nenhum relatório real gerado
const recentReports = [
  { id: 1, name: 'Relatório de Conformidade - Janeiro 2026', date: '2026-01-02', type: 'HTML', size: '1.2 MB' },
  { id: 2, name: 'Gap Analysis NIST CSF', date: '2025-12-28', ...},
  { id: 3, name: 'Relatório Executivo Q4', date: '2025-12-25', ...},
];
```

A aba "Histórico" exibe relatórios falsos para todos os usuários. O botão de download desses itens não faz nada. Isso causa confusão e perda de credibilidade ao ser descoberto por um cliente real.

**Solução:** Criar uma tabela `generated_reports` no banco de dados e persistir cada relatório gerado com metadados (organização, tipo, data, tamanho). A aba de histórico buscaria registros reais desta tabela.

---

## 2. CRÍTICO — Prévia do Relatório usa dados inventados

**Arquivo:** `src/pages/Relatorios.tsx` (linhas 317–415)

A aba "Prévia" exibe um relatório com dados completamente fictícios: 72% de score, 142 controles conformes, riscos inventados como "Vazamento de dados sensíveis" e planos de ação com datas de 2025. Qualquer cliente que abrir essa aba verá dados que não pertencem à sua organização.

**Solução:** Substituir os dados estáticos por uma consulta ao banco usando os hooks já existentes (`useControls`, `useRisks`, `useActionPlans`) para gerar uma prévia com dados reais da organização ativa.

---

## 3. ALTO — E-mails de convite apontam para o domínio errado

**Arquivo:** `src/pages/Equipe.tsx` (linha 139) e `src/lib/constants.ts`

```ts
appUrl: OFFICIAL_DOMAIN, // = 'https://cosmosec.com.br'
```

O email de convite de equipe envia o link de aceitação apontando para `https://cosmosec.com.br`. Se esse domínio não estiver ativo ou configurado, o convidado não consegue aceitar o convite. O fluxo de aceitação de convite também não está claramente implementado no roteador (`App.tsx`).

**Solução:** Verificar que existe uma rota `/aceitar-convite/:token` funcional e que `OFFICIAL_DOMAIN` aponta para o domínio publicado correto. Para multi-tenant real, o `appUrl` deveria ser dinâmico baseado na URL atual da aplicação (`window.location.origin`).

---

## 4. ALTO — Email dos membros da equipe não é exibido

**Arquivo:** `src/hooks/useTeamMembers.ts` e `src/pages/Equipe.tsx` (linha 451)

Na tabela de equipe, o campo de email do membro não é mostrado — apenas o ID truncado (`ID: 3d4f2a...`). O hook `useTeamMembers` não busca o email (que está em `auth.users`, não em `profiles`). Isso obriga o admin a adivinhar quem é quem na lista por iniciais ou nome.

**Solução:** Criar uma função SQL ou view que expõe o email de forma segura para admins, ou ao menos exibir o e-mail armazenado em `profiles` caso seja populado no cadastro. Uma opção mais simples é salvar o email no perfil via trigger ao criar o usuário.

---

## 5. ALTO — Filtro de frameworks na página de Relatórios é estático e não reflete os frameworks reais

**Arquivo:** `src/pages/Relatorios.tsx` (linhas 174–183)

```tsx
<SelectItem value="nist">NIST CSF 2.0</SelectItem>
<SelectItem value="iso">ISO 27001:2022</SelectItem>
<SelectItem value="bcb">BCB/CMN 4.893</SelectItem>
```

O dropdown de seleção de framework no filtro de relatórios lista apenas 3 frameworks hardcoded. Se um cliente usa um framework customizado, ele não aparece no filtro. O valor selecionado também é um código simples ("nist", "iso") que não corresponde aos UUIDs reais da tabela `frameworks`.

**Solução:** Substituir o Select estático pelo hook `useFrameworks()` já existente, populando os itens dinamicamente com `id` como valor e `name` como label.

---

## 6. MÉDIO — Trigger `handle_new_user` pode silenciosamente falhar sem rollback

**Arquivo:** `supabase/migrations/20260220174621_...sql`

O trigger `handle_new_user` faz um `INSERT` no perfil do usuário e depois tenta chamar a edge function via `net.http_post`. Se o `INSERT` no perfil falhar (ex: violação de unicidade), o usuário recebe erro de cadastro. Mas se o `net.http_post` falhar (função indisponível, timeout), o cadastro acontece normalmente sem notificação — sem nenhum log ou fallback.

Além disso, a função busca `decrypted_secret` do vault, que pode retornar NULL se o segredo não estiver cadastrado, resultando em uma chamada sem autorização válida.

**Solução:** Adicionar um bloco `EXCEPTION WHEN OTHERS THEN NULL` ao redor do `PERFORM net.http_post(...)` para garantir que falhas na notificação nunca bloqueiem ou silenciosamente comprometam o cadastro. Também validar se o segredo retornou um valor não nulo antes de chamar a função.

---

## 7. MÉDIO — Sem rota de aceitação de convite visível no App.tsx

**Arquivo:** `src/App.tsx`

O sistema de convites de equipe cria registros na tabela `organization_invites` com um `token` UUID. O email enviado inclui um link de aceitação via `appUrl`. Porém, ao analisar `App.tsx`, não existe nenhuma rota como `/aceitar-convite/:token` ou `/invite/:token`. Sem essa rota, o fluxo de convite está quebrado para novos usuários.

**Solução:** Criar a página e rota `AcceptInvite` que lê o token da URL, valida o convite, cria/loga o usuário e adiciona o `user_role` correspondente na organização.

---

## 8. MÉDIO — `ErrorBoundary` anuncia que "nossa equipe foi notificada" mas não notifica ninguém

**Arquivo:** `src/components/ErrorBoundary.tsx` (linhas 44–45)

```tsx
<p className="text-muted-foreground">
  Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando na correção.
</p>
```

O `componentDidCatch` apenas faz `console.error`. Não há nenhuma integração com sistema de monitoramento (Sentry, LogRocket, etc.) nem com as edge functions da plataforma. A mensagem ao usuário é enganosa — a equipe não sabe que o erro ocorreu.

**Solução:** Integrar o `componentDidCatch` com uma edge function de log de erros (simples POST para salvar no banco ou enviar email), ou remover a afirmação de que "a equipe foi notificada" enquanto isso não for verdade.

---

## 9. BAIXO — Rota de autenticação usa path obscurecido que não é necessário

**Arquivo:** `src/lib/constants.ts`

```ts
export const AUTH_ROUTE = '/gateway/c7x9k2m4';
```

A rota de login tem um path deliberadamente obscurecido (`/gateway/c7x9k2m4`) provavelmente como medida de segurança por obscuridade. Para um produto multi-tenant com muitos clientes, isso gera problemas: links de marketing ou campanha quebram, recuperação de senha redireciona para um path que o usuário não reconhece, e o onboarding fica confuso.

**Solução:** Mover para `/entrar` ou `/login` como rota padrão. A segurança real vem de RLS, rate limiting e autenticação forte — não de um path obscuro.

---

## 10. BAIXO — Notificações não têm Realtime habilitado

**Arquivo:** `src/hooks/useNotifications.ts`

As notificações são buscadas via polling padrão (apenas no carregamento da página e a cada 5 minutos pelo TanStack Query). Um super admin que acaba de criar uma nova notificação para usuários não verá o sino atualizar em tempo real. O usuário só vê as novas notificações ao recarregar a página ou navegar para outro módulo.

**Solução:** Adicionar uma subscription Realtime na tabela `notifications` filtrada por `user_id`, que dispara `refetch()` automaticamente quando uma nova notificação chega. A tabela já tem RLS configurado — bastaria habilitar realtime com `ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications`.

---

## Resumo de Prioridades

| # | Problema | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | Histórico de relatórios fictício | Crítico | Médio |
| 2 | Prévia de relatório com dados falsos | Crítico | Médio |
| 3 | E-mail de convite com domínio errado | Alto | Baixo |
| 4 | Email do membro não exibido na equipe | Alto | Baixo |
| 5 | Filtro de frameworks estático | Alto | Baixo |
| 6 | Trigger sem tratamento de erro | Médio | Baixo |
| 7 | Rota de aceitação de convite ausente | Médio | Alto |
| 8 | ErrorBoundary anuncia notificação falsa | Médio | Baixo |
| 9 | Rota de auth obscurecida desnecessária | Baixo | Baixo |
| 10 | Notificações sem Realtime | Baixo | Baixo |

As correções de maior impacto para o lançamento são os itens 1, 2, 3 e 7 — relacionados diretamente à experiência que um novo cliente B2B terá ao usar a plataforma pela primeira vez.
