
# Plano: Corrigir Formulário de Contato e Galeria de Screenshots

## Resumo Executivo

Durante a investigação, descobri que o formulário de contato está funcionando corretamente quando testado diretamente. O problema reportado pode estar relacionado a um erro de Hot Module Reload (HMR) causado por uma referência a um arquivo inexistente (`DashboardScreenshotGallery.tsx`).

## Diagnóstico Realizado

### O que funciona:
- Campos de texto (Nome, Email, Empresa) aceitam entrada normalmente
- Campos de Select/Dropdown funcionam
- Botão "Solicitar Demonstração" submete o formulário
- Dados são salvos corretamente no banco de dados
- Políticas de segurança (RLS) estão configuradas para permitir inserções públicas

### Problema identificado:
- O console mostra erro de HMR tentando carregar o arquivo `/src/components/conheca/DashboardScreenshotGallery.tsx` que não existe
- Este erro pode estar causando comportamento inconsistente na página

## Correções Propostas

### 1. Criar o componente DashboardScreenshotGallery faltante

Recriar o componente de galeria de screenshots que foi referenciado mas não existe:

```text
src/components/conheca/DashboardScreenshotGallery.tsx
├── Galeria interativa com 4 screenshots do Dashboard
├── Navegação por setas (esquerda/direita)  
├── Miniaturas para seleção rápida
├── Modal fullscreen para visualização ampliada
└── Legendas técnicas para cada screenshot
```

### 2. Verificar importações no ConhecaCosmoSec.tsx

Garantir que a importação e uso do componente estejam corretos na página de tour.

### 3. Mover screenshots para pasta pública

Garantir que as imagens estejam no diretório `public/screenshots/`:
- `dashboard-1.png`
- `dashboard-2.png`
- `dashboard-3.png`
- `dashboard-4.png`

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/conheca/DashboardScreenshotGallery.tsx` | Criar |
| `src/pages/ConhecaCosmoSec.tsx` | Verificar importação |

## Detalhes Técnicos

### Estrutura do Componente DashboardScreenshotGallery

O componente terá:
- Estado para controlar o índice da imagem atual
- Array de screenshots com títulos e descrições
- Função de navegação (anterior/próximo)
- Dialog da Radix UI para modo fullscreen
- Animações suaves de transição

### Imagens e Legendas

| Screenshot | Título | Descrição |
|------------|--------|-----------|
| dashboard-1.png | Resumo Executivo | Score de segurança e métricas principais |
| dashboard-2.png | Métricas de Remediação | Progresso dos planos de ação |
| dashboard-3.png | Mapa de Calor de Riscos | Distribuição visual de riscos |
| dashboard-4.png | Tendências de Conformidade | Evolução histórica dos indicadores |

## Resultado Esperado

Após as correções:
- O erro de HMR desaparecerá do console
- A galeria de screenshots será exibida na página de tour
- Todas as interações do formulário de contato funcionarão normalmente
- O usuário poderá navegar pelas screenshots do Dashboard Executivo
