
# Plano: Ajustar Calculadora de ROI com Preço Real do CosmoSec

## Problema Atual

A calculadora usa um valor fixo arbitrário de R$ 50.000 para calcular o payback, gerando resultados imprecisos. O preço real do CosmoSec varia de **R$ 30.000 a R$ 60.000/ano**.

## Mudanças Propostas

### 1. Nova Lógica de Precificação

Calcular o custo estimado do CosmoSec baseado no tamanho da operação:

| Cenário | Custo CosmoSec/ano |
|---------|-------------------|
| Pequeno (1-3 pessoas, 1-2 frameworks) | R$ 30.000 |
| Médio (4-7 pessoas, 2-3 frameworks) | R$ 45.000 |
| Grande (8+ pessoas, 4+ frameworks) | R$ 60.000 |

### 2. Fórmula de Payback Corrigida

```text
Payback (meses) = (Custo CosmoSec / Economia Anual) × 12
```

**Exemplo:**
- Economia anual: R$ 504.000
- Custo CosmoSec: R$ 45.000
- Payback = (45.000 / 504.000) × 12 = ~1 mês

### 3. Nova Métrica: ROI Líquido

Adicionar o cálculo do retorno líquido:

```text
ROI Líquido = Economia Anual - Custo CosmoSec
```

### 4. Exibir Investimento Estimado

Mostrar ao usuário qual seria o investimento estimado baseado no seu perfil.

## Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/landing/ROICalculatorSection.tsx` | Ajustar cálculos e adicionar métricas |

## Resultado Esperado

- Payback realista baseado no preço do CosmoSec
- Nova métrica de ROI líquido (economia - investimento)
- Exibição do investimento estimado
- Cálculos mais transparentes para o lead
