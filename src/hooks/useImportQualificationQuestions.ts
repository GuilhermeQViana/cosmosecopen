import * as XLSX from 'xlsx';

export interface ParsedQuestion {
  rowNumber: number;
  label: string;
  type: string;
  weight: number;
  is_required: boolean;
  is_ko: boolean;
  ko_value: string | null;
  options: { value: string; label: string; score: number }[];
  errors: string[];
  isValid: boolean;
}

export interface QuestionsImportResult {
  questions: ParsedQuestion[];
  validCount: number;
  invalidCount: number;
  totalCount: number;
}

const VALID_TYPES = ['text', 'multiple_choice', 'number', 'date', 'currency', 'upload'];

const TYPE_MAP: Record<string, string> = {
  'texto': 'text',
  'text': 'text',
  'multipla_escolha': 'multiple_choice',
  'multipla escolha': 'multiple_choice',
  'multiple_choice': 'multiple_choice',
  'múltipla escolha': 'multiple_choice',
  'numero': 'number',
  'número': 'number',
  'number': 'number',
  'data': 'date',
  'date': 'date',
  'moeda': 'currency',
  'currency': 'currency',
  'upload': 'upload',
  'arquivo': 'upload',
};

function normalizeBoolean(value: string | undefined): boolean | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (['sim', 's', 'yes', 'y', '1', 'true', 'verdadeiro'].includes(v)) return true;
  if (['nao', 'não', 'n', 'no', '0', 'false', 'falso'].includes(v)) return false;
  return null;
}

function parseOptions(value: string): { value: string; label: string; score: number }[] {
  if (!value.trim()) return [];
  // Format: "Sim(10);Nao(0);Parcial(5)"
  return value.split(';').map((part, idx) => {
    const match = part.trim().match(/^(.+?)\((\d+)\)$/);
    if (match) {
      const label = match[1].trim();
      return {
        value: label.toLowerCase().replace(/\s+/g, '_').slice(0, 30),
        label,
        score: parseInt(match[2], 10),
      };
    }
    // Fallback: just label, score = 0
    const label = part.trim();
    return {
      value: label.toLowerCase().replace(/\s+/g, '_').slice(0, 30) || `opt_${idx}`,
      label,
      score: 0,
    };
  }).filter(o => o.label);
}

// --- CSV utils (reused from useImportControls pattern) ---

function removeBOM(content: string): string {
  if (content.charCodeAt(0) === 0xFEFF) return content.slice(1);
  return content.replace(/^\uFEFF/, '');
}

function splitCSVLines(content: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') { inQuotes = !inQuotes; current += char; }
    else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') i++;
      lines.push(current);
      current = '';
    } else { current += char; }
  }
  if (current) lines.push(current);
  return lines;
}

function countDelimiter(line: string, d: string): number {
  let count = 0, inQ = false;
  for (const char of line) {
    if (char === '"') inQ = !inQ;
    else if (char === d && !inQ) count++;
  }
  return count;
}

function detectDelimiter(content: string): string {
  const delimiters = [',', ';', '\t', '|'];
  const lines = splitCSVLines(content).filter(l => l.trim()).slice(0, 10);
  if (!lines.length) return ',';
  let best = ',', bestScore = 0;
  for (const d of delimiters) {
    const hc = countDelimiter(lines[0], d);
    if (hc > bestScore) { bestScore = hc; best = d; }
  }
  return best;
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { current += '"'; i++; }
      else inQ = !inQ;
    } else if (c === delimiter && !inQ) { result.push(current.trim()); current = ''; }
    else current += c;
  }
  result.push(current.trim());
  return result;
}

// --- Header synonyms ---

const HEADER_MAP: Record<string, string> = {
  'pergunta': 'pergunta',
  'questao': 'pergunta',
  'questão': 'pergunta',
  'question': 'pergunta',
  'label': 'pergunta',
  'tipo': 'tipo',
  'type': 'tipo',
  'peso': 'peso',
  'weight': 'peso',
  'obrigatoria': 'obrigatoria',
  'obrigatório': 'obrigatoria',
  'obrigatorio': 'obrigatoria',
  'required': 'obrigatoria',
  'ko': 'ko',
  'eliminatoria': 'ko',
  'eliminatória': 'ko',
  'valor_ko': 'valor_ko',
  'ko_value': 'valor_ko',
  'opcoes': 'opcoes',
  'opções': 'opcoes',
  'options': 'opcoes',
};

function mapHeaders(headers: string[]): Record<number, string> {
  const mapping: Record<number, string> = {};
  headers.forEach((h, i) => {
    const key = h.toLowerCase().trim().replace(/[^a-zà-ú0-9_]/g, '');
    if (HEADER_MAP[key]) mapping[i] = HEADER_MAP[key];
  });
  return mapping;
}

// --- Main parse function ---

