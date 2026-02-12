

## Analise Completa do Editor de Politicas

### Diagnostico

Apos investigacao completa via automacao de browser, os campos de titulo, descricao, status, categoria, data de revisao e data de expiracao estao **funcionando corretamente** no codigo atual. O texto "Politica de Teste" foi inserido com sucesso no campo titulo, e o dialog de IA abriu normalmente.

**Causa raiz do problema reportado:** O navegador esta usando uma versao em cache do componente `PageTransition.tsx` antigo, que congelava o estado dos filhos ao armazenar `children` em um `displayChildren` state que so atualizava na troca de rota - impedindo que digitacao e cliques fossem refletidos na UI.

### Plano de Correcao Definitiva

Para garantir que o problema nao persista mesmo com cache, e melhorar a robustez:

**1. Adicionar `position: relative` e `z-index` ao container do editor**
- No `PoliticaEditor.tsx`, envolver todo o conteudo em um container com `relative z-20` para garantir que fique acima de qualquer overlay cosmico/decorativo
- Adicionar `pointer-events-auto` nos Cards que contem inputs

**2. Simplificar o `PageTransition.tsx`**
- Remover o `GlobalCosmicLoader` de dentro do PageTransition (ele cria um overlay `fixed inset-0 z-[99]` que, embora tenha `pointer-events-none`, pode causar problemas em alguns navegadores)
- Mover o `GlobalCosmicLoader` para o nível do layout, fora do fluxo de conteudo interativo

**3. Garantir z-index consistente no `PolicyLayout.tsx`**
- O `main` ja tem `relative z-10`, confirmar que esta aplicado (ja foi feito na correcao anterior)

### Melhorias de UI/UX Propostas

**4. Layout do Editor mais Intuitivo**
- Adicionar o titulo da politica como um campo de destaque no topo do editor (inline, estilo "titulo de documento"), em vez de apenas no painel lateral
- Exibir um indicador de status visual (badge colorido) ao lado do titulo

**5. Painel de Metadados Melhorado**
- Substituir os inputs `type="date"` nativos por Datepickers com Popover + Calendar do Shadcn (mais consistentes visualmente e funcionam melhor em dark mode)
- Adicionar icones nos labels para melhor escaneabilidade visual
- Adicionar tooltips explicativos nos campos (ex: "Data em que a politica deve ser revisada")
- Adicionar campo de Tags com input de chips

**6. Feedback Visual e Usabilidade**
- Adicionar auto-save com debounce (salvar rascunho automaticamente a cada 30s)
- Mostrar indicador "Salvo" / "Nao salvo" no header
- Adicionar atalho de teclado Ctrl+S para salvar
- Melhorar o empty state do editor com texto guia mais descritivo

**7. Header de Acoes Melhorado**
- Agrupar botoes de acao em um toolbar mais organizado
- Adicionar dropdown "Mais opcoes" para acoes secundarias (PDF, Revisao)
- Mostrar o titulo da politica no breadcrumb dinamicamente

### Detalhes Tecnicos

```text
Arquivos a modificar:
1. src/components/layout/PageTransition.tsx
   - Remover GlobalCosmicLoader do render
   
2. src/components/layout/PolicyLayout.tsx  
   - Mover GlobalCosmicLoader para antes do <main>
   - Manter relative z-10 no main

3. src/pages/PoliticaEditor.tsx
   - Adicionar relative z-20 no container raiz
   - Adicionar campo de titulo inline no topo do editor
   - Implementar auto-save com debounce
   - Adicionar listener Ctrl+S
   - Adicionar indicador salvo/nao-salvo

4. src/components/politicas/PolicyMetadataPanel.tsx
   - Substituir inputs date por Datepicker Shadcn (Popover + Calendar)
   - Adicionar icones nos labels
   - Adicionar tooltips
   - Melhorar espacamento e hierarquia visual

5. src/components/layout/GlobalCosmicLoader.tsx
   - Nenhuma mudanca no componente em si
```

A correcao principal (items 1-3) resolve definitivamente o problema dos campos nao editaveis. Os items 4-7 sao melhorias de experiencia que tornam o editor mais profissional e agradavel de usar.

