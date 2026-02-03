
# Plano: Corrigir Leitura de CSV/Excel

## Problema Identificado

O sistema de importacao CSV nao esta lendo corretamente as colunas porque:

1. **Detecta apenas virgula e ponto-e-virgula** - Arquivos do Excel frequentemente usam TAB como separador
2. **Nao detecta automaticamente o delimitador** - Usuario nao sabe qual separador foi usado
3. **Problemas de encoding** - BOM (Byte Order Mark) pode causar erros no primeiro header

---

## Solucao Proposta

### 1. Auto-Detectar Delimitador

Analisar a primeira linha e contar ocorrencias de cada possivel separador:

```text
Separadores suportados:
- Virgula (,)
- Ponto-e-virgula (;)
- TAB (\t)
- Pipe (|)
```

O separador com mais ocorrencias consistentes entre linhas sera usado.

### 2. Remover BOM do Inicio do Arquivo

Arquivos salvos como "UTF-8 com BOM" pelo Excel tem caracteres invisibles no inicio que corrompem o primeiro header.

### 3. Mostrar Delimitador Detectado ao Usuario

Na etapa de mapeamento, mostrar qual separador foi detectado e permitir alterar manualmente se necessario.

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/useImportControls.ts` | Adicionar deteccao automatica de delimitador e remocao de BOM |
| `src/components/configuracoes/CSVFieldMapper.tsx` | Mostrar separador detectado (opcional) |
| `src/components/configuracoes/ImportControlsCSV.tsx` | Passar separador detectado entre etapas |

---

## Detalhes de Implementacao

### 1. Nova Funcao: detectDelimiter

```typescript
function detectDelimiter(content: string): string {
  const delimiters = [',', ';', '\t', '|'];
  const lines = content.split(/\r?\n/).filter(l => l.trim()).slice(0, 5);
  
  if (lines.length === 0) return ',';
  
  // Contar ocorrencias de cada delimitador na primeira linha
  const counts: Record<string, number> = {};
  delimiters.forEach(d => {
    // Contar apenas fora de aspas
    counts[d] = countDelimiterOccurrences(lines[0], d);
  });
  
  // Validar consistencia entre linhas
  let bestDelimiter = ',';
  let bestScore = 0;
  
  for (const d of delimiters) {
    if (counts[d] === 0) continue;
    
    // Verificar se todas as linhas tem quantidade similar
    const allCounts = lines.map(line => countDelimiterOccurrences(line, d));
    const isConsistent = allCounts.every(c => c === allCounts[0]);
    
    if (isConsistent && counts[d] > bestScore) {
      bestScore = counts[d];
      bestDelimiter = d;
    }
  }
  
  return bestDelimiter;
}

function countDelimiterOccurrences(line: string, delimiter: string): number {
  let count = 0;
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      count++;
    }
  }
  
  return count;
}
```

### 2. Modificar parseCSVLine para Aceitar Delimitador

```typescript
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
```

### 3. Remover BOM (Byte Order Mark)

```typescript
function removeBOM(content: string): string {
  // UTF-8 BOM
  if (content.charCodeAt(0) === 0xFEFF) {
    return content.slice(1);
  }
  // UTF-8 BOM as bytes (quando lido incorretamente)
  if (content.startsWith('\uFEFF') || content.startsWith('\xEF\xBB\xBF')) {
    return content.replace(/^\uFEFF/, '').replace(/^\xEF\xBB\xBF/, '');
  }
  return content;
}
```

### 4. Atualizar parseCSV

```typescript
const parseCSV = useCallback((
  content: string, 
  customMapping?: FieldMapping,
  explicitDelimiter?: string
): ImportResult => {
  // Remover BOM
  const cleanContent = removeBOM(content);
  
  // Detectar delimitador
  const delimiter = explicitDelimiter || detectDelimiter(cleanContent);
  
  const lines = cleanContent.split(/\r?\n/).filter((line) => line.trim());
  
  if (lines.length < 2) {
    throw new Error('O arquivo deve conter pelo menos uma linha de cabecalho e uma linha de dados');
  }

  // Parse header com delimitador correto
  const header = parseCSVLine(lines[0], delimiter).map((h) => h.trim());
  
  // ... resto da logica usando delimiter
}, []);
```

### 5. Retornar Delimitador Detectado

Atualizar o hook para expor o delimitador detectado:

```typescript
export function useImportControls() {
  const [detectedDelimiter, setDetectedDelimiter] = useState<string>(',');
  
  const extractHeaders = useCallback((content: string): { 
    headers: string[]; 
    delimiter: string; 
  } => {
    const cleanContent = removeBOM(content);
    const delimiter = detectDelimiter(cleanContent);
    const lines = cleanContent.split(/\r?\n/);
    
    if (lines.length === 0) return { headers: [], delimiter };
    
    return {
      headers: parseCSVLine(lines[0], delimiter).map(h => h.trim()),
      delimiter
    };
  }, []);
  
  // Retornar detectedDelimiter no return do hook
  return {
    // ... existentes
    detectedDelimiter,
  };
}
```

---

## Fluxo Atualizado

```text
1. Usuario faz upload do arquivo
2. Sistema remove BOM se presente
3. Sistema detecta delimitador automaticamente
4. Sistema mostra headers corretamente na etapa de mapeamento
5. Usuario mapeia campos
6. Sistema parseia dados com delimitador correto
```

---

## Interface Atualizada (Opcional)

Na etapa de mapeamento, mostrar info do arquivo:

```text
+--------------------------------------------------+
| Arquivo: controles.csv                            |
| Colunas detectadas: 5                             |
| Separador detectado: TAB                          |
+--------------------------------------------------+
```

---

## Resultado Esperado

1. Arquivos exportados do Excel com TAB funcionam corretamente
2. Arquivos com BOM nao tem header corrompido
3. Sistema detecta automaticamente o separador mais provavel
4. Menos erros de "campo obrigatorio nao mapeado" causados por leitura incorreta
