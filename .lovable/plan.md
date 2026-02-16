
## Slides para Apresentacao - Assets para PowerPoint

Criar uma nova secao na pagina Brand Assets com slides de apresentacao prontos para download como imagens PNG em resolucao 1920x1080 (16:9), renderizados via Canvas. O usuario podera baixar cada slide individualmente e importar no PowerPoint como imagem de fundo editavel.

### Categorias de Slides

**1. Fundos de Apresentacao (4 variantes)**
- Fundo Deep Void puro com estrelas/constelacoes sutis
- Fundo com gradiente diagonal azul-cyan sutil
- Fundo com grid/linhas geometricas estilo cybersec
- Fundo claro (branco com detalhes azuis) para slides de dados

**2. Capas de Abertura (2 variantes)**
- **Para Empresas**: Logo CosmoSec centralizado + subtitulo "Plataforma Integrada de GRC e Gestao de Riscos" + area editavel para nome da empresa
- **Para Consultores**: Logo CosmoSec + subtitulo "Solucao para Consultores Independentes" + area para nome do consultor

**3. Capas de Transicao (3 variantes)**
- Slide com numero grande de secao (01, 02, 03...) + area para titulo
- Slide com icone centralizado + titulo abaixo
- Slide minimalista com linha decorativa e area para titulo

**4. Capas de Finalizacao (2 variantes)**
- Slide "Obrigado" com logo, contato e QR code placeholder
- Slide "Proximos Passos" com areas para 3 bullet points + CTA

### Implementacao Tecnica

**Arquivo editado**: `src/pages/BrandAssets.tsx`

**Abordagem**: Cada slide sera renderizado em um `<canvas>` oculto de 1920x1080. A funcao de desenho usara a Canvas 2D API para:
- Desenhar fundos com gradientes (`createLinearGradient`, `createRadialGradient`)
- Adicionar elementos decorativos (linhas, circulos, estrelas) via paths
- Carregar o logo SVG como imagem e posiciona-lo
- Renderizar texto com fontes do sistema (sans-serif como fallback para Space Grotesk)
- Exportar como PNG via `canvas.toBlob()`

**Funcao principal**: `generateSlide(type, variant)` que:
1. Cria/reutiliza um canvas 1920x1080
2. Desenha o fundo especifico da variante
3. Carrega e posiciona o logo SVG
4. Adiciona textos placeholder
5. Faz download como PNG

**Nova secao na UI**: Card com titulo "Slides para Apresentacao" contendo subsecoes:
- Grid de previews em miniatura (aspect-ratio 16:9)
- Cada preview mostra uma versao reduzida do slide
- Botao de download em cada preview
- Botao "Baixar Todos" que gera um zip (ou downloads sequenciais)

**Previews**: Usar canvas menores (384x216) para mostrar miniaturas de cada slide na pagina.

### Detalhes dos Slides

Cada slide PNG usara:
- Resolucao: 1920x1080 pixels
- Cores da paleta CosmoSec: #0B0E14, #2E5CFF, #00D4FF, #F8FAFC
- Logo carregado do SVG estatico existente
- Textos placeholder indicando onde editar no PPT (ex: "[Seu Titulo Aqui]")
- Elementos decorativos: linhas de constelacao, circulos orbitais, gradientes sutis

### Estrutura do Codigo

Criar um helper `src/lib/slide-generator.ts` com:
- `drawBackground(ctx, variant)` - desenha o fundo
- `drawLogo(ctx, x, y, size)` - carrega e posiciona o logo
- `drawText(ctx, text, x, y, options)` - renderiza texto com estilo
- `drawDecorations(ctx, variant)` - adiciona elementos visuais
- `generateSlide(canvas, type)` - orquestra tudo e exporta PNG

Na pagina `BrandAssets.tsx`:
- Adicionar nova secao entre "PNG Logo Completa" e "Paleta de Cores"
- Subsecoes com tabs: "Fundos", "Capas", "Transicao", "Finalizacao"
- Previews renderizados em canvas pequenos ao montar o componente
- Download individual de cada slide ao clicar

Total: ~11 slides diferentes para download, cobrindo todas as necessidades de uma apresentacao profissional.
