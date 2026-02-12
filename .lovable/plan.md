

## Reestruturar Editor de Politicas - Implementacao

### Arquivos a criar/modificar

**1. NOVO: `src/components/politicas/PolicyStatusBar.tsx`**
- Barra de status inferior com contagem de palavras/caracteres
- Indicador de versao, tempo desde ultima edicao, status de salvamento

**2. ATUALIZAR: `src/components/politicas/PolicyEditorToolbar.tsx`**
- Adicionar tooltips em todos os botoes usando `TooltipProvider`/`Tooltip`
- Adicionar botoes de imagem (`ImageIcon`) e linha horizontal (`Minus`)
- Toolbar com `sticky top-0 z-10` para ficar fixa durante scroll

**3. ATUALIZAR: `src/components/politicas/PolicyMetadataPanel.tsx`**
- Remover campo titulo duplicado (titulo ja esta inline no header)
- Reordenar: Status primeiro, depois Categoria, Descricao
- Campos secundarios (datas, tags) dentro de `Collapsible` para economizar espaco

**4. REESCREVER: `src/pages/PoliticaEditor.tsx`**
- Substituir grid CSS fixo por `ResizablePanelGroup` horizontal com handle arrastavel
- Painel editor: default 70%, min 50%
- Painel sidebar: default 30%, com botao para colapsar/expandir usando estado local
- Sidebar com tabs por icones (`Settings`, `Link2`, `History`, `MessageSquare`) com tooltips
- Header com breadcrumb (`Politicas > Central > [Titulo]`)
- Titulo editavel inline no header (manter)
- Integrar `PolicyStatusBar` no rodape do painel do editor
- Placeholder atualizado: "Comece a escrever ou use a IA para gerar conteudo..."
- Garantir `relative z-20 pointer-events-auto` em todos os containers de input para interatividade sobre fundos animados

### Garantias de interatividade
- Todos os inputs, selects, popovers e calendarios terao `pointer-events-auto` e `z-index` adequado
- ResizablePanel usa `overflow-auto` para scroll interno
- Sidebar colapsavel via botao toggle (nao desaparece, apenas esconde)

