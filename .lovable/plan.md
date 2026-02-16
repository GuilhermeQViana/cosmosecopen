

## Redesign da PlatformSection na Landing Page

### Problema atual
Os 5 cards de modulos estao em uma grade 5 colunas com proporcoes apertadas, todos com a mesma aparencia visual, e a expansao mostra apenas screenshots (que so existem para GRC). Nao ha diferenciacao visual por modulo nem sub-funcionalidades detalhadas.

### Solucao proposta

Redesenhar a PlatformSection com:

1. **Layout responsivo em 3 + 2 colunas** - Primeira fileira com 3 cards (GRC, VRM, Politicas), segunda fileira com 2 cards centralizados (IA, Consultoria). Proporcoes mais confortaveis para leitura.

2. **Cores distintas por modulo** - Cada modulo tera sua propria cor de destaque no icone, borda hover e badges:
   - GRC: Azul primary (`primary`)
   - VRM: Cyan secondary (`secondary`)
   - Politicas: Violeta (`violet-500`)
   - IA: Gradiente primary-to-secondary
   - Consultoria: Esmeralda (`emerald-500`)

3. **Sub-funcionalidades expandiveis** - Ao clicar na seta para baixo, cada card expande revelando um grid de sub-feature cards (similar ao tour), cada um com icone, titulo, descricao curta e badges coloridos. Reutilizar os dados detalhados que ja existem na pagina `/tour`.

4. **Badges coloridos por modulo** - Os highlights de cada sub-funcionalidade usarao a cor do modulo pai (nao todos azul).

### Detalhes tecnicos

**Arquivo principal alterado**: `src/components/landing/PlatformSection.tsx`

- Reestruturar os dados `platforms[]` para incluir `subFeatures` com icone, titulo, descricao e highlights (reutilizando dados do ConhecaCosmoSec)
- Adicionar propriedade `color` a cada plataforma (classes Tailwind para borda, bg, text)
- Mudar grid de `xl:grid-cols-5` para `lg:grid-cols-3` na primeira fileira + segunda fileira com 2 cards centralizados (ou usar layout flex com wrap)
- Na expansao, em vez do `ModuleScreenshotGallery`, renderizar um grid 2x3 de mini-cards com icone + titulo + descricao + badges coloridos
- Cada mini-card tera chevron para expandir descricao detalhada inline
- Manter a galeria de screenshots do GRC como bonus dentro da area expandida

**Estrutura do card expandido**:

```text
+------------------------------------------+
| [icone colorido]                         |
| Titulo do Modulo                         |
| Descricao                                |
| * Feature 1                              |
| * Feature 2                              |
| [v Ver Detalhes]                         |
+------------------------------------------+
         |  (expande para)
+------------------------------------------+
| +----------+ +----------+ +----------+  |
| | Sub 1    | | Sub 2    | | Sub 3    |  |
| | desc     | | desc     | | desc     |  |
| | [badges] | | [badges] | | [badges] |  |
| +----------+ +----------+ +----------+  |
| +----------+ +----------+ +----------+  |
| | Sub 4    | | Sub 5    | | Sub 6    |  |
| +----------+ +----------+ +----------+  |
+------------------------------------------+
```

**Mapa de cores (classes Tailwind)**:

```text
GRC:         border-blue-500/30  bg-blue-500/10  text-blue-400
VRM:         border-cyan-500/30  bg-cyan-500/10  text-cyan-400
Politicas:   border-violet-500/30 bg-violet-500/10 text-violet-400
IA:          border-amber-500/30 bg-amber-500/10 text-amber-400
Consultoria: border-emerald-500/30 bg-emerald-500/10 text-emerald-400
```

**Nenhum arquivo novo sera criado** - toda a logica fica dentro do PlatformSection.tsx redesenhado, reutilizando os componentes UI existentes (Card, Collapsible, Badge).

