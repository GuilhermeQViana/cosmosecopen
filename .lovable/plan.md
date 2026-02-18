

# Adicionar card flutuante "BCB/CMN" na ilustracao do Hero

## Alteracao

Adicionar um novo card flutuante no estilo glassmorphism (identico aos existentes "ISO 27001", "NIST CSF" e "98% Score") com o texto "BCB/CMN" na ilustracao orbital do `HeroSection.tsx`.

## Detalhes tecnicos

- **Arquivo**: `src/components/landing/HeroSection.tsx`
- Adicionar um novo `<div>` no bloco de "Floating glassmorphism cards" da funcao `HeroIllustration`
- Posicionar no canto superior esquerdo (ex: `top-[18%] left-[5%]`) para nao sobrepor os cards existentes
- Usar o mesmo estilo dos demais cards: `bg-card/70 backdrop-blur-md border border-primary/20 shadow-lg animate-float-slow`
- Cor do texto em `text-primary` para manter consistencia com o tema cosmico
- Adicionar um `animationDelay` diferente dos demais (ex: `4.5s`) para variar o ritmo da animacao

