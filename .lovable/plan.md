

## Corrigir Parsing de Campos Multilinha no CSV

### Problema

O arquivo Excel possui textos longos com quebras de linha na coluna `name` (ex: "Art. 22-B O servico prestado..."). Quando o `parseExcelToCSV` converte para CSV, esses valores ficam entre aspas com `\n` dentro. Porem, o parser atual faz `content.split(/\r?\n/)` quebrando TODAS as linhas, inclusive as que estao dentro de campos entre aspas. Resultado: os campos `code` e `name` ficam vazios ou errados porque a linha foi cortada no meio.

### Solucao

**Arquivo: `src/hooks/useImportControls.ts`**

Substituir o `split(/\r?\n/)` por uma funcao `splitCSVLines` que respeita campos entre aspas:

1. Criar funcao `splitCSVLines(content: string): string[]` que percorre caractere a caractere, rastreando se esta dentro de aspas ou nao, e so quebra a linha quando encontra `\n` FORA de aspas.

2. Usar essa funcao em `extractHeaders` e `parseCSV` no lugar de `split(/\r?\n/)`.

3. A logica sera:
   - Percorrer cada caractere do conteudo
   - Manter flag `inQuotes` que alterna ao encontrar `"`
   - Quando encontrar `\n` ou `\r\n` e `inQuotes === false`, finalizar a linha atual e iniciar nova
   - Quando encontrar `\n` dentro de aspas, manter como parte do campo atual

### Mudanca no Codigo

```text
Nova funcao: splitCSVLines(content)
  - Itera caractere a caractere
  - Rastreia estado inQuotes
  - Quebra linha apenas quando \n esta fora de aspas
  - Retorna array de linhas intactas (campos multilinha preservados)

Atualizar: extractHeaders()
  - Trocar content.split(/\r?\n/) por splitCSVLines(content)

Atualizar: parseCSV()
  - Trocar cleanContent.split(/\r?\n/) por splitCSVLines(cleanContent)

Atualizar: detectDelimiter()
  - Trocar content.split(/\r?\n/) por splitCSVLines(content)
```

### Resultado

Campos com texto multilinha (como os artigos do Excel) serao preservados intactos, e o mapeamento de `code` e `name` funcionara corretamente.

