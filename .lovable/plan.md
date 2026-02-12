

## Adicionar Agendamento de Reavaliacao no Detalhe do Fornecedor

### Objetivo
Adicionar um botao "Agendar Reavaliacao" no painel lateral do fornecedor (VendorDetailSheet) com um dialog inline para selecionar a data. Ao salvar, a data sera persistida no campo `next_assessment_date` do fornecedor e refletida automaticamente na pagina de Agenda (`/vrm/agenda`).

### Alteracoes

**Arquivo:** `src/components/fornecedores/VendorDetailSheet.tsx`

1. Importar `Calendar as CalendarUI` de `@/components/ui/calendar`, `Dialog` e componentes relacionados, `useUpdateVendor`, `format` do date-fns, e o icone `CalendarClock`
2. Adicionar estados: `scheduleOpen` (boolean), `selectedDate` (Date), `isScheduling` (boolean)
3. Adicionar um novo botao na area de acoes: **"Reavaliacao"** com icone `CalendarClock`
4. Criar um Dialog simples (igual ao da agenda) com:
   - Titulo: "Agendar Reavaliacao"
   - Descricao com nome do fornecedor
   - Calendario para selecionar data (desabilitando datas passadas)
   - Botoes Cancelar e Agendar
5. No submit, chamar `useUpdateVendor` com `{ id: vendor.id, next_assessment_date: formato-yyyy-MM-dd }`
6. Exibir a data da proxima reavaliacao na secao de Contrato (se existir), mostrando "Proxima reavaliacao: dd de MMMM de yyyy"

### Como reflete na Agenda
A pagina `/vrm/agenda` usa o componente `VendorReassessmentSchedule` que ja le o campo `next_assessment_date` de todos os fornecedores via `useVendors()`. Como ambos usam o mesmo hook React Query, ao salvar a data no detalhe do fornecedor, o cache sera invalidado e a agenda atualizara automaticamente -- sem nenhuma alteracao necessaria na pagina de agenda.

### Detalhes Tecnicos
- Reutilizar a mesma logica de agendamento que ja existe em `VendorReassessmentSchedule` (calcular data sugerida baseada na criticidade)
- O Dialog sera auto-contido dentro do `VendorDetailSheet`, sem criar componente separado
- Apenas 1 arquivo precisa ser alterado: `src/components/fornecedores/VendorDetailSheet.tsx`
