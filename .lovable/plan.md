
# Landing Page Enterprise - Estrutura SentinelOne com Visual CosmoSec

## Objetivo
Reestruturar a landing page com layout e hierarquia visual inspirados na SentinelOne, mantendo integralmente a identidade CosmoSec: paleta cosmica (Event Horizon, Nebula), tipografia (Space Grotesk, Inter), efeitos glassmorphism, animacoes de estrelas e gradientes.

---

## Nova Estrutura - 6 Secoes

```text
1. [Navbar]      Simplificado - Logo | Plataforma | Recursos | [CTA]
2. [Hero]        Centralizado, headline impactante, 2 CTAs, sem cards laterais
3. [Platform]    3 pilares interativos (GRC | VRM | IA) 
4. [Trust]       Badges de frameworks + Metricas animadas + Quote
5. [CTA]         Tour preview + Formulario de contato lado a lado
6. [FAQ]         6 perguntas essenciais em coluna unica
7. [Footer]      Mantido com ajustes
```

---

## Secao 1: Navbar Simplificada

**Arquivo:** `src/components/landing/Navbar.tsx`

Mudancas:
- Remover links de ancora (#modules, #frameworks, #features)
- Novo menu: "Plataforma" | "Recursos" | "Contato"
- 2 botoes: "Ver Tour" (outline) + "Falar com Especialista" (cosmic)
- Manter glassmorphism e tema toggle
- Mobile: menu hamburger com mesmos itens

---

## Secao 2: Hero Centralizado

**Arquivo:** `src/components/landing/HeroSection.tsx`

**Inspiracao SentinelOne:** Hero limpo, centralizado, sem elementos laterais

Mudancas:
- Remover grid lg:grid-cols-2 (layout de 2 colunas)
- Remover cards flutuantes do lado direito (dashboard simulado)
- Remover estatisticas do hero (mover para Trust)
- Remover badges de frameworks do hero (mover para Trust)

Novo layout:
- Container centralizado (text-center)
- Headline principal: tipografia maior, frase de impacto sobre o problema
- Subheadline: proposta de valor em 1-2 linhas
- 2 CTAs centralizados lado a lado: "Agendar Demo" (cosmic) | "Ver Plataforma" (outline)
- Manter efeitos de fundo (nebulas, orbs animados)
- Adicionar grid animado sutil como background extra

Copy sugerido:
```text
Headline: "Nao Gerencie Compliance. Domine."
Subheadline: "A plataforma GRC + VRM que une governanca de seguranca e gestao de terceiros em um so lugar."
```

---

## Secao 3: Platform Section (Novo Componente)

**Criar:** `src/components/landing/PlatformSection.tsx`

**Substitui:** ModulesSection + FeaturesSection

Design:
- Titulo centralizado: "Uma Plataforma. Seguranca Completa."
- 3 cards grandes lado a lado
- Hover: card expande levemente com glow e mostra mais detalhes
- Manter glassmorphism e gradientes CosmoSec

| Card | Titulo | Icone | Bullets |
|------|--------|-------|---------|
| 1 | GRC Frameworks | Shield | Diagnostico NIST/ISO/BCB, Risk Score, Matriz de Riscos |
| 2 | VRM Fornecedores | Building2 | 45+ requisitos, Radar de conformidade, Workflow aprovacao |
| 3 | IA Generativa | Sparkles | Planos de acao automaticos, Guias de implementacao |

Cada card:
- Icone com gradiente from-primary to-secondary
- 3-4 bullets curtos
- Hover com border-secondary/50 e shadow-glow

---

## Secao 4: Trust Section (Novo Componente)

**Criar:** `src/components/landing/TrustSection.tsx`

**Substitui:** BenefitsSection + FrameworksSection

**Estrutura em 3 partes:**

**Parte A - Framework Badges**
Barra horizontal centralizada:
- Badges: NIST CSF 2.0 | ISO 27001:2022 | BCB/CMN 4.893 | VRM Integrado
- Estilo: bg-primary/10 border-primary/20, hover com glow

**Parte B - Metricas de Impacto**
Grid 4 colunas com numeros animados (count-up):
- "70%" - Reducao de tempo em auditorias
- "50h" - Economia mensal por equipe  
- "45+" - Requisitos VRM padrao
- "100%" - Trilha de auditoria

Estilo: text-gradient-cosmic para numeros, font-space

**Parte C - Quote/Testimonial (Opcional)**
Card com citacao destacada:
- Aspas grandes decorativas
- Texto de impacto sobre conformidade
- Pode usar estatistica ou frase motivacional

---

## Secao 5: CTA Section (Novo Componente)

**Criar:** `src/components/landing/CTASection.tsx`

**Substitui:** ContactSection + ProductTourSection

Layout 2 colunas:

| Coluna Esquerda | Coluna Direita |
|-----------------|----------------|
| "Conheca a Plataforma" | "Fale com um Especialista" |
| Screenshot preview pequeno | Formulario compacto |
| Botao "Ver Tour" -> /tour | Campos: Nome, Email, Empresa |
| | Botao "Agendar Demo" |

Fundo: bg-muted/30 com nebula effects
Manter formulario funcional atual (salva no Supabase + envia email)

---

## Secao 6: FAQ Simplificado

**Arquivo:** `src/components/landing/FAQSection.tsx`

Mudancas:
- Reduzir de 16 para 6 perguntas essenciais
- Layout: coluna unica centralizada (remover grid 2 colunas)
- Accordion simples
- Remover categorias (tudo em uma lista)

6 perguntas selecionadas:
1. O que e a CosmoSec?
2. Quais frameworks sao suportados?
3. O que e o modulo VRM?
4. Como funciona a contratacao?
5. Os dados estao seguros?
6. Quanto tempo leva a implantacao?

---

## Secao 7: Footer

**Arquivo:** `src/components/landing/Footer.tsx`

Mudancas menores:
- Simplificar links do menu Produto
- Manter estrutura geral
- Remover links placeholder (#)

---

## Landing.tsx - Nova Estrutura

**Arquivo:** `src/pages/Landing.tsx`

```tsx
export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative">
      <StarField starCount={80} dustCount={25} />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <PlatformSection />
        <TrustSection />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
```

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/landing/PlatformSection.tsx` | 3 pilares da plataforma |
| `src/components/landing/TrustSection.tsx` | Badges + Metricas + Quote |
| `src/components/landing/CTASection.tsx` | Tour preview + Formulario |

---

## Arquivos a Remover da Landing

| Arquivo | Destino |
|---------|---------|
| `ModulesSection.tsx` | Consolidado em PlatformSection |
| `FeaturesSection.tsx` | Consolidado em PlatformSection |
| `FrameworksSection.tsx` | Movido para TrustSection (badges) |
| `BenefitsSection.tsx` | Movido para TrustSection (metricas) |
| `ProductTourSection.tsx` | Consolidado em CTASection |
| `HowItWorksSection.tsx` | Removido (detalhado demais) |
| `UseCasesSection.tsx` | Mover para /tour |
| `ROICalculatorSection.tsx` | Mover para /tour |

Nota: Os arquivos serao removidos apenas do import da Landing.tsx. Os componentes permanecerao no projeto para uso na pagina /tour.

---

## Elementos Visuais Mantidos

- Paleta cosmica: Event Horizon (#2E5CFF), Nebula (#00D4FF), Deep Void
- Tipografia: Space Grotesk (titulos), Inter (corpo)
- Efeitos: glassmorphism, shadow-glow, animate-float, animate-pulse-glow
- StarField com estrelas e poeira cosmica
- Gradientes: text-gradient-cosmic, from-primary to-secondary
- Animacoes: fade-in, hover scales, twinkle

---

## Resultado Esperado

- Pagina reduzida de 11 para 5 secoes principais
- Tempo de leitura: ~2-3 minutos (antes ~8 min)
- Foco em conversao: Hero -> Entender -> Confiar -> Converter
- Visual profissional enterprise mantendo identidade CosmoSec
- Mobile-first responsivo

---

## Secao Tecnica

### Dependencias
Nenhuma nova dependencia necessaria.

### Componentes Reutilizados
- Card, Badge, Button do shadcn/ui
- Formulario de contato: lógica atual do ContactSection (Supabase + Edge Function)
- StarField: mantido integralmente

### Animacoes CSS Mantidas
```css
.animate-fade-in
.animate-float
.animate-pulse-glow
.animate-twinkle
.text-gradient-cosmic
.glass-card
.hover-glow
```

### Count-up Animation (Nova)
Adicionar em index.css para metricas animadas na TrustSection:
```css
@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```
