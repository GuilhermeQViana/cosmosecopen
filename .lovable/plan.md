
## Melhorar Visualizacao dos Sub-Feature Cards

### Problema
Os mini-cards dentro da area expandida estao em grid 2 colunas dentro de um card ja estreito, causando texto quebrado, icones apertados e badges sem espaco. A experiencia visual fica confusa.

### Solucao

Redesenhar o `SubFeatureCard` e o layout da area expandida em `PlatformSection.tsx`:

1. **Layout da area expandida**: Mudar de `grid-cols-2` fixo para `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` quando o card pai tiver espaco (nos cards da fileira de 3), e manter `grid-cols-1 sm:grid-cols-2` para os cards da fileira de 2. Adicionar `gap-4` em vez de `gap-3`.

2. **Sub-feature card redesenhado**:
   - Icone e titulo na mesma linha com layout horizontal
   - Descricao com `line-clamp-2` para manter altura uniforme
   - Badges com padding maior e fonte legivel (`text-xs` em vez de `text-[10px]`)
   - Borda lateral colorida (left border accent) de 2px na cor do modulo para reforcar a identidade visual
   - Hover com leve scale e elevacao (`hover:scale-[1.02] hover:shadow-md`)
   - Padding aumentado de `p-4` para `p-5`

3. **Altura minima nos cards**: Adicionar `min-h-[140px]` para garantir proporcoes uniformes entre os sub-cards, evitando que uns fiquem muito menores que outros.

4. **Espacamento da area expandida**: Aumentar `mt-6 pt-6` para `mt-8 pt-8` e adicionar um titulo sutil como "Funcionalidades" antes do grid.

### Detalhes tecnicos

**Arquivo alterado**: `src/components/landing/PlatformSection.tsx`

Alteracoes no `SubFeatureCard`:
- Trocar `rounded-xl border p-4` por `rounded-xl border-l-2 border p-5 min-h-[140px]` com a borda esquerda na cor do modulo
- Aumentar o icone de `w-8 h-8` para `w-10 h-10` e o icone interno de `w-4 h-4` para `w-5 h-5`
- Badges de `text-[10px] px-2 py-0` para `text-xs px-2.5 py-0.5`
- Adicionar `hover:scale-[1.02] hover:shadow-md` com transicao suave

Alteracoes no `CollapsibleContent`:
- Grid responsivo: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- Titulo "Funcionalidades" com icone antes do grid
- Maior espacamento vertical
