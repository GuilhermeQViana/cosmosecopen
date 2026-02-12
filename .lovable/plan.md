

## Aprovadores Dinamicos com Area/Departamento

### O que muda

Atualmente o workflow suporta no maximo 2 niveis fixos (colunas `level1_approver_id`, `level2_approver_id`). Vamos substituir esse modelo rigido por um sistema flexivel que permite N aprovadores, cada um com sua area/departamento.

### Mudancas no Banco de Dados

**Nova coluna JSONB** em `policy_workflows`:
- `approvers` (jsonb, default '[]') - Array de objetos com a estrutura:

```text
[
  { "level": 1, "approver_id": "uuid-ou-null", "department": "Tecnologia da Informacao" },
  { "level": 2, "approver_id": "uuid-ou-null", "department": "Juridico" },
  { "level": 3, "approver_id": "uuid-ou-null", "department": "Diretoria" }
]
```

As colunas antigas (`level1_role`, `level1_approver_id`, `level2_role`, `level2_approver_id`) serao mantidas para compatibilidade mas nao serao mais usadas pela interface.

### Mudancas nos Arquivos

**1. `src/hooks/usePolicyWorkflows.ts`**
- Adicionar tipo `WorkflowApprover` com campos `level`, `approver_id`, `department`
- Atualizar tipo `PolicyWorkflow` com campo `approvers: WorkflowApprover[]`
- Na query, parsear o campo JSONB automaticamente
- Atualizar mutations de create/update/duplicate para salvar o array `approvers` e sincronizar `approval_levels` com o tamanho do array

**2. `src/pages/PolicyWorkflows.tsx`**
- Substituir o seletor fixo "1 ou 2 niveis" por um sistema dinamico de aprovadores
- No dialog de criacao/edicao, adicionar:
  - Lista de aprovadores com botao "+ Adicionar Aprovador"
  - Cada aprovador tera: campo de selecao do membro, campo de texto para Area/Departamento, e botao de remover
  - Limite de ate 5 niveis
- Nos cards de workflow, exibir nomes e areas dos aprovadores
- O campo `approval_levels` sera calculado automaticamente pelo tamanho do array

**3. `src/components/politicas/WorkflowStepsPreview.tsx`**
- Receber array de `approvers` em vez de apenas `levels: number`
- Exibir nome do aprovador e area em cada step (quando disponivel)
- Manter modo compacto para os cards

### Layout do Dialog (Novo)

```text
+------------------------------------------+
| Editar Workflow                        X |
+------------------------------------------+
| Nome do Workflow                         |
| [Politica de ciber                     ] |
|                                          |
| Descricao (opcional)                     |
| [                                      ] |
|                                          |
| SLA (dias)        Notificar [ON]         |
| [11           ]                          |
|                                          |
| Aprovadores                              |
| +--------------------------------------+ |
| | Nivel 1                         [x]  | |
| | Aprovador: [Guilherme Viana     v]   | |
| | Area:      [Tecnologia da Informacao]| |
| +--------------------------------------+ |
| | Nivel 2                         [x]  | |
| | Aprovador: [Qualquer Admin      v]   | |
| | Area:      [Juridico               ] | |
| +--------------------------------------+ |
| [+ Adicionar Aprovador]                  |
|                                          |
| Workflow padrao                    [OFF] |
|                                          |
| [        Salvar Alteracoes             ] |
+------------------------------------------+
```

### Secao Tecnica

- A migracao SQL adicionara a coluna `approvers JSONB DEFAULT '[]'` e populara dados existentes migrando os valores de `level1/level2` para o novo formato JSON
- O `WorkflowStepsPreview` aceitara tanto `levels: number` (retrocompatibilidade) quanto `approvers: WorkflowApprover[]` (novo formato)
- O `approval_levels` continuara sendo salvo como numero inteiro (derivado do tamanho do array) para manter compatibilidade com `policy_approvals`
- Lista de departamentos sugeridos via datalist HTML (nao bloqueante - aceita texto livre): TI, Juridico, Compliance, RH, Financeiro, Diretoria, Operacoes, Seguranca
