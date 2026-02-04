
# Plano: Melhorar UX da Pagina de Tour e Renomear para "Conheca a CosmoSec"

## Visao Geral

Este plano transforma a pagina `/tour` em uma experiencia mais envolvente e intuitiva, com o novo nome "Conheca a CosmoSec". As melhorias focam em navegacao, interatividade e apresentacao visual.

---

## 1. Renomeacao da Pagina

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/TourProduto.tsx` | Renomear para `ConhecaCosmoSec.tsx` |
| `src/App.tsx` | Atualizar import e manter rota `/tour` |
| `src/components/landing/Navbar.tsx` | Alterar label "Tour" para "Conheca" |
| `src/components/landing/Footer.tsx` | Alterar "Tour do Produto" para "Conheca a CosmoSec" |
| `src/components/landing/ProductTourSection.tsx` | Atualizar textos de referencia |

### Novos Textos

```text
Navbar: "Conheca" (ao inves de "Tour")
Footer: "Conheca a CosmoSec" (ao inves de "Tour do Produto")
Badge Hero: "Conheca a CosmoSec" (ao inves de "Tour Completo")
```

---

## 2. Melhorias de Navegacao

### 2.1 Menu de Navegacao Sticky (Table of Contents)

Adicionar um menu lateral fixo que acompanha o scroll, permitindo navegacao rapida entre secoes:

```text
+------------------+----------------------------------------+
|                  |                                        |
| [Navegacao]      |    Conteudo Principal                  |
|                  |                                        |
| > GRC Frameworks |    [Secao atual visivel]               |
|   VRM            |                                        |
|   Avancado       |                                        |
|                  |                                        |
| [Falar Conosco]  |                                        |
|                  |                                        |
+------------------+----------------------------------------+
```

**Comportamento:**
- Visivel apenas em desktop (lg:)
- Destaca secao atual baseado no scroll
- Clique navega suavemente para secao
- CTA fixo no final do menu

### 2.2 Indicador de Progresso

Barra de progresso no topo que mostra quanto da pagina foi visualizado:

```text
[======================>                    ] 55%
```

---

## 3. Melhorias Visuais e Interativas

### 3.1 Animacoes de Entrada

Adicionar animacoes sutis nos cards de funcionalidades usando CSS ou Framer Motion:

- Cards aparecem com fade-in e slide-up ao entrar na viewport
- Escalonamento (stagger) entre cards da mesma secao
- Transicoes suaves no hover

### 3.2 Cards Expandiveis

Ao clicar em um card de feature, expandir para mostrar mais detalhes:

```text
Antes (colapsado):
+---------------------------------------+
| [Icon] Dashboard Executivo            |
| Visao consolidada com score...        |
| [Score real] [Graficos] [Alertas]     |
+---------------------------------------+

