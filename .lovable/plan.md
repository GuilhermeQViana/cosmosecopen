

## Correcao Definitiva: Campos Bloqueados no Editor de Politicas

### Diagnostico Final

Testei o editor via automacao de browser e **todos os campos funcionam corretamente** no codigo atual. O problema que voce esta enfrentando e causado pelo **cache do navegador** que mantem uma versao antiga do componente `PageTransition.tsx` - a versao antiga "congelava" os filhos impedindo a interacao.

Para resolver isso de forma definitiva e impedir que o problema volte a ocorrer, vou **remover completamente** o `PageTransition` wrapper do `PolicyLayout` e substituir por uma animacao CSS pura que nao interfere com o estado React dos componentes filhos.

### Solucao

**1. Remover `PageTransition` do `PolicyLayout.tsx`**
- Substituir `<PageTransition><Outlet /></PageTransition>` por `<Outlet />` direto
- Aplicar animacao CSS de entrada diretamente no container `<main>` usando classes Tailwind
- Isso elimina qualquer possibilidade de o wrapper de transicao interferir com inputs

**2. Remover `GlobalCosmicLoader` do `PolicyLayout.tsx`**
- O `GlobalCosmicLoader` cria um overlay `fixed inset-0 z-[99]` que, mesmo com `pointer-events-none`, pode interferir em alguns navegadores
- Substituir por uma barra de progresso simples no topo (sem overlay full-screen)

**3. Garantir z-index no `<main>`**
- Manter `relative z-10` no `<main>` para ficar acima do `StarField` (z-0)

### Detalhes Tecnicos

```text
Arquivos a modificar:

1. src/components/layout/PolicyLayout.tsx
   - Remover import de PageTransition e GlobalCosmicLoader
   - Linha 106: trocar <PageTransition><Outlet /></PageTransition> por <Outlet />
   - Linha 104: remover <GlobalCosmicLoader />
   - Adicionar classe 'animate-in' ao main

2. src/index.css
   - Adicionar keyframe 'animate-in' simples (fade + slide up) que nao requer estado React
```

Esta abordagem elimina completamente a dependencia do `PageTransition` no fluxo de politicas, garantindo que nenhum wrapper React possa interferir com a interatividade dos campos. A animacao de entrada sera feita via CSS puro, sem gerenciamento de estado.