export function parseQuestionsCSV(content: string): QuestionsImportResult {
  const clean = removeBOM(content);
  const delimiter = detectDelimiter(clean);
  const lines = splitCSVLines(clean).filter(l => l.trim());

  if (lines.length < 2) {
    throw new Error('O arquivo deve conter pelo menos uma linha de cabeçalho e uma de dados');
  }

  const headerFields = parseCSVLine(lines[0], delimiter);
  const colMap = mapHeaders(headerFields);

  // Check if pergunta column is mapped
  const hasPergunta = Object.values(colMap).includes('pergunta');
  if (!hasPergunta) {
    throw new Error('Coluna obrigatória "pergunta" não encontrada. Verifique o cabeçalho do arquivo.');
  }

  const questions: ParsedQuestion[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line, delimiter);
    const row: Record<string, string> = {};
    Object.entries(colMap).forEach(([idx, field]) => {
      row[field] = values[parseInt(idx)] || '';
    });

    const errors: string[] = [];

    // Label (required)
    const label = row['pergunta']?.trim() || '';
    if (!label) errors.push('Pergunta é obrigatória');

    // Type
    let type = 'text';
    if (row['tipo']) {
      const mapped = TYPE_MAP[row['tipo'].toLowerCase().trim()];
      if (mapped) type = mapped;
      else if (VALID_TYPES.includes(row['tipo'].toLowerCase().trim())) type = row['tipo'].toLowerCase().trim();
      else errors.push(`Tipo "${row['tipo']}" inválido`);
    }

    // Weight
    let weight = 10;
    if (row['peso']) {
      const p = parseInt(row['peso'], 10);
      if (isNaN(p) || p < 1 || p > 100) errors.push('Peso deve ser entre 1 e 100');
      else weight = p;
    }

    // Required
    let is_required = true;
    if (row['obrigatoria']) {
      const v = normalizeBoolean(row['obrigatoria']);
      if (v === null) errors.push(`Valor "${row['obrigatoria']}" inválido para obrigatória`);
      else is_required = v;
    }

    // KO
    let is_ko = false;
    if (row['ko']) {
      const v = normalizeBoolean(row['ko']);
      if (v === null) errors.push(`Valor "${row['ko']}" inválido para KO`);
      else is_ko = v;
    }

    // KO value
    const ko_value = row['valor_ko']?.trim() || null;

    // Options
    let options: { value: string; label: string; score: number }[] = [];
    if (row['opcoes']) {
      options = parseOptions(row['opcoes']);
      if (type === 'multiple_choice' && options.length < 2) {
        errors.push('Múltipla escolha precisa de pelo menos 2 opções');
      }
    }
    if (type === 'multiple_choice' && options.length === 0 && !row['opcoes']) {
      errors.push('Coluna "opcoes" obrigatória para tipo múltipla escolha');
    }

    questions.push({
      rowNumber: i + 1,
      label,
      type,
      weight,
      is_required,
      is_ko,
      ko_value,
      options,
      errors,
      isValid: errors.length === 0,
    });
  }

  return {
    questions,
    validCount: questions.filter(q => q.isValid).length,
    invalidCount: questions.filter(q => !q.isValid).length,
    totalCount: questions.length,
  };
}

// --- Template generation ---

export function generateQuestionsTemplate(): string {
  const headers = ['pergunta', 'tipo', 'peso', 'obrigatoria', 'ko', 'valor_ko', 'opcoes'];
  const examples = [
    {
      pergunta: 'Sua empresa possui certificação ISO 27001?',
      tipo: 'multiple_choice',
      peso: '20',
      obrigatoria: 'sim',
      ko: 'sim',
      valor_ko: 'Não',
      opcoes: 'Sim(20);Não(0);Em andamento(10)',
    },
    {
      pergunta: 'Descreva sua política de segurança da informação',
      tipo: 'text',
      peso: '15',
      obrigatoria: 'sim',
      ko: 'nao',
      valor_ko: '',
      opcoes: '',
    },
    {
      pergunta: 'Upload da última auditoria de segurança',
      tipo: 'upload',
      peso: '10',
      obrigatoria: 'nao',
      ko: 'nao',
      valor_ko: '',
      opcoes: '',
    },
  ];

  const rows = [
    headers.join(';'),
    ...examples.map(ex =>
      headers.map(h => {
        const v = ex[h as keyof typeof ex] || '';
        if (v.includes(';') || v.includes('"') || v.includes('\n')) return `"${v.replace(/"/g, '""')}"`;
        return v;
      }).join(';')
    ),
  ];

  return rows.join('\n');
}

export function downloadQuestionsTemplate() {
  const content = generateQuestionsTemplate();
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-perguntas-qualificacao.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Convert Excel to CSV
export async function parseExcelQuestionsToCSV(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) throw new Error('O arquivo Excel não contém nenhuma aba');
  const sheet = workbook.Sheets[firstSheet];
  return XLSX.utils.sheet_to_csv(sheet, { FS: ';' });
}