Depois (expandido):
+---------------------------------------+
| [Icon] Dashboard Executivo         [-]|
|                                       |
| Visao consolidada com score de        |
| seguranca, graficos de tendencia...   |
|                                       |
| Destaques:                            |
| - Score de maturidade em tempo real   |
| - Graficos de evolucao por framework  |
| - Widget de alertas prioritarios      |
| - Metricas de remediacao              |
|                                       |
| [Ver na Demo ->]                      |
+---------------------------------------+
```

### 3.3 Hover Effects Aprimorados

- Elevacao sutil no hover (translate-y e shadow)
- Glow effect no icone
- Borda com gradiente animado

---

## 4. Secao Hero Aprimorada

### 4.1 Novo Layout

```text
+----------------------------------------------------------+
|                                                          |
|  Badge: Conheca a CosmoSec                               |
|                                                          |
|  Titulo: Descubra como a CosmoSec                        |
|          transforma sua governanca                       |
|                                                          |
|  Subtitulo: Explore cada modulo e funcionalidade         |
|             da plataforma que simplifica sua             |
|             jornada de conformidade.                     |
|                                                          |
|  +----------------+  +----------------+  +-------------+ |
|  | GRC Frameworks |  | Fornecedores   |  | Avancado    | |
|  | 6 recursos     |  | 6 recursos     |  | 6 recursos  | |
|  +----------------+  +----------------+  +-------------+ |
|                                                          |
|  [Solicitar Demonstracao]  [Ir para GRC v]               |
|                                                          |
+----------------------------------------------------------+
```

### 4.2 Quick Navigation Cards

Tres cards clicaveis no hero que levam diretamente para cada modulo:
- Mostram icone, titulo e contagem de features
- Animacao de hover com scale e glow
- Navegacao suave ao clicar

---

## 5. Comparativo de Modulos

Nova secao apos os modulos principais mostrando diferenca entre GRC e VRM:

```text
+----------------------------------------------------------+
| Qual modulo e ideal para voce?                            |
|----------------------------------------------------------+
|                                                          |
| +------------------------+  +------------------------+   |
| | GRC Frameworks         |  | VRM Fornecedores       |   |
| |------------------------|  |------------------------|   |
| | Ideal para:            |  | Ideal para:            |   |
| | - ISO 27001            |  | - Due diligence        |   |
| | - NIST CSF             |  | - Avaliacao de risco   |   |
| | - BCB 4893             |  | - Gestao de contratos  |   |
| |                        |  |                        |   |
| | [Saber mais]           |  | [Saber mais]           |   |
| +------------------------+  +------------------------+   |
|                                                          |
|            [Ou use ambos com integracao nativa]          |
|                                                          |
+----------------------------------------------------------+
```

---

## 6. Depoimentos/Casos de Sucesso (Opcional)

Incluir mini-depoimentos contextuais em cada secao de modulo:

```text
"Com a matriz de riscos, conseguimos reduzir o tempo
de analise em 60%." - Analista de Seguranca, Fintech
```

---

## 7. CTA Final Aprimorado

Secao de CTA com mais urgencia e opcoes:

```text
+----------------------------------------------------------+
|                                                          |
|  Pronto para ver tudo isso funcionando?                  |
|                                                          |
|  +------------------------------------------------+      |
|  |                                                |      |
|  |  [Icon Calendario]  Agende uma Demo            |      |
|  |  Sessao personalizada de 30 minutos            |      |
|  |  com nosso time de especialistas               |      |
|  |                                                |      |
|  |  [Agendar Agora ->]                           |      |
|  |                                                |      |
|  +------------------------------------------------+      |
|                                                          |
|  Ou fale diretamente:                                    |
|  [WhatsApp]  [Email]  [LinkedIn]                         |
|                                                          |
+----------------------------------------------------------+
```

---

## Estrutura de Arquivos

### Novo Componente: TourNavigation.tsx

```typescript
// Navegacao lateral sticky para a pagina de tour
// - Lista de secoes com destaque na atual
// - Scroll suave ao clicar
// - CTA fixo
```

### Novo Componente: TourProgressBar.tsx

```typescript
// Barra de progresso no topo
// - Calcula posicao do scroll
// - Mostra porcentagem visualizada
```

### Novo Componente: ExpandableFeatureCard.tsx

```typescript
// Card de feature que expande ao clicar
// - Estado colapsado/expandido
// - Animacao de transicao
// - Mais detalhes quando expandido
```

---

## Resumo das Melhorias

| Area | Melhoria | Impacto |
|------|----------|---------|
| Navegacao | Menu sticky lateral | Facilita exploracao |
| Navegacao | Barra de progresso | Senso de completude |
| Navegacao | Quick navigation no hero | Acesso rapido |
| Visual | Animacoes de entrada | Experiencia premium |
| Visual | Cards expandiveis | Mais detalhes sem sobrecarregar |
| Visual | Hover effects | Interatividade |
| Conteudo | Comparativo de modulos | Clareza na escolha |
| Conteudo | CTA aprimorado | Conversao |
| Naming | "Conheca a CosmoSec" | Branding consistente |

---

## Ordem de Implementacao

1. **Fase 1 - Renomeacao**
   - Renomear arquivo e atualizar imports
   - Atualizar textos na Navbar, Footer e Hero

2. **Fase 2 - Navegacao**
   - Criar TourNavigation (menu lateral)
   - Criar TourProgressBar
   - Adicionar quick navigation cards no hero

3. **Fase 3 - Interatividade**
   - Implementar ExpandableFeatureCard
   - Adicionar animacoes de entrada
   - Melhorar hover effects

4. **Fase 4 - Conteudo**
   - Adicionar secao de comparativo
   - Aprimorar CTA final

---

## Secao Tecnica

### Dependencias Necessarias
Nenhuma nova dependencia - utilizaremos recursos ja existentes:
- Tailwind CSS para animacoes
- useState/useEffect para interatividade
- IntersectionObserver para scroll tracking

### Componentes a Criar/Modificar

```text
src/
  pages/
    ConhecaCosmoSec.tsx (renomeado de TourProduto.tsx)
  components/
    conheca/
      TourNavigation.tsx (novo)
      TourProgressBar.tsx (novo)
      ExpandableFeatureCard.tsx (novo)
      ModuleComparisonSection.tsx (novo)
      QuickNavigationCards.tsx (novo)
```

### Hook Customizado

```typescript
// useScrollProgress.ts
// - Calcula progresso do scroll
// - Retorna secao atual visivel
// - Usado pelo TourNavigation e ProgressBar
```
