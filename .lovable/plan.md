

# Plano: Galeria de Screenshots Expansível por Módulo

## Objetivo
Inserir as imagens do Dashboard/Diagnóstico fornecidas pelo usuário e criar um sistema onde cada módulo (GRC, VRM, IA) pode expandir e mostrar suas screenshots específicas, similar à experiência de produto das grandes ferramentas de cybersecurity.

---

## Imagens a Salvar

| Imagem Enviada | Destino | Módulo |
|----------------|---------|--------|
| `Dashboard_1-2.png` | `public/screenshots/grc-dashboard-1.png` | GRC |
| `Dashboard_2-2.png` | `public/screenshots/grc-dashboard-2.png` | GRC |
| `Dashboard_3-2.png` | `public/screenshots/grc-dashboard-3.png` | GRC |
| `Dashboard_4-2.png` | `public/screenshots/grc-dashboard-4.png` | GRC |

---

## Nova Estrutura Visual

```text
[Card GRC] ─────────────────────────────────────
│ Ícone  │  GRC Frameworks                      │
│        │  Diagnóstico completo...             │
│        │  • NIST CSF 2.0...                  │
│        │  [Ver Screenshots ▼]                 │
└─────────────────────────────────────────────┘
         ↓ (quando expandido)
┌─────────────────────────────────────────────┐
│  [< ] Imagem Principal [>]  [🔍 Fullscreen] │
│  ┌─────────────────────────────────────┐   │
│  │                                       │   │
│  │     Screenshot do Dashboard           │   │
│  │                                       │   │
│  └─────────────────────────────────────┘   │
│  [●] [○] [○] [○]  ← Indicadores            │
│  Título: Resumo Executivo                   │
│  Descrição: Score de segurança...          │
└─────────────────────────────────────────────┘
```

---

## Componentes a Criar/Modificar

### 1. Novo Componente: `ModuleScreenshotGallery.tsx`

**Arquivo:** `src/components/landing/ModuleScreenshotGallery.tsx`

Componente reutilizável para exibir galeria de screenshots de um módulo específico:

Propriedades:
- `screenshots`: array de imagens com src, title, description
- `moduleId`: identificador do módulo (grc, vrm, ia)

Funcionalidades:
- Navegação com setas (esquerda/direita)
- Indicadores de posição (dots)
- Botão de fullscreen com Dialog
- Animação suave de transição entre imagens
- Autoplay opcional

### 2. Modificar: `PlatformSection.tsx`

Adicionar estado de expansão para cada card e integrar a galeria:

```tsx
const platforms = [
  {
    id: 'grc',
    icon: Shield,
    title: 'GRC Frameworks',
    // ... outras propriedades
    screenshots: [
      { src: '/screenshots/grc-dashboard-1.png', title: '...', description: '...' },
      // ...
    ],
  },
  // ...
];
```

Cada card terá:
- Botão "Ver em Ação" que expande o card
- Área expandida mostra a galeria de screenshots do módulo
- Animação suave de abertura/fechamento (Collapsible)

---

## Dados das Screenshots por Módulo

### Módulo GRC
| # | Arquivo | Título | Descrição |
|---|---------|--------|-----------|
| 1 | `grc-dashboard-1.png` | Dashboard Executivo | Visão consolidada com score, alertas e métricas principais |
| 2 | `grc-dashboard-2.png` | Métricas de Remediação | MTTR, tendência de conformidade e histórico de maturidade |
| 3 | `grc-dashboard-3.png` | Indicadores Personalizáveis | Mapa de calor, distribuição de riscos e controles por maturidade |
| 4 | `grc-dashboard-4.png` | Atenção Prioritária | Top ameaças, cobertura por framework e gaps críticos |

### Módulo VRM (Futuro)
Placeholder até o usuário fornecer screenshots específicas do VRM

### Módulo IA (Futuro)
Placeholder até o usuário fornecer screenshots específicas da IA

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `public/screenshots/grc-dashboard-1.png` | CRIAR (copiar de user-uploads) |
| `public/screenshots/grc-dashboard-2.png` | CRIAR (copiar de user-uploads) |
| `public/screenshots/grc-dashboard-3.png` | CRIAR (copiar de user-uploads) |
| `public/screenshots/grc-dashboard-4.png` | CRIAR (copiar de user-uploads) |
| `src/components/landing/ModuleScreenshotGallery.tsx` | CRIAR |
| `src/components/landing/PlatformSection.tsx` | MODIFICAR (adicionar expansão) |

---

## Design Visual

### Card Fechado
- Mantém visual atual dos cards da PlatformSection
- Adiciona botão "Ver em Ação" no rodapé do card
- Ícone de seta para baixo indica expansão disponível

### Card Expandido
- Card aumenta de altura com animação suave
- Galeria aparece abaixo do conteúdo original
- Imagem principal com aspect-ratio 16:9
- Navegação com setas nas laterais (aparece no hover)
- Dots indicadores abaixo da imagem
- Caption com título e descrição da imagem
- Botão fullscreen no canto superior direito

### Fullscreen Dialog
- Modal escuro com imagem em tamanho máximo
- Caption no rodapé com gradiente
- Fecha com clique fora ou ESC

---

## Animações

- Expansão do card: `animate-accordion-down/up` (já existe)
- Transição de imagens: `transition-opacity duration-300`
- Hover nos dots: `scale-110`
- Glow no card expandido: `ring-1 ring-primary/30`

---

## Resultado Esperado

- Cada módulo na landing page pode ser expandido para mostrar screenshots reais
- Usuário entende visualmente o que cada módulo oferece antes de converter
- Experiência similar às grandes ferramentas enterprise (SentinelOne, CrowdStrike)
- Imagens fornecidas pelo usuário são utilizadas corretamente
- Visual consistente com identidade CosmoSec

