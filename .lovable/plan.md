

## Drag-and-Drop no Pipeline de Ciclo de Vida

### Objetivo
Permitir que o usuario mude o estagio do ciclo de vida de um fornecedor simplesmente arrastando o card de uma coluna para outra no pipeline existente (pagina `/vrm/fornecedores`, modo pipeline).

### Abordagem
Usar a API nativa de HTML5 Drag and Drop (sem dependencia extra) no componente `VendorPipeline.tsx`, que ja exibe os fornecedores em colunas por `lifecycle_stage`.

### Alteracoes

**Arquivo:** `src/components/fornecedores/VendorPipeline.tsx`

1. Tornar cada card de fornecedor **draggable** com `draggable="true"` e `onDragStart` armazenando o `vendor.id`
2. Tornar cada coluna de estagio uma **drop zone** com `onDragOver` (preventDefault) e `onDrop`
3. No `onDrop`, chamar `useUpdateVendor` para atualizar o campo `lifecycle_stage` do fornecedor com o valor do estagio da coluna de destino
4. Feedback visual: destacar a coluna de destino durante o arrasto (borda colorida ou fundo mais claro)
5. Exibir um toast de confirmacao apos a mudanca

**Arquivo:** `src/pages/Fornecedores.tsx`

- Nenhuma alteracao necessaria - o `VendorPipeline` ja recebe os vendors e sera auto-suficiente com o drag-and-drop

### Detalhes Tecnicos
- Usar `useRef` para armazenar o ID do fornecedor sendo arrastado
- Usar estado local para controlar qual coluna esta sendo destacada (highlight on hover)
- Chamar `useUpdateVendor().mutateAsync({ id, lifecycle_stage: newStage })` no drop
- O React Query invalidara automaticamente o cache apos o update, atualizando a visualizacao
- Animacao sutil de transicao com classes Tailwind (`transition-all`, `ring-2`, `ring-primary`)
