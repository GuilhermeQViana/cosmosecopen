
## Reestruturar Fluxos de Aprovacao - UI/UX Aprimorado + Novas Funcionalidades

### Problemas Atuais

1. **Pagina basica demais** - apenas lista cards simples sem metricas ou contexto visual
2. **Sem edicao** - workflows so podem ser criados ou excluidos, nao editados
3. **Sem vinculo com politicas** - nao ha como saber quais politicas usam cada workflow
4. **Sem visibilidade de aprovacoes** - nenhuma aba ou secao mostra aprovacoes pendentes/historico
5. **Dialog de criacao minimalista** - sem descricao, sem prazo de SLA, sem notificacoes
6. **Sem workflow padrao** - nao ha como definir um workflow como padrao para novas politicas
7. **Cards sem informacao util** - mostram apenas nome e niveis, sem contagem de uso ou status

### Novas Funcionalidades

**1. Dashboard de metricas no topo**
- Total de workflows ativos
- Aprovacoes pendentes (contagem de `policy_approvals` com status `pendente`)
- Aprovacoes concluidas (ultimo mes)
- Tempo medio de aprovacao

**2. Edicao de workflows**
- Reutilizar o dialog de criacao como dialog de edicao (pre-preencher campos)
- Botao de editar no card do workflow (icone `Pencil`)

**3. Descricao e configuracoes adicionais no workflow**
- Campo de descricao (opcional) no dialog de criacao/edicao
- Toggle "Workflow padrao" - define como padrao para novas politicas (apenas 1 por org)
- Campo de SLA (prazo maximo em dias para aprovacao)
- Checkbox "Notificar aprovador por email" (visual apenas, para futuro)

**4. Aba de Aprovacoes Pendentes**
- Nova secao com tabs: "Workflows" | "Aprovacoes Pendentes" | "Historico"
- Tab "Aprovacoes Pendentes": lista politicas aguardando aprovacao com botoes aprovar/rejeitar
- Tab "Historico": lista de aprovacoes passadas com filtros por status

**5. Cards de workflow aprimorados**
- Badge "Padrao" quando for o workflow padrao
- Contagem de politicas vinculadas (query simples)
- Visualizacao de fluxo com steps visuais (Nivel 1 -> Nivel 2 -> Aprovada)
- Data de criacao formatada
- Menu de acoes (Editar, Duplicar, Definir como padrao, Excluir)

**6. Empty state interativo**
- Botao direto no empty state para criar primeiro workflow
- Dicas contextuais sobre como funciona a aprovacao

### Mudancas por Arquivo

**Banco de dados - Migracao SQL**
- Adicionar colunas na tabela `policy_workflows`:
  - `description` (text, nullable)
  - `is_default` (boolean, default false)
  - `sla_days` (integer, nullable)
  - `notify_approver` (boolean, default true)

**`src/hooks/usePolicyWorkflows.ts`**
- Atualizar tipo `PolicyWorkflow` com novos campos
- Adicionar mutation `duplicateWorkflow`
- Adicionar mutation `setDefaultWorkflow` (remove default dos outros, seta no selecionado)
- Adicionar query `pendingApprovalsCount` para metricas
- Adicionar query para buscar aprovacoes pendentes de toda a org (nao apenas por policy)

**`src/pages/PolicyWorkflows.tsx` (REESCREVER)**
- Adicionar metricas no topo (4 cards de stats)
- Sistema de tabs: "Workflows" | "Pendentes" | "Historico"
- Tab Workflows: grid de cards aprimorados com menu de acoes (dropdown)
- Tab Pendentes: tabela com politica, versao, nivel, aprovador, data, acoes (aprovar/rejeitar)
- Tab Historico: tabela com filtro por status (aprovada/rejeitada/todas)
- Dialog de criacao/edicao expandido com novos campos
- Dialog de aprovacao/rejeicao com campo de comentarios

**Novos componentes auxiliares:**
- `src/components/politicas/WorkflowStepsPreview.tsx` - Visualizacao do fluxo com steps conectados (Nivel 1 -> Nivel 2 -> Aprovada)
- `src/components/politicas/ApprovalActionDialog.tsx` - Dialog para aprovar/rejeitar com comentarios obrigatorios na rejeicao

### Layout Visual Proposto

```text
+-------------------------------------------------------------------+
| Fluxos de Aprovacao                          [+ Novo Workflow]     |
| Gerencie workflows e acompanhe aprovacoes                          |
+-------------------------------------------------------------------+
| [Workflows ativos] [Pendentes] [Aprovadas (mes)] [Tempo medio]    |
|     3                  5            12              2.3 dias       |
+-------------------------------------------------------------------+
| [Workflows]  [Pendentes (5)]  [Historico]                          |
+-------------------------------------------------------------------+
|                                                                    |
| +--Card Workflow--+  +--Card Workflow--+  +--Card Workflow--+      |
| | Aprovacao Padrao|  | Aprovacao LGPD  |  | Dupla Revisao   |      |
| | [Padrao] 2niveis|  | 1 nivel         |  | 2 niveis        |      |
| | [N1]->[N2]->[OK]|  | [N1]->[OK]      |  | [N1]->[N2]->[OK]|      |
| | 5 politicas     |  | 2 politicas     |  | 0 politicas     |      |
| | SLA: 5 dias     |  | SLA: 3 dias     |  | Sem SLA         |      |
| | [...menu]       |  | [...menu]       |  | [...menu]       |      |
| +-----------------+  +-----------------+  +-----------------+      |
+-------------------------------------------------------------------+
```

### Resultado

A pagina passara de um simples CRUD de workflows para um hub completo de governanca de aprovacoes, com visibilidade de aprovacoes pendentes, metricas, edicao inline, e fluxo visual dos niveis de aprovacao.

### Secao Tecnica

- A migracao SQL adicionara 4 colunas com valores default para nao quebrar dados existentes
- O `is_default` sera gerenciado via transacao: ao setar um workflow como padrao, os outros sao atualizados para `false`
- Aprovacoes pendentes serao buscadas com join em `policies` para exibir titulo da politica
- O componente `WorkflowStepsPreview` usara flex com setas CSS entre badges de nivel
- O dialog de aprovacao tera `Textarea` obrigatoria para rejeicao e opcional para aprovacao
