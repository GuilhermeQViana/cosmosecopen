

## Atualizar Pagina de Tour (/tour) com Novas Funcionalidades

### O que esta desatualizado

A pagina de tour (`ConhecaCosmoSec.tsx`) tem apenas 3 modulos (GRC, VRM, Avancado), enquanto a landing page ja foi atualizada com um 4o pilar de **Gestao de Politicas**. Alem disso, o VRM e os Recursos Avancados nao mencionam funcionalidades que ja existem na plataforma.

### Mudancas Planejadas

**1. Adicionar novo modulo "Gestao de Politicas" ao array `modules[]`**
- Icone: `FileText`
- 6 features: Editor Rich-Text com IA, Dashboard de Politicas, Fluxos de Aprovacao, Campanhas de Aceite, Templates de Politicas, Versionamento e Historico
- Cada feature com `description`, `highlights` e `extendedDescription`

**2. Expandir features do modulo VRM**
- Adicionar: Due Diligence Completa, SLA Tracking, Portal de Fornecedores, Gestao de Contratos, Pipeline Visual, Offboarding
- Atualizar descricoes existentes para refletir funcionalidades expandidas (ex: "45+ requisitos" -> mencionar workflows completos)

**3. Expandir features de Recursos Avancados**
- Adicionar: Geracao de Politicas com IA, Assistente de Implementacao, Analise de Incidentes de Fornecedores, 6 Tipos de Relatorios
- Atualizar descricoes para cobrir relatorios (Conformidade, Riscos, Evidencias, Gap Analysis, Executivo, Planos de Acao)

**4. Atualizar navegacao lateral e cards de navegacao rapida**
- `navigationSections[]`: adicionar entrada "Gestao de Politicas" com icone `FileText`
- `QuickNavigationCards.tsx`: adicionar 4o card para Politicas com contagem de features atualizada
- Ajustar grid de `sm:grid-cols-3` para `sm:grid-cols-2 lg:grid-cols-4`

**5. Atualizar ModuleComparisonSection**
- Adicionar 3o card de comparacao para "Gestao de Politicas" com lista de casos de uso ideais
- Ajustar grid para `md:grid-cols-3`

**6. Atualizar texto do hero**
- Incluir "politicas" na descricao introdutoria da pagina

### Arquivos a modificar

```text
1. src/pages/ConhecaCosmoSec.tsx
   - Adicionar modulo "Gestao de Politicas" ao array modules[]
   - Expandir features do VRM (6 novas)
   - Expandir features de Avancados (4 novas/atualizadas)
   - Adicionar "politicas" ao navigationSections[]
   - Atualizar texto do hero

2. src/components/conheca/QuickNavigationCards.tsx
   - Adicionar 4o card "Gestao de Politicas"
   - Ajustar grid para 4 colunas em telas grandes
   - Atualizar contagens de features

3. src/components/conheca/ModuleComparisonSection.tsx
   - Adicionar 3o card de comparacao para Politicas
   - Ajustar grid de md:grid-cols-2 para md:grid-cols-3

4. src/components/conheca/TourNavigation.tsx
   - Adicionar icone FileText ao mapa sectionIcons
```

### Resultado esperado

A pagina /tour passara a apresentar 4 modulos completos (GRC, VRM, Politicas, Avancado) com todas as funcionalidades reais da plataforma, alinhada com a landing page atualizada anteriormente.

