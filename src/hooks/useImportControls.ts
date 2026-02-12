import { useState, useCallback } from 'react';
import { ControlInput } from './useCustomFrameworks';

export type FieldMapping = Record<string, string | null>;

export interface ParsedControl extends ControlInput {
  rowNumber: number;
  errors: string[];
  isValid: boolean;
}

export interface ImportResult {
  controls: ParsedControl[];
  validCount: number;
  invalidCount: number;
  totalCount: number;
}

export interface ExtractHeadersResult {
  headers: string[];
  delimiter: string;
  delimiterName: string;
}

const REQUIRED_FIELDS = ['code', 'name'];

// Remove BOM (Byte Order Mark) from content
function removeBOM(content: string): string {
  // UTF-8 BOM as unicode character
  if (content.charCodeAt(0) === 0xFEFF) {
    return content.slice(1);
  }
  // UTF-8 BOM as escaped bytes (when incorrectly read)
  if (content.startsWith('\uFEFF')) {
    return content.replace(/^\uFEFF/, '');
  }
  return content;
}

// Count delimiter occurrences in a line (ignoring quoted sections)
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

// Auto-detect the delimiter used in CSV content
function detectDelimiter(content: string): string {
  const delimiters = [',', ';', '\t', '|'];
  const lines = content.split(/\r?\n/).filter(l => l.trim()).slice(0, 10);

  if (lines.length === 0) return ',';

  // Count occurrences of each delimiter in the header (first line)
  const headerCounts: Record<string, number> = {};
  delimiters.forEach(d => {
    headerCounts[d] = countDelimiterOccurrences(lines[0], d);
  });

  // Find the best delimiter based on consistency and count
  let bestDelimiter = ',';
  let bestScore = 0;

  for (const d of delimiters) {
    if (headerCounts[d] === 0) continue;

    const headerCount = headerCounts[d];
    const dataLines = lines.slice(1);

    if (dataLines.length === 0) {
      // Only header — use highest count
      if (headerCount > bestScore) {
        bestScore = headerCount;
        bestDelimiter = d;
      }
      continue;
    }

    // Tolerant consistency: accept data rows with count >= 50% of header count
    const minAcceptable = Math.floor(headerCount / 2);
    const consistentCount = dataLines.filter(line => {
      const c = countDelimiterOccurrences(line, d);
      return c >= minAcceptable && c <= headerCount + 1;
    }).length;

    // Accept if majority (>= 60%) of data lines are consistent
    const isConsistent = consistentCount >= Math.ceil(dataLines.length * 0.6);

    if (isConsistent && headerCount > bestScore) {
      bestScore = headerCount;
      bestDelimiter = d;
    }
  }

  // Fallback: if no delimiter passed consistency, pick the one with highest header count
  if (bestScore === 0) {
    let fallbackMax = 0;
    for (const d of delimiters) {
      if (headerCounts[d] > fallbackMax) {
        fallbackMax = headerCounts[d];
        bestDelimiter = d;
      }
    }
  }

  return bestDelimiter;
}

// Get human-readable name for delimiter
function getDelimiterName(delimiter: string): string {
  switch (delimiter) {
    case ',': return 'Vírgula';
    case ';': return 'Ponto e vírgula';
    case '\t': return 'TAB';
    case '|': return 'Pipe';
    default: return delimiter;
  }
}

// Parse a single CSV line with dynamic delimiter
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
        i++; // Skip next quote
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

