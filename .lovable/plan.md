
## Atualizacao da Landing Page - Alinhamento com Funcionalidades Reais

### Analise: O que a plataforma tem vs. o que a landing page comunica

A landing page atual esta desatualizada em relacao ao estado real da plataforma. Varias funcionalidades significativas nao sao mencionadas ou estao sub-representadas.

#### Funcionalidades NAO mencionadas na landing page:

1. **Modulo de Gestao de Politicas** (completo e robusto)
   - Editor rich-text com geracao por IA
   - Dashboard de politicas com metricas
   - Fluxos de aprovacao multi-nivel
   - Campanhas de aceite com rastreamento de aderencia
   - Templates de politicas
   - Versionamento e historico
   - Exportacao para PDF

2. **Modulo de Auditoria** (trilha de auditoria detalhada)
   - Logs de acesso com filtros avancados
   - Graficos e timeline visual
   - Rastreamento por usuario

3. **Relatorios Avancados** (6 tipos)
   - Conformidade, Riscos, Evidencias, Planos de Acao, Executivo, Gap Analysis
   - Exportacao em HTML/PDF

4. **Funcionalidades VRM expandidas**
   - Due Diligence completa
   - SLA Tracking
   - Gestao de contratos
   - Incidentes de fornecedores
   - Portal de fornecedores
   - Offboarding wizard
   - Pipeline visual (Kanban/Funnel)

5. **Frameworks customizados**
   - Criacao do zero ou importacao CSV

#### O que precisa ser atualizado:

### Plano de Implementacao

**1. Atualizar PlatformSection - Adicionar 5o pilar "Gestao de Politicas"**
- Novo card com icone FileText
- Features: Editor com IA, Fluxos de aprovacao, Campanhas de aceite, Templates, Versionamento
- Reorganizar o grid para 5 cards (3+2 ou layout adaptativo)

**2. Expandir features no pilar VRM**
- Atualizar lista de features para incluir: Due Diligence, SLA Tracking, Portal de Fornecedores, Gestao de Contratos
- Aumentar de "45+ requisitos" para destacar os workflows completos

**3. Expandir features no pilar IA Generativa**
- Adicionar: Geracao de politicas com IA, Assistente de implementacao, Analise de incidentes de fornecedores, Classificacao automatica de criticidade

**4. Atualizar TrustSection - Novas metricas**
- Atualizar metricas para refletir funcionalidades expandidas:
  - "6 tipos de relatorios" (novo)
  - "45+ requisitos VRM" permanece
  - Adicionar badge "Gestao de Politicas" aos frameworks
- Adicionar "Frameworks Customizados" como badge

**5. Atualizar FAQSection - Novas perguntas**
- Adicionar FAQ sobre o modulo de politicas
- Adicionar FAQ sobre relatorios
- Atualizar FAQ do VRM para mencionar funcionalidades expandidas (Due Diligence, SLA, Portal)

**6. Atualizar AudienceSection - Novos beneficios**
- Card "Empresas": adicionar "Gestao completa de politicas com fluxos de aprovacao" e "6 tipos de relatorios executivos"
- Card "Consultorias": adicionar "Templates de politicas reutilizaveis" e "Campanhas de aceite por cliente"

**7. Atualizar HeroSection - Subtitulo**
- Expandir subtitulo para incluir "politicas" na proposta de valor
- De: "A plataforma GRC + VRM para empresas..."
- Para: "A plataforma GRC + VRM + Gestao de Politicas para empresas..."

**8. Atualizar Navbar e Footer**
- Footer: adicionar links para "Gestao de Politicas" na secao Produto

### Detalhes Tecnicos

```text
Arquivos a modificar:

1. src/components/landing/PlatformSection.tsx
   - Adicionar 5o pilar "Gestao de Politicas" ao array platforms[]
   - Ajustar grid de lg:grid-cols-4 para layout responsivo que acomode 5 cards
   - Expandir features dos pilares VRM e IA

2. src/components/landing/TrustSection.tsx
   - Adicionar badge "Gestao de Politicas" e "Frameworks Custom" ao array frameworks[]
   - Atualizar metricas: trocar "Trilha de auditoria 100%" por "6 tipos de relatorios"

3. src/components/landing/AudienceSection.tsx
   - Expandir benefits[] de cada card com funcionalidades de politicas e relatorios

4. src/components/landing/FAQSection.tsx
   - Adicionar 2 novas FAQs (politicas e relatorios)
   - Atualizar FAQ do VRM com funcionalidades expandidas

5. src/components/landing/HeroSection.tsx
   - Atualizar subtitulo (linha 51) para incluir politicas

6. src/components/landing/Footer.tsx
   - Adicionar link "Gestao de Politicas" em footerLinks.produto

7. src/components/landing/ROICalculatorSection.tsx
   - Atualizar lista de beneficios para mencionar politicas e relatorios automatizados
```

### Resumo de Impacto

A landing page passara a comunicar com precisao as 5 verticais da plataforma (GRC, VRM, Politicas, IA, Consultoria), refletindo a maturidade real do produto e aumentando a credibilidade junto a prospects que busquem solucoes completas de governanca.
