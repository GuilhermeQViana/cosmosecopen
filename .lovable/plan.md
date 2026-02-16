
## Redesign dos Sub-Feature Cards - Estilo GRC Moderno com Glassmorphism

### Alteracoes no arquivo `src/components/landing/PlatformSection.tsx`

**1. Grid da area expandida (linhas 324)**
- Aumentar gap de `gap-4` para `gap-5`
- Manter grid `grid-cols-1 sm:grid-cols-2` responsivo

**2. SubFeatureCard completamente redesenhado (linhas 336-363)**

Mudancas visuais:
- **Fundo glassmorphism**: `bg-white/[0.03] dark:bg-white/[0.04] backdrop-blur-md` com borda sutil `border-white/[0.08]`
- **Borda lateral**: Manter o accent de 2px na esquerda mas com `border-l-[3px]` para mais presenca
- **Padding**: Aumentar de `p-5` para `p-6` para mais respiro interno
- **Altura minima**: Manter `min-h-[140px]`
- **Hover**: Glassmorphism intensificado `hover:bg-white/[0.06]` + `hover:border-white/[0.12]` + sombra com cor do modulo (`hover:shadow-lg`)

Hierarquia tipografica:
- **Icone**: Reduzir container de `w-10 h-10` para `w-9 h-9` e icone de `w-5 h-5` para `w-4.5 h-4.5` (usar `w-[18px] h-[18px]`). Manter cor brilhante do modulo
- **Titulo**: Mudar de `text-sm font-semibold` para `text-[13px] font-medium tracking-wide` - mais refinado
- **Descricao**: Reduzir `leading` para `leading-snug` (altura de linha mais compacta), manter `text-xs`

Badges pill:
- Formato pill com `rounded-full` (ja e o padrao do Badge)
- Reduzir para `text-[11px] px-2.5 py-0.5`
- Background mais sutil: usar `bg-{cor}/5` em vez de `bg-{cor}/10`
- Posicionar na parte inferior com `mt-auto` usando flex column no card

**3. Estrutura do card com flex column**
```
flex flex-col → icone+titulo (row) → descricao → spacer (flex-1) → badges (mt-auto)
```
Isso garante que os badges sempre fiquem no fundo do card independente do tamanho da descricao.

### Resumo visual esperado

Cada sub-card tera:
- Fundo semi-transparente com efeito glass
- Borda lateral colorida de 3px
- Icone pequeno e brilhante ao lado do titulo em peso medio
- Descricao compacta com linha reduzida
- Badges pill discretos alinhados na base
- Espacamento generoso entre cards (gap-5)
