

# Criar Slides de Demonstracao para Clientes

## Objetivo

Expandir o gerador de slides existente (`slide-generator.ts`) com **12 novos slides de conteudo** prontos para apresentacao comercial. Cada slide tera textos reais da plataforma CosmoSec, dados de beneficios, funcionalidades e pricing -- tudo renderizado em Canvas 1920x1080 e baixavel como PNG para importar no PowerPoint.

## Novos Slides (12)

| # | ID | Categoria | Conteudo |
|---|-----|-----------|----------|
| 1 | `demo-problema` | demo | "O Problema" -- lista de dores do mercado (auditorias manuais, planilhas, gaps nao rastreados) |
| 2 | `demo-solucao` | demo | "A Solucao" -- CosmoSec como plataforma unificada GRC + VRM + Politicas |
| 3 | `demo-modulos` | demo | Visao geral dos 3 modulos com icones e descricoes curtas |
| 4 | `demo-grc` | demo | Detalhes do modulo GRC: Diagnostico, Riscos, Evidencias, Plano de Acao, Relatorios, Auditoria |
| 5 | `demo-vrm` | demo | Detalhes do modulo VRM: Avaliacao, Qualificacao, Radar, Heatmap, Contratos, Due Diligence |
| 6 | `demo-politicas` | demo | Detalhes do modulo Politicas: Editor, Workflows, Campanhas de Aceite, Templates |
| 7 | `demo-ia` | demo | Recursos de IA: Planos de acao, analise de risco, escritor de politicas, classificacao |
| 8 | `demo-beneficios` | demo | Metricas de impacto: 70% reducao de riscos, 50h economizadas, 45+ requisitos, IA |
| 9 | `demo-servicos` | demo | Duas formas de contratar: Consultoria Completa vs. Plataforma SaaS |
| 10 | `demo-frameworks` | demo | Frameworks suportados: NIST CSF 2.0, ISO 27001:2022, BCB/CMN, Custom |
| 11 | `demo-pricing` | demo | Plano Completo R$449,90/mes, 7 dias gratis, lista de features incluidas |
| 12 | `demo-diferencial` | demo | Diferenciais competitivos: multi-org, RBAC, trilha de auditoria, notificacoes realtime |

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/lib/slide-generator.ts` | Adicionar os 12 novos slides ao array `SLIDE_DEFINITIONS` e implementar a funcao de renderizacao de cada um no `switch` de `renderSlide()` |
| `src/components/brand/PresentationSlidesSection.tsx` | Adicionar a nova categoria "demo" ao array `CATEGORIES` com label "Demonstracao" |

## Detalhes Tecnicos

### Padrao Visual dos Slides de Conteudo
- Fundo: reutilizar `bgGradientDiagonal()` ou `bgDeepVoid()` ja existentes
- Titulo: fonte bold 52-56px em branco, posicionado no topo (Y ~12-15%)
- Subtitulo: fonte 24px em cor Nebula (#00D4FF)
- Corpo: textos em 22-28px, cor lightGray (#94A3B8)
- Bullet points: renderizados com circulos coloridos + texto ao lado
- Cards/blocos: retangulos com borda semi-transparente e fundo semi-transparente
- Logo pequeno no canto inferior direito (40px)
- Linha decorativa gradiente separando titulo do corpo

### Helpers Novos
- `drawBulletList()`: renderiza lista de items com marcadores coloridos
- `drawContentCard()`: desenha retangulo com borda, titulo e descricao internos
- `drawMetricBlock()`: bloco com numero grande + titulo + descricao (para slide de beneficios)

### Textos Reais Extraidos da Plataforma
Todos os textos serao extraidos dos componentes ja existentes (HeroSection, BenefitsSection, FeaturesSection, AudienceSection, PricingSection) para garantir consistencia com o marketing atual.

### Experiencia do Usuario
- Os novos slides aparecem na aba "Demonstracao" da pagina Brand Assets
- Cada slide pode ser baixado individualmente como PNG
- O botao "Baixar Todos" ja existente incluira os novos slides automaticamente
- Preview em miniatura mostra exatamente o que sera baixado

