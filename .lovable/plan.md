
## Corrigir Deteccao de Delimitador no Import CSV

### Problema

O `detectDelimiter` exige que TODAS as linhas tenham contagem similar do delimitador (+-1). Quando o Excel omite colunas vazias no final das linhas de dados, a contagem de ponto-e-virgula nas linhas de dados fica menor que no cabecalho, o que faz o algoritmo rejeitar o `;` e cair no default `,` — resultando em 1 unica coluna.

### Solucao

**Arquivo: `src/hooks/useImportControls.ts`** — Funcao `detectDelimiter`

Tornar a deteccao mais robusta com estas mudancas:

1. **Fallback por contagem do cabecalho**: Se nenhum delimitador passar no teste de consistencia, usar o delimitador com maior contagem na primeira linha (cabecalho). Se o cabecalho tem 9 ponto-e-virgulas e 0 virgulas, ponto-e-virgula vence independente da consistencia.

2. **Consistencia mais tolerante**: Aceitar linhas de dados com ate 50% menos delimitadores que o cabecalho (em vez de apenas +-1), pois o Excel frequentemente omite colunas vazias no final.

3. **Priorizar maioria**: Se 3 de 4 linhas de dados sao consistentes, considerar o delimitador como valido (em vez de exigir 100%).

### Mudanca no Codigo

```text
Antes:
  - isConsistent exige ALL linhas com +-1 do cabecalho
  - Se nenhum delimitador e consistente, retorna ','

Depois:
  - isConsistent aceita linhas com contagem >= metade do cabecalho
  - Se nenhum delimitador e consistente, usa o com maior contagem no cabecalho
  - Adiciona fallback explicito: se header tem 0 virgulas mas N ponto-e-virgulas, usa ponto-e-virgula
```

**Arquivo: `src/components/configuracoes/CSVFieldMapper.tsx`** — Funcao `autoMapFields`

Adicionar matching mais flexivel para que os headers do arquivo (ex: `code`, `name`, `weight`) sejam mapeados mesmo com pequenas variacoes:

- Adicionar busca por "starts with" e "contains" alem de match exato nos sinonimos
- Isso garante que mesmo com acentos ou underscores extras o mapeamento automatico funcione

### Resultado

O arquivo CSV com separador `;` sera corretamente detectado, as 10 colunas serao identificadas, e o mapeamento automatico associara cada coluna ao campo correto do sistema.
