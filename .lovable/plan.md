

## Corrigir Pipeline para usar campo `status` ao invés de `lifecycle_stage`

### Problema
O pipeline está agrupando fornecedores pelo campo `lifecycle_stage`, mas os fornecedores Amazon e Google possuem `lifecycle_stage: "due_diligence"` enquanto seu `status` real é `"ativo"`. O pipeline deveria refletir o **status** atual do fornecedor.

### Solução
Alterar o `VendorPipelineFunnel.tsx` para usar o campo `status` dos fornecedores ao invés de `lifecycle_stage`. Os estágios do pipeline serão baseados nos valores possíveis de `status`: `ativo`, `inativo`, `em_avaliacao`, `bloqueado`.

### Nova ordem (menos para mais importante):
```text
Inativo → Em Avaliação → Ativo → Bloqueado
```

### Detalhes Técnicos
**Arquivo:** `src/components/fornecedores/VendorPipelineFunnel.tsx`

1. Substituir o array `LIFECYCLE_STAGES` por um array baseado nos valores de `VENDOR_STATUS` (`ativo`, `inativo`, `em_avaliacao`, `bloqueado`)
2. Alterar o filtro de `v.lifecycle_stage` para `v.status`
3. Manter cores distintas para cada status

