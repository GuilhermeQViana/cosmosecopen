

# Plano: Campo de Resumo da Situação por Controle

## Objetivo

Adicionar um campo de texto editável "Resumo da Situação" em cada controle expandido no diagnóstico, permitindo ao usuário registrar notas sobre o estado atual de conformidade daquele controle.

## Análise

O campo `observations` já existe na tabela `assessments` e no tipo `Assessment`, mas **não é exibido nem editável** no `ControlCardExpanded`. O `onSave` já aceita `observations` como parâmetro opcional. Portanto, não é necessária nenhuma migração SQL — basta expor o campo na UI.

## Alterações

### 1. Editar `src/components/diagnostico/ControlCardExpanded.tsx`

- Adicionar estado local `observations` (inicializado com `assessment?.observations`)
- Sincronizar via `useEffect` como já é feito com `maturityLevel`
- Exibir um `Textarea` com label "Resumo da Situação" na seção expandida, logo após a descrição do controle e antes das tabs
- Marcar `hasChanges = true` quando o texto for alterado
- Passar `observations` no `handleSave` junto com `maturityLevel`

A área de texto terá placeholder "Descreva brevemente a situação atual deste controle..." e será exibida apenas quando o card está expandido.

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/diagnostico/ControlCardExpanded.tsx` | **Editar** — adicionar campo observations na UI |

Nenhuma migração SQL necessária — o campo `observations` já existe no banco.

