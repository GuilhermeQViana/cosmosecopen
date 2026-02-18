

# Atualizar HeroSection: texto e ilustracao

## Alteracoes

### 1. Remover referencia a BCB/CMN 4.893
A linha de trust indicators sera atualizada de:
```
NIST CSF 2.0 • ISO 27001:2022 • BCB/CMN 4.893 • Frameworks Custom • Consultoria Especializada
```
Para:
```
NIST CSF 2.0 • ISO 27001:2022 • Frameworks Custom • Consultoria Especializada
```

### 2. Criar ilustracao do lado direito
O layout do hero passara de centralizado para **duas colunas** (texto a esquerda, ilustracao a direita):

- **Coluna esquerda**: titulo, subtitulo, botoes CTA e trust indicators (alinhados a esquerda)
- **Coluna direita**: uma ilustracao SVG/CSS animada no tema cosmico representando um dashboard de seguranca com elementos como:
  - Um escudo estilizado com efeito de glow
  - Circulos orbitais animados representando frameworks/modulos
  - Icones flutuantes (shield, lock, chart) com animacao sutil
  - Gradientes cosmicos (primary/secondary) consistentes com a identidade visual

### Detalhes tecnicos

- **Arquivo editado**: `src/components/landing/HeroSection.tsx`
- A ilustracao sera construida com elementos React + CSS (nao imagem externa), usando icones do Lucide e efeitos de glassmorphism/glow ja presentes no design system
- Layout responsivo: em mobile, a ilustracao aparece abaixo do texto; em desktop, lado a lado
- As animacoes usarao as classes Tailwind existentes (`animate-pulse-glow`, `animate-float-slow`) para manter consistencia

