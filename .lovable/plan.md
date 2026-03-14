

# Plano: Requisitos Focados na Avaliação de Fornecedores

## Contexto

A página `VendorRequisitos` já permite criar/editar/excluir requisitos customizados por domínio (SI, CYBER, PRIV, BCN). Porém faltam funcionalidades que tornem os requisitos mais úteis e conectados ao fluxo de avaliação.

## Melhorias Propostas

### 1. Pré-visualização do Impacto no Score
Adicionar na listagem de requisitos uma coluna/indicador mostrando **como cada peso afeta o score final**. Exibir um mini-resumo no header de cada domínio: "Peso total do domínio: X" para que o gestor entenda a distribuição.

**Arquivo:** `src/pages/VendorRequisitos.tsx`

### 2. Reordenação por Drag & Drop
Permitir reordenar requisitos dentro de cada domínio via drag-and-drop, persistindo o `order_index` no banco. Atualmente a ordem é fixa.

**Arquivo:** `src/pages/VendorRequisitos.tsx` — usar a mesma abordagem de `DraggableControlList` já existente no projeto.

### 3. Duplicar Requisito Padrão como Customizado
Os requisitos padrão (sem `organization_id`) não podem ser editados. Adicionar botão "Duplicar como customizado" que cria uma cópia editável vinculada à organização, permitindo ajustar nome, peso e descrição.

**Arquivo:** `src/pages/VendorRequisitos.tsx`

### 4. Indicador de Uso em Avaliações
Mostrar em cada requisito quantas avaliações já o utilizaram (contagem de `vendor_assessment_responses` com aquele `requirement_id`). Requisitos muito usados ficam protegidos contra exclusão acidental.

**Arquivo:** `src/pages/VendorRequisitos.tsx` + `src/hooks/useVendorRequirements.ts` (nova query)

### 5. Exportar/Importar Requisitos (CSV)
Permitir exportar a lista de requisitos como CSV e importar requisitos customizados em lote, seguindo o padrão já existente em `ImportControlsCSV`.

**Arquivos:** novo componente `src/components/fornecedores/ImportRequirementsCSV.tsx` + `src/pages/VendorRequisitos.tsx`

### 6. Filtros e Busca
Adicionar campo de busca por nome/código e filtros por peso e status (ativo/inativo) no topo da listagem.

**Arquivo:** `src/pages/VendorRequisitos.tsx`

## Resumo de Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/VendorRequisitos.tsx` | Editar — adicionar peso total, duplicação, reordenação, filtros, indicador de uso |
| `src/hooks/useVendorRequirements.ts` | Editar — query de contagem de uso por requisito |
| `src/components/fornecedores/ImportRequirementsCSV.tsx` | Criar — import/export CSV |

Nenhuma migração SQL necessária — todas as tabelas e campos já existem.

