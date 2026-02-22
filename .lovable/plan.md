

# Plano: Corrigir Problemas de Layout da Landing Page

## Problemas Identificados

### 1. Blocos de codigo cortados no mobile
Os blocos `<pre>` na secao "Como comecar" e "Docker" tem `overflow-x-auto`, mas o texto ainda aparece cortado visualmente no mobile. O tamanho da fonte (`text-sm` = 14px) e grande demais para telas pequenas, e o container flex comprime o espaco disponivel.

**Onde aparece:**
- Passo 1: `git clone https://github.c...` (cortado)
- Passo 3: `-- Cole o conteudo de supa...` (cortado)
- Passo 4: `VITE_SUPABASE_PUBLISHABL...` (cortado)
- Docker Opcao 1: Multiplas linhas cortadas
- Docker Opcao 2: `docker compose -f docker-c...` (cortado)
- Edge Functions: `supabase link --project-re...` (cortado)

### 2. Layout titulo + badge no Docker (mobile)
Os titulos "Opcao 1: Self-Hosted Completo" com o badge "Recomendado" usam `flex items-center gap-3`, o que faz o badge ficar desalinhado e quebrando de forma estranha em telas pequenas.

### 3. Arquivo App.css com codigo morto
O `App.css` contem estilos antigos (`#root { max-width: 1280px; padding: 2rem; }`) que nao sao importados em lugar nenhum. E codigo morto que pode confundir.

---

## Correcoes Planejadas

### 1. `src/components/landing/AudienceSection.tsx` - CodeBlock
- Reduzir fonte do `<pre>` para `text-xs` no mobile (`text-xs sm:text-sm`)
- Adicionar `whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal` para que o codigo quebre em telas pequenas mas mantenha formatacao no desktop
- Isso garante que todo o conteudo fique visivel sem necessidade de scroll horizontal no mobile

### 2. `src/components/landing/AudienceSection.tsx` - Titulo + Badge
- Trocar o layout dos titulos do Docker de `flex items-center gap-3` para `flex flex-wrap items-center gap-2` para que o badge fique abaixo do titulo em telas pequenas
- Aplicar a mesma correcao para os tres blocos: Self-Hosted, Frontend + Cloud, e Edge Functions

### 3. `src/App.css` - Limpar codigo morto
- Remover todo o conteudo do arquivo (ou o arquivo inteiro) ja que nao e importado em nenhum lugar

---

## Detalhes Tecnicos

### CodeBlock (antes):
```
pre className="... text-sm ... overflow-x-auto"
```

### CodeBlock (depois):
```
pre className="... text-xs sm:text-sm ... overflow-x-auto whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal"
```

### Titulo + Badge (antes):
```
div className="flex items-center gap-3 mb-2"
```

### Titulo + Badge (depois):
```
div className="flex flex-wrap items-center gap-2 mb-2"
```

---

## Arquivos Impactados

| Arquivo | Acao |
|---------|------|
| `src/components/landing/AudienceSection.tsx` | Corrigir CodeBlock e layout titulo+badge |
| `src/App.css` | Limpar codigo morto |

