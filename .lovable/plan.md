

## Adicionar "Politicas" ao Calculo de ROI

### O que muda

Adicionar um novo slider **"Politicas gerenciadas"** ao painel de inputs e incluir seu impacto no calculo de economia. A criacao e gestao manual de politicas consome tempo significativo (redacao, revisao, aprovacao, versionamento), e a automacao por IA da CosmoSec reduz drasticamente esse esforco.

### Mudancas no arquivo `src/components/landing/ROICalculatorSection.tsx`

**1. Novo estado**
- `policies` com valor inicial `5`, range de 0 a 30, step 1

**2. Novo slider no painel de inputs**
- Icone `FileText` do lucide-react
- Label: "Politicas gerenciadas"
- Posicionado entre "Frameworks gerenciados" e "Fornecedores avaliados"

**3. Logica de calculo atualizada**
- Adicionar `policySavingsPercent`: economia baseada no volume de politicas
  - Logica: cada politica criada/gerida manualmente consome ~8h (redacao, revisao, aprovacao). Com IA, reduz para ~2h (75% de economia por politica)
  - Formula: `policies > 0 ? Math.min(0.05 + policies * 0.01, 0.15) : 0` (5% base + 1% por politica, max 15%)
- Somar `policySavingsPercent` ao `totalSavingsPercent`
- Incluir `policies` na lista de dependencias do `useMemo`

**4. Atualizar lista "Como voce economiza"**
- Atualizar o item de politicas para ser dinamico: "Criacao e gestao de {policies} politicas com IA" (em vez do texto generico atual)

### Resultado

O calculo de ROI passara a refletir a economia real proporcionada pelo modulo de Gestao de Politicas, aumentando o valor percebido da ferramenta para prospects que gerenciam multiplas politicas de seguranca.

