

# Segunda Rodada: 10 Novas Melhorias para o Lançamento da CosmoSec

Apos a correcao dos 10 primeiros itens, esta segunda auditoria identificou mais 10 pontos que impactam a experiencia do cliente, a seguranca e a robustez da plataforma.

---

## 1. CRITICO -- Sem controle de permissoes por funcao (RBAC nao aplicado no frontend)

**Arquivos:** Todas as paginas (`Diagnostico.tsx`, `Riscos.tsx`, `Evidencias.tsx`, `PlanoAcao.tsx`, etc.)

A plataforma tem 3 funcoes definidas (admin, auditor, analyst), mas nenhuma pagina verifica a funcao do usuario. Um `analyst` pode acessar e usar todas as funcionalidades identicamente a um `admin`. As unicas verificacoes de `isAdmin` existentes estao em `Equipe.tsx` (botao de convidar) e `Configuracoes.tsx` (edicao da organizacao). Todas as acoes criticas como excluir riscos, resetar avaliacoes, excluir todos os planos de acao e exportar backups estao disponiveis para qualquer funcao.

**Solucao:** Criar um hook `usePermissions()` que retorna as permissoes do usuario atual baseado na sua funcao. Desabilitar/ocultar botoes destrutivos e de gestao para funcoes nao autorizadas. No minimo: auditores devem ter somente leitura, analistas nao devem gerenciar equipe nem configuracoes da organizacao.

---

## 2. CRITICO -- Botao "Excluir Todos" nos Planos de Acao sem confirmacao adequada

**Arquivo:** `src/pages/PlanoAcao.tsx` (linha 250-255)

Existe um botao "Excluir Todos" que deleta TODOS os planos de acao da organizacao com apenas um clique de confirmacao simples. Nao ha verificacao de quantidade, nao pede digitacao do nome da organizacao, e nao ha log de auditoria especifico. Um clique acidental ou de um usuario mal-intencionado pode destruir meses de trabalho de remediacao.

**Solucao:** Exigir digitacao de uma frase de confirmacao (ex: "EXCLUIR TODOS") antes de executar. Mostrar a quantidade de planos que serao excluidos. Restringir essa acao apenas para admins. Registrar a acao no log de auditoria com detalhes dos itens excluidos.

---

## 3. ALTO -- `OFFICIAL_DOMAIN` ainda esta hardcoded e nao e usado em lugar nenhum

**Arquivo:** `src/lib/constants.ts`

A constante `OFFICIAL_DOMAIN = 'https://cosmosec.com.br'` ainda existe mas ja nao e importada em nenhum arquivo (a correcao anterior mudou para `window.location.origin`). Isso e codigo morto que pode causar confusao se alguem voltar a usa-la pensando que e o dominio correto.

**Solucao:** Remover `OFFICIAL_DOMAIN` de `constants.ts` completamente, ja que o dominio agora e dinamico.

---

## 4. ALTO -- Funcao `accept_organization_invite` nao valida expiracaoo do convite

**Arquivo:** `supabase/migrations/...sql` (funcao `accept_organization_invite`)

A pagina `AcceptInvite.tsx` chama `supabase.rpc('accept_organization_invite')`, mas ao analisar a funcao SQL, nao e claro se ela verifica se o convite ja expirou (`expires_at`), se ja foi aceito (`accepted_at IS NOT NULL`), ou se o email do usuario logado corresponde ao email do convite. Um usuario com qualquer conta poderia aceitar convites de terceiros se tiver o token UUID.

**Solucao:** Verificar na funcao SQL que: (a) o convite nao expirou, (b) nao foi aceito anteriormente, (c) o email do usuario autenticado corresponde ao email do convite. Retornar mensagens de erro claras para cada caso.

---

## 5. ALTO -- Pagina de Relatorios ainda nao persiste historico de relatorios gerados

**Arquivo:** `src/pages/Relatorios.tsx` (aba "Historico")

A correcao anterior removeu os dados fictcios e colocou uma mensagem "Nenhum relatorio gerado ainda", mas o sistema continua sem persistir os relatorios gerados. Quando o usuario gera um relatorio, ele e baixado como HTML mas nenhum registro e salvo no banco. Se o usuario gerar 10 relatorios ao longo do mes, a aba de historico sempre mostrara "nenhum relatorio".

**Solucao:** Criar a tabela `generated_reports` no banco de dados (id, organization_id, user_id, report_type, framework_id, period, file_name, created_at) e inserir um registro cada vez que `handleGenerateReport` for chamado com sucesso. A aba de historico listaria esses registros.

---

## 6. MEDIO -- Edge Function `generate-action-plan` usa endpoint de API desatualizado

**Arquivo:** `supabase/functions/generate-action-plan/index.ts` (linha 62)

