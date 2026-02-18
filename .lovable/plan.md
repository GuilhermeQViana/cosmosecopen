

# Substituir escudo central pela logo animada CosmoSec

## Alteracao

No componente `HeroSection.tsx`, substituir o icone `Shield` do centro da ilustracao pelo componente `CosmoSecLogo` (que ja existe em `src/components/ui/CosmoSecLogo.tsx` e possui orbitas animadas, estrela central e pontos de constelacao).

## Detalhes tecnicos

- **Arquivo**: `src/components/landing/HeroSection.tsx`
- Importar `CosmoSecLogo` no lugar do `Shield` central
- Substituir o bloco do escudo central (linhas ~50-58 aproximadamente) pelo componente `<CosmoSecLogo variant="icon" size="lg" showText={false} />` 
- Manter o container com glassmorphism e glow, ajustando o tamanho para acomodar a logo animada
- Remover a importacao de `Shield` do lucide-react se nao for mais utilizada

