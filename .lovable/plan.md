

# Plano: Edição Inline de Requisitos no Diagnóstico

## Contexto

Atualmente, os controles de frameworks padrão (NIST, ISO, BCB) são read-only no banco — a política RLS só permite UPDATE em controles de frameworks customizados (`is_custom = true`). O usuário quer editar qualquer campo (nome, descrição, categoria, peso, criticidade, exemplo de evidência, exemplo de implementação) diretamente do card expandido no Diagnóstico.

## Alterações

### 1. Migração SQL — Permitir UPDATE em controles padrão

Atualizar a RLS policy `Users can update controls in custom frameworks` para permitir que membros autenticados de qualquer organização possam editar **qualquer controle que consigam visualizar** (padrão ou custom):

```sql
DROP POLICY "Users can update controls in custom frameworks" ON controls;
CREATE POLICY "Users can update controls"
ON controls FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);
```

### 2. Novo componente `EditControlDialog`

Criar `src/components/diagnostico/EditControlDialog.tsx`:
- Dialog modal com campos editáveis: **código**, **nome**, **descrição**, **categoria**, **peso** (slider 1-3), **criticidade** (select: baixo/medio/alto/critico), **exemplo de evidência**, **exemplo de implementação**, **motivo do peso**
- Recebe o `Control` como prop e um callback `onSaved`
- Faz `supabase.from('controls').update(...)` diretamente
- Invalida a query `['controls']` após salvar

### 3. Atualizar `ControlCardExpanded.tsx`

- Adicionar botão de edição (ícone `Edit2`) no header do card, ao lado do botão de expandir
- Ao clicar, abre o `EditControlDialog` com os dados do controle
- Após salvar, o card reflete as alterações automaticamente via invalidação do React Query

### 4. Hook de mutação (inline no dialog)

Usar `useMutation` do TanStack para o update, com `onSuccess` invalidando `['controls']`.

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/diagnostico/EditControlDialog.tsx` | **Criar** — dialog de edição |
| `src/components/diagnostico/ControlCardExpanded.tsx` | **Editar** — adicionar botão Edit2 + integrar dialog |
| Migração SQL | **Executar** — atualizar RLS policy |

## Resumo
- 1 migração SQL (relaxar RLS de UPDATE)
- 1 arquivo novo (EditControlDialog)
- 1 arquivo editado (ControlCardExpanded)

