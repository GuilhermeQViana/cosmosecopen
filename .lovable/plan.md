

## Criar dois Pipelines: Status e Ciclo de Vida

### Objetivo
Exibir dois pipelines visuais no dashboard VRM, um acima do outro:
1. **Pipeline de Status** - agrupando fornecedores pelo campo `status`
2. **Pipeline de Ciclo de Vida** - agrupando fornecedores pelo campo `lifecycle_stage`

### Alteracoes

**Arquivo:** `src/components/fornecedores/VendorPipelineFunnel.tsx`

1. Criar dois arrays de configuracao:
   - `STATUS_STAGES`: `Inativo -> Em Avaliacao -> Ativo -> Bloqueado` (ja existe)
   - `LIFECYCLE_STAGES`: `Inativo -> Prospecto -> Due Diligence -> Contratacao -> Reavaliacao -> Ativo -> Offboarding -> Bloqueado`

2. Renderizar dois blocos dentro do mesmo Card:
   - Primeiro bloco com label **"Status"** e o pipeline usando `v.status`
   - Segundo bloco com label **"Ciclo de Vida"** e o pipeline usando `v.lifecycle_stage`
   - Separador visual entre os dois (linha ou espacamento)

3. Cada bloco tera um subtitulo/badge indicativo (ex: "Status" e "Ciclo de Vida") para diferenciar claramente os dois pipelines

### Detalhes Tecnicos
- Reutilizar a mesma logica de contagem e renderizacao, apenas parametrizada pelo campo e array de estagios
- Extrair um sub-componente interno `PipelineRow` que recebe `stages`, `vendors`, `field` e `label` para evitar duplicacao de codigo
- Manter cores e layout existentes

