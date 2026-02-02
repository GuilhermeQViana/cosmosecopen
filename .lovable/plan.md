
# Plano: Melhorias de Usabilidade em Frameworks Customizados

## Problemas Identificados

### Situacao Atual
A gestao de frameworks customizados esta escondida em **Configuracoes > Frameworks**, dificultando o acesso. A pagina de selecao de framework (`/selecionar-framework`) nao oferece acoes rapidas para criar, editar ou excluir frameworks customizados.

### Lacunas de UX
| Problema | Impacto |
|----------|---------|
| Sem botao "Criar Framework" na pagina de selecao | Usuario precisa saber que existe a aba em Configuracoes |
| Sem acoes de editar/excluir nos cards | Usuario tem que navegar para outra secao |
| Falta indicador visual de "framework vazio" | Confusao quando framework tem 0 controles |
| Fluxo de importacao de controles desconexo | Apos criar, usuario nao sabe como adicionar controles |

---

## Melhorias Propostas

### 1. Adicionar Botoes de Acao na Pagina de Selecao

**Arquivo:** `src/pages/SelecionarFramework.tsx`

Adicionar na pagina de selecao:
- Botao "**+ Novo Framework**" no header
- Menu de contexto (dropdown) nos cards de frameworks customizados com:
  - Editar metadados
  - Gerenciar controles
  - Importar CSV
  - Excluir framework
- Badge visual para frameworks sem controles ("Vazio - adicione controles")

```text
┌─────────────────────────────────────────────────────────────┐
│  Selecione um Framework           [+ Novo Framework]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ BCB/CMN      │  │ ISO 27001    │  │ NIST CSF     │      │
│  │ 49 controles │  │ 93 controles │  │ 75 controles │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐                                          │
│  │ SOC 2        │ ⋮  <- Menu de acoes                      │
│  │ Custom       │     [Editar]                             │
│  │ 0 controles  │     [Gerenciar Controles]                │
│  │ ⚠ Vazio      │     [Importar CSV]                       │
│  └──────────────┘     [Excluir]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Mover Dialogs para Serem Reutilizaveis

Os componentes `CreateFrameworkDialog` e `FrameworkControlsManager` ja existem em `src/components/configuracoes/`. Vamos reutiliza-los na pagina de selecao.

### 3. Adicionar Navegacao Direta para Gerenciamento

Apos criar framework customizado, oferecer opcao de:
- Ir direto para importar controles (CSV)
- Adicionar controles manualmente
- Voltar para selecao

### 4. Melhorar Feedback Visual nos Cards

- **Badge "Vazio"** quando `controlCount === 0`
- **Tooltip** explicando como adicionar controles
- **Destaque visual** para frameworks customizados (borda roxa ja existe)

### 5. Adicionar Link Rapido na Sidebar

No dropdown de framework da sidebar, adicionar opcao:
- "Gerenciar Frameworks Customizados" -> abre `/configuracoes?tab=frameworks`

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/SelecionarFramework.tsx` | Adicionar botao criar, menu de acoes, badge vazio |
| `src/components/layout/AppSidebar.tsx` | Adicionar link "Gerenciar Frameworks" no dropdown |
| `src/components/configuracoes/CreateFrameworkDialog.tsx` | Adicionar callback `onSuccessWithNav` para redirecionar |

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/configuracoes/FrameworkActionsMenu.tsx` | Menu dropdown de acoes (editar, gerenciar, excluir) |

---

## Detalhes de Implementacao

### 1. SelecionarFramework.tsx - Adicionar Acoes

```text
Imports necessarios:
- CreateFrameworkDialog
- FrameworkControlsManager
- AlertDialog (para confirmacao de exclusao)
- DropdownMenu (para menu de acoes)
- useDeleteCustomFramework (hook)

Estados necessarios:
- createDialogOpen: boolean
- editingFramework: CustomFramework | null
- managingFramework: CustomFramework | null
- deleteFrameworkId: string | null

Logica de exclusao:
- Confirmacao via AlertDialog
- Usar useDeleteCustomFramework hook
- Invalidar queries apos exclusao
```

### 2. Badge "Vazio" para Frameworks sem Controles

Quando `controlCount === 0` e `is_custom === true`:
```text
┌────────────────────┐
│ ⚠ Adicione         │
│   controles        │
└────────────────────┘
```

Estilos: `bg-amber-500/10 text-amber-600 border-amber-500/30`

### 3. Menu de Acoes no Card

Posicionar no canto superior direito do card (apenas para `is_custom === true`):

Opcoes:
- **Editar** -> abre CreateFrameworkDialog com dados preenchidos
- **Gerenciar Controles** -> abre FrameworkControlsManager inline ou navega
- **Importar CSV** -> navega para Configuracoes > Frameworks > Importar
- **Excluir** -> abre AlertDialog de confirmacao

### 4. Fluxo Pos-Criacao

Apos criar novo framework, exibir Dialog de sucesso com opcoes:
- "Importar Controles (CSV)" -> vai para importacao
- "Adicionar Controle Manualmente" -> vai para gerenciador
- "Selecionar Framework" -> fecha e seleciona o novo

---

## Fluxo de Usuario Melhorado

```text
Pagina de Selecao
       │
       ├─► Clicar em "Novo Framework"
       │         │
       │         ▼
       │   Dialog de Criacao
       │         │
       │         ├─► Salvar -> Dialog "E agora?"
       │         │                │
       │         │                ├─► Importar CSV
       │         │                ├─► Adicionar Manualmente
       │         │                └─► Selecionar e Usar
       │         │
       │         └─► Cancelar -> Volta
       │
       ├─► Clicar em card customizado
       │         │
       │         └─► Seleciona e vai para Dashboard
       │
       └─► Clicar em menu (⋮) do card
                 │
                 ├─► Editar -> Dialog preenchido
                 ├─► Gerenciar -> Lista de controles
                 ├─► Importar CSV -> Tela de importacao
                 └─► Excluir -> Confirmacao -> Remove
```

---

## Resultado Esperado

1. Usuario pode criar framework direto na pagina de selecao
2. Acoes de editar/excluir acessiveis sem sair da pagina
3. Feedback visual claro para frameworks vazios
4. Fluxo guiado apos criacao de novo framework
5. Acesso rapido ao gerenciamento via sidebar