Esta funcao chama `https://api.lovable.dev/v1/chat` em vez do gateway padrao `https://ai.gateway.lovable.dev/v1/chat/completions` que todas as outras funcoes de IA usam (como `vendor-risk-analysis`). Alem disso, ela usa `LOVABLE_API_KEY` e o modelo `openai/gpt-5-mini` sem tool calling, enquanto as funcoes mais recentes usam tool calling estruturado para garantir respostas JSON validas.

**Solucao:** Atualizar o endpoint para `https://ai.gateway.lovable.dev/v1/chat/completions` e usar tool calling como nas outras funcoes. Isso garante consistencia e previne falhas de parsing JSON.

---

## 7. MEDIO -- Sem paginacao na listagem de controles, riscos e planos de acao

**Arquivos:** `src/hooks/useControls.ts`, `src/hooks/useRisks.ts`, `src/hooks/useActionPlans.ts`

Todos os hooks buscam TODOS os registros da organizacao de uma vez. O limite padrao do Supabase e 1000 linhas por query. Uma organizacao com mais de 1000 controles (comum em ISO 27001 + NIST combinados), 1000+ riscos, ou 1000+ planos de acao simplesmente nao vera os registros excedentes -- sem nenhum aviso de erro.

**Solucao:** Adicionar paginacao ou usar `.range()` para buscar todos os registros em lotes. Alternativamente, adicionar um parametro `count: 'exact'` para detectar quando ha mais registros do que o retornado e exibir um aviso ao usuario.

---

## 8. MEDIO -- Login redireciona para `/selecionar-modulo` sem preservar URL de destino

**Arquivo:** `src/pages/Gateway.tsx` (linha 157)

Quando um usuario tenta acessar uma URL protegida (ex: `/diagnostico?control=AC-1`) sem estar logado, o `AppLayout` redireciona para `/entrar`. Apos o login, o usuario e enviado para `/selecionar-modulo` em vez de voltar para a URL original. Isso e especialmente problematico para links compartilhados e links de convite que redirecionam para paginas especificas.

**Solucao:** Salvar a URL de destino como query parameter na rota de auth (ex: `/entrar?redirect=/diagnostico?control=AC-1`) e apos login bem-sucedido, navegar para essa URL em vez de `/selecionar-modulo`.

---

## 9. BAIXO -- Dados de evidencias nao tem validacao de tamanho de arquivo no frontend

**Arquivo:** `src/components/evidencias/UploadEvidenceDialog.tsx`

Nao ha validacao visivel do tamanho maximo de arquivo ao fazer upload de evidencias. Se o bucket de storage tiver um limite (ex: 50MB), o usuario so descobre apos tentar enviar, recebendo uma mensagem de erro generica. Tambem nao ha indicacao de progresso de upload para arquivos grandes.

**Solucao:** Adicionar validacao de tamanho no frontend (ex: maximo 50MB) com mensagem clara antes do upload. Exibir uma barra de progresso durante o upload usando `onUploadProgress` do Supabase Storage.

---

## 10. BAIXO -- Configuracoes tem 9 abas que nao cabem em telas menores

**Arquivo:** `src/pages/Configuracoes.tsx` (linha 441)

A pagina de configuracoes tem 9 abas (`grid-cols-9`) que ficam completamente inutilizaveis em telas menores. As abas ficam esmagadas e os textos truncados tornam impossivel identificar qual aba e qual. Nao ha scroll horizontal ou menu dropdown para mobile.

**Solucao:** Usar um `ScrollArea` horizontal para as abas ou agrupar abas relacionadas (ex: "Conta" englobando Perfil + Aparencia + Notificacoes). Alternativamente, substituir por um sidebar de navegacao em telas menores.

---

## Resumo de Prioridades

| # | Problema | Impacto | Esforco |
|---|----------|---------|---------|
| 1 | RBAC nao aplicado no frontend | Critico | Alto |
| 2 | "Excluir Todos" sem protecao adequada | Critico | Baixo |
| 3 | OFFICIAL_DOMAIN codigo morto | Alto | Minimo |
| 4 | Convite nao valida expiracao/email | Alto | Medio |
| 5 | Historico de relatorios nao persiste | Alto | Medio |
| 6 | Edge function com endpoint desatualizado | Medio | Baixo |
| 7 | Sem paginacao (limite 1000 registros) | Medio | Medio |
| 8 | Login nao preserva URL de destino | Medio | Baixo |
| 9 | Upload sem validacao de tamanho | Baixo | Baixo |
| 10 | Abas de configuracoes em telas pequenas | Baixo | Baixo |

As correcoes de maior impacto imediato sao os itens 1 (RBAC), 2 (protecao contra exclusao em massa) e 4 (validacao de convites), pois representam riscos de seguranca e perda de dados para clientes reais.

