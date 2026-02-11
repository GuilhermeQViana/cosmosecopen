

## Corrigir Ordem do Pipeline de Fornecedores

### Problema
Os estágios do pipeline estão ordenados como um fluxo de ciclo de vida, mas o correto é que **quanto mais à direita, mais importante/crítico o status**. Além disso, alguns estágios intermediários (Contratação, Reavaliação) ficam ocultos quando vazios.

### Solução
Reordenar os estágios do **menos importante (esquerda) para o mais importante (direita)** e exibir todos os 8 estágios sempre visíveis:

```text
Inativo → Prospecto → Due Diligence → Contratação → Reavaliação → Ativo → Offboarding → Bloqueado
```

**Lógica da ordem:**
- **Inativo** (menor relevância, fornecedor encerrado)
- **Prospecto** (apenas candidato)
- **Due Diligence** (em avaliação inicial)
- **Contratação** (processo em andamento)
- **Reavaliação** (requer atenção, revisão periódica)
- **Ativo** (fornecedor operacional - alta importância)
- **Offboarding** (processo crítico de desligamento)
- **Bloqueado** (maior criticidade - risco ativo)

### Detalhes Técnicos
**Arquivo:** `src/components/fornecedores/VendorPipelineFunnel.tsx`

1. Reordenar o array `LIFECYCLE_STAGES` conforme a nova sequência de importância
2. Remover o filtro que oculta estágios com contagem zero - todos os estágios serão sempre visíveis para dar contexto completo do pipeline