export function useImportControls() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedDelimiter, setDetectedDelimiter] = useState<string>(',');

  const extractHeaders = useCallback((content: string): ExtractHeadersResult => {
    const cleanContent = removeBOM(content);
    const delimiter = detectDelimiter(cleanContent);
    const lines = cleanContent.split(/\r?\n/);

    if (lines.length === 0) {
      return { headers: [], delimiter, delimiterName: getDelimiterName(delimiter) };
    }

    const headers = parseCSVLine(lines[0], delimiter).map(h => h.trim());
    
    return { 
      headers, 
      delimiter,
      delimiterName: getDelimiterName(delimiter)
    };
  }, []);

  const parseCSV = useCallback((content: string, customMapping?: FieldMapping, explicitDelimiter?: string): ImportResult => {
    // Remove BOM and clean content
    const cleanContent = removeBOM(content);
    
    // Detect or use explicit delimiter
    const delimiter = explicitDelimiter || detectDelimiter(cleanContent);
    setDetectedDelimiter(delimiter);
    
    const lines = cleanContent.split(/\r?\n/).filter((line) => line.trim());
    
    if (lines.length < 2) {
      throw new Error('O arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados');
    }

    // Parse header with correct delimiter
    const header = parseCSVLine(lines[0], delimiter).map((h) => h.trim());
    
    // Build effective mapping
    let effectiveMapping: Record<string, string>;
    
    if (customMapping) {
      // Use custom mapping - invert it to get header -> system field
      effectiveMapping = {};
      header.forEach((h, index) => {
        const systemField = customMapping[h];
        if (systemField) {
          effectiveMapping[index.toString()] = systemField;
        }
      });
    } else {
      // Use header directly (legacy behavior)
      effectiveMapping = {};
      header.forEach((h, index) => {
        effectiveMapping[index.toString()] = h.toLowerCase().trim();
      });
    }

    // Validate required fields are mapped
    const mappedFields = new Set(Object.values(effectiveMapping));
    const missingRequired = REQUIRED_FIELDS.filter(f => !mappedFields.has(f));
    if (missingRequired.length > 0) {
      throw new Error(`Os campos obrigatórios "${missingRequired.join(', ')}" devem ser mapeados`);
    }

    const controls: ParsedControl[] = [];
    const seenCodes = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse with correct delimiter
      const values = parseCSVLine(line, delimiter);
      const errors: string[] = [];
      
      // Map values to system fields using the effective mapping
      const row: Record<string, string> = {};
      header.forEach((_, index) => {
        const systemField = effectiveMapping[index.toString()];
        if (systemField) {
          row[systemField] = values[index]?.trim() || '';
        }
      });

      // Validate required fields
      if (!row.code) {
        errors.push('Código é obrigatório');
      } else if (seenCodes.has(row.code)) {
        errors.push(`Código "${row.code}" duplicado no arquivo`);
      } else {
        seenCodes.add(row.code);
      }

      if (!row.name) {
        errors.push('Nome é obrigatório');
      }

      // Parse weight
      let weight = 1;
      if (row.weight) {
        const parsedWeight = parseInt(row.weight, 10);
        if (isNaN(parsedWeight) || parsedWeight < 1 || parsedWeight > 5) {
          errors.push('Peso deve ser um número entre 1 e 5');
        } else {
          weight = parsedWeight;
        }
      }

      // Parse order_index
      let orderIndex = i;
      if (row.order_index) {
        const parsedIndex = parseInt(row.order_index, 10);
        if (!isNaN(parsedIndex)) {
          orderIndex = parsedIndex;
        }
      }

      const control: ParsedControl = {
        code: row.code || '',
        name: row.name || '',
        category: row.category || undefined,
        description: row.description || undefined,
        weight,
        criticality: row.criticality || undefined,
        weight_reason: row.weight_reason || undefined,
        implementation_example: row.implementation_example || undefined,
        evidence_example: row.evidence_example || undefined,
        order_index: orderIndex,
        rowNumber: i + 1,
        errors,
        isValid: errors.length === 0,
      };

      controls.push(control);
    }

    const validControls = controls.filter((c) => c.isValid);
    const invalidControls = controls.filter((c) => !c.isValid);

    return {
      controls,
      validCount: validControls.length,
      invalidCount: invalidControls.length,
      totalCount: controls.length,
    };
  }, []);

  const parseFile = useCallback(
    async (file: File, customMapping?: FieldMapping, delimiter?: string): Promise<ImportResult> => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const content = await file.text();
        const parsed = parseCSV(content, customMapping, delimiter);
        setResult(parsed);
        return parsed;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao processar arquivo';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [parseCSV]
  );

  const parseContent = useCallback(
    (content: string, customMapping?: FieldMapping, delimiter?: string): ImportResult => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const parsed = parseCSV(content, customMapping, delimiter);
        setResult(parsed);
        return parsed;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao processar arquivo';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [parseCSV]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
    setDetectedDelimiter(',');
  }, []);

  return {
    parseFile,
    parseContent,
    extractHeaders,
    isLoading,
    result,
    error,
    reset,
    detectedDelimiter,
  };
}

export function generateCSVTemplate(): string {
  const headers = ['code', 'name', 'category', 'description', 'weight', 'criticality', 'weight_reason', 'implementation_example', 'evidence_example', 'order_index'];
  const exampleRows = [
    {
      code: 'CTRL-001',
      name: 'Política de Segurança da Informação',
      category: 'Governança',
      description: 'Estabelecer diretrizes e princípios de segurança da informação',
      weight: '3',
      criticality: 'alta',
      weight_reason: 'Controle fundamental para o programa de segurança',
      implementation_example: 'Documento formal aprovado pela alta direção',
      evidence_example: 'Política assinada e publicada na intranet',
      order_index: '1',
    },
    {
      code: 'CTRL-002',
      name: 'Gestão de Ativos',
      category: 'Ativos',
      description: 'Identificar e classificar ativos de informação',
      weight: '2',
      criticality: 'media',
      weight_reason: 'Importante para inventário de ativos',
      implementation_example: 'Sistema de inventário de ativos atualizado',
      evidence_example: 'Relatório do sistema de gestão de ativos',
      order_index: '2',
    },
  ];

  const rows = [
    headers.join(','),
    ...exampleRows.map((row) =>
      headers.map((h) => {
        const value = row[h as keyof typeof row] || '';
        // Quote values that contain commas or quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ];

  return rows.join('\n');
}

export function downloadTemplate() {
  const content = generateCSVTemplate();
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-controles-framework.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
