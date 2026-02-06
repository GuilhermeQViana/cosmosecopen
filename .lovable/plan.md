

# Inserir Calculadora de ROI na Landing Page

## Objetivo
Adicionar a seção da Calculadora de ROI (já existente) na landing page, posicionando-a entre a TrustSection e a CTASection (acima de "Pronto para transformar sua governança?").

---

## Situação Atual

```text
Landing.tsx:
1. HeroSection
2. PlatformSection  
3. TrustSection (badges + métricas)
4. CTASection ← "Pronto para transformar sua governança?"
5. FAQSection
```

---

## Nova Estrutura

```text
Landing.tsx:
1. HeroSection
2. PlatformSection  
3. TrustSection
4. ROICalculatorSection ← INSERIR AQUI
5. CTASection ← "Pronto para transformar sua governança?"
6. FAQSection
```

---

## Alteração Necessária

**Arquivo:** `src/pages/Landing.tsx`

### Mudanças:
1. Adicionar import do `ROICalculatorSection`
2. Inserir o componente entre `TrustSection` e `CTASection`

### Código Final:

```tsx
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { PlatformSection } from '@/components/landing/PlatformSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { ROICalculatorSection } from '@/components/landing/ROICalculatorSection'; // NOVO
import { CTASection } from '@/components/landing/CTASection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';
import { StarField } from '@/components/ui/star-field';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative">
      <StarField starCount={80} dustCount={25} />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <PlatformSection />
        <TrustSection />
        <ROICalculatorSection /> {/* NOVO */}
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
```

---

## Ajuste no CTA da Calculadora

O componente `ROICalculatorSection` já possui um botão CTA que faz scroll para `#contato`. Como a `CTASection` atual usa `id="contact"`, vou atualizar o scroll target para garantir consistência:

**Arquivo:** `src/components/landing/ROICalculatorSection.tsx`

Alterar a função `scrollToContact`:
```tsx
const scrollToContact = () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
};
```

---

## Fluxo de Conversão Resultante

```text
Hero → Entender Plataforma → Confiar (métricas) → Calcular ROI → Converter
```

A calculadora serve como último passo de convencimento antes do formulário de contato, permitindo que o prospecto visualize o retorno potencial antes de solicitar uma demonstração.

---

## Resumo

| Arquivo | Ação |
|---------|------|
| `src/pages/Landing.tsx` | Adicionar import e componente ROICalculatorSection |
| `src/components/landing/ROICalculatorSection.tsx` | Ajustar scroll target de `#contato` para `#contact` |

