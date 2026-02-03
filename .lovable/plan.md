
# Plano: Exibir Detalhes dos Erros na Importacao de CSV

## Problema Identificado

Na tela de importacao de controles CSV, quando um item tem erros, aparece apenas um badge "1 erro(s)" sem explicar qual foi o problema especifico. O usuario nao consegue saber se:
- O codigo esta vazio ou duplicado
- O nome esta faltando
- O peso esta invalido

Os erros ja sao coletados no hook (`control.errors[]`), mas nao sao exibidos na interface.

---

## Solucao Proposta

### 1. Exibir Erros Inline na Tabela

Substituir o badge generico "1 erro(s)" por uma lista dos erros reais. Cada erro sera exibido com icone e texto explicativo.

```text
Antes:
| Linha | Status | Codigo | Nome | Categoria | Erros       |
|-------|--------|--------|------|-----------|-------------|
| 2     | X      | 4893   | Art. | de que... | [1 erro(s)] |

Depois:
| Linha | Status | Codigo | Nome | Categoria | Erros                           |
|-------|--------|--------|------|-----------|----------------------------------|
| 2     | X      | 4893   | Art. | de que... | - Codigo "4893" duplicado       |
|       |        |        |      |           |   no arquivo                     |
```

### 2. Adicionar Tooltip ou Expandir para Muitos Erros

Para linhas com varios erros, mostrar o primeiro e permitir ver todos via:
- HoverCard com lista completa
- Ou exibir todos empilhados na celula

### 3. Resumo de Erros Agrupados

Adicionar uma secao no final mostrando tipos de erros encontrados:
```text
Tipos de erros encontrados:
- 45 linhas com "Codigo duplicado"  
- 80 linhas com "Nome e obrigatorio"
- 26 linhas com "Codigo e obrigatorio"
```

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/configuracoes/ImportControlsCSV.tsx` | Exibir erros detalhados na tabela e resumo agrupado |

---

## Detalhes de Implementacao

### 1. Modificar Celula de Erros na Tabela

Trocar o Badge generico por lista de erros:

```tsx
<TableCell>
  {control.errors.length > 0 && (
    <div className="space-y-1">
      {control.errors.map((error, idx) => (
        <div key={idx} className="text-xs text-destructive flex items-start gap-1">
          <span className="shrink-0">•</span>
          <span>{error}</span>
        </div>
      ))}
    </div>
  )}
</TableCell>
```

### 2. Ajustar Largura da Coluna de Erros

Aumentar a largura minima da coluna para acomodar mensagens maiores:
- De `w-32` para `min-w-[200px]`

### 3. Adicionar Resumo de Erros por Tipo

Agrupar erros por tipo e exibir contagem:

```tsx
// Agrupar erros por mensagem
const errorSummary = useMemo(() => {
  const summary = new Map<string, number>();
  result.controls.forEach(control => {
    control.errors.forEach(error => {
      // Normalizar mensagens de codigo duplicado
      const key = error.startsWith('Codigo "') 
        ? 'Codigo duplicado no arquivo' 
        : error;
      summary.set(key, (summary.get(key) || 0) + 1);
    });
  });
  return Array.from(summary.entries())
    .sort((a, b) => b[1] - a[1]);
}, [result]);
```

### 4. Exibir Resumo na Secao de Atencao

```tsx
{result.invalidCount > 0 && (
  <div className="p-4 bg-amber-500/10 border ...">
    <div className="flex items-center gap-2 ...">
      <AlertTriangle />
      <span>Atencao - {result.invalidCount} controle(s) com erros</span>
    </div>
    
    <div className="mt-3 space-y-1">
      <p className="text-xs font-medium text-muted-foreground">
        Tipos de erros encontrados:
      </p>
      {errorSummary.map(([error, count]) => (
        <div key={error} className="text-sm flex gap-2">
          <Badge variant="outline">{count}</Badge>
          <span>{error}</span>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## Resultado Esperado

1. Usuario ve exatamente qual erro ocorreu em cada linha
2. Erros duplicados sao agrupados e contabilizados no resumo
3. Facilita corrigir o arquivo CSV antes de reimportar
4. Interface mais informativa e menos frustrante
