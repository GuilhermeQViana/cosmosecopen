

# Atualizar Slide de Pricing com Faixas da Calculadora de ROI

## Problema

O slide `demo-pricing` mostra um plano unico de R$ 449,90/mes, mas a calculadora de ROI ja utiliza 3 faixas de preco anuais baseadas no porte da operacao:

- **Pequeno**: R$ 30.000/ano (ate 3 pessoas, ate 2 frameworks)
- **Medio**: R$ 45.000/ano (4-7 pessoas ou 3 frameworks)
- **Grande**: R$ 60.000/ano (8+ pessoas ou 4+ frameworks)

O slide deve refletir essa precificacao por faixa.

---

## Alteracao

### Arquivo: `src/lib/slide-generator-demo.ts` (caso `demo-pricing`, linhas 452-489)

Substituir o bloco de preco unico por **3 cards lado a lado**, cada um mostrando:

| Card | Titulo | Preco | Criterio |
|------|--------|-------|----------|
| 1 | Pequeno | R$ 30.000/ano | Ate 3 pessoas, ate 2 frameworks |
| 2 | Medio | R$ 45.000/ano | 4-7 pessoas ou 3 frameworks |
| 3 | Grande | R$ 60.000/ano | 8+ pessoas ou 4+ frameworks |

Abaixo dos cards, manter a lista de features incluidas em todas as faixas (mesma lista atual dividida em 2 colunas).

### Arquivo: `src/lib/slide-generator.ts` (linha 251)

Atualizar a descricao do slide de `'R$ 449,90/mês com tudo incluso'` para `'3 faixas: R$ 30k, R$ 45k e R$ 60k/ano por porte'`.

### Layout do slide atualizado

```text
+----------------------------------------------------------+
|            Plano & Investimento                          |
|     Precificacao por porte de operacao                   |
|  --------------------------------------------------------|
|                                                          |
|  +-------------+  +--------------+  +---------------+   |
|  |  PEQUENO    |  |   MEDIO      |  |   GRANDE      |   |
|  | R$ 30.000   |  |  R$ 45.000   |  |  R$ 60.000    |   |
|  |   /ano      |  |    /ano      |  |    /ano       |   |
|  | Ate 3 pess  |  | 4-7 pessoas  |  | 8+ pessoas    |   |
|  | Ate 2 frmwk |  | ou 3 frmwk   |  | ou 4+ frmwk   |   |
|  +-------------+  +--------------+  +---------------+   |
|                                                          |
|  Todas as faixas incluem:                                |
|  * GRC + VRM + Politicas    * Portal fornecedores        |
|  * Frameworks ilimitados    * RBAC 3 perfis              |
|  * Relatorios PDF/Excel     * Trilha de auditoria        |
|  * IA integrada             * Suporte chat/email         |
|                                                          |
+----------------------------------------------------------+
```

Serao usados os helpers `drawContentCard` e `drawBulletList` ja existentes no arquivo.

