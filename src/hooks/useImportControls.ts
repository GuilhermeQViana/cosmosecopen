import { useState, useCallback } from 'react';
import { ControlInput } from './useCustomFrameworks';

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

const REQUIRED_COLUMNS = ['code', 'name'];
const OPTIONAL_COLUMNS = [
  'category',
  'description',
  'weight',
  'criticality',
  'weight_reason',
  'implementation_example',
  'evidence_example',
  'order_index',
];

export function useImportControls() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = useCallback((content: string): ImportResult => {
    const lines = content.split(/\r?\n/).filter((line) => line.trim());
    
    if (lines.length < 2) {
      throw new Error('O arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados');
    }

    // Parse header
    const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
    
    // Validate required columns
    const missingColumns = REQUIRED_COLUMNS.filter((col) => !header.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Colunas obrigatórias faltando: ${missingColumns.join(', ')}`);
    }

    const controls: ParsedControl[] = [];
    const seenCodes = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      const errors: string[] = [];
      
      // Map values to columns
      const row: Record<string, string> = {};
      header.forEach((col, index) => {
        row[col] = values[index]?.trim() || '';
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
    async (file: File): Promise<ImportResult> => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const content = await file.text();
        const parsed = parseCSV(content);
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
  }, []);

  return {
    parseFile,
    isLoading,
    result,
    error,
    reset,
  };
}

// Helper function to parse CSV line considering quoted values
function parseCSVLine(line: string): string[] {
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
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function generateCSVTemplate(): string {
  const headers = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];
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
