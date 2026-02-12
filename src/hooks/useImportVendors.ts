import { useState, useCallback } from 'react';
import { VENDOR_CATEGORIES, VENDOR_CRITICALITY, VENDOR_STATUS, VENDOR_DATA_CLASSIFICATION } from './useVendors';

export type VendorFieldMapping = Record<string, string | null>;

export interface ParsedVendor {
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  criticality: string;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contract_start: string | null;
  contract_end: string | null;
  service_type: string | null;
  data_classification: string | null;
  lifecycle_stage: string;
  rowNumber: number;
  errors: string[];
  isValid: boolean;
}

export interface VendorImportResult {
  vendors: ParsedVendor[];
  validCount: number;
  invalidCount: number;
  totalCount: number;
}

export interface VendorSystemField {
  key: string;
  label: string;
  required: boolean;
  description: string;
}

export const VENDOR_SYSTEM_FIELDS: VendorSystemField[] = [
  { key: 'code', label: 'Código', required: true, description: 'Ex: VND-001' },
  { key: 'name', label: 'Nome', required: true, description: 'Nome do fornecedor' },
  { key: 'description', label: 'Descrição', required: false, description: 'Descrição do fornecedor' },
  { key: 'category', label: 'Categoria', required: false, description: 'Tecnologia, Cloud, etc.' },
  { key: 'criticality', label: 'Criticidade', required: false, description: 'critica, alta, media, baixa' },
  { key: 'status', label: 'Status', required: false, description: 'ativo, inativo, etc.' },
  { key: 'contact_name', label: 'Nome do Contato', required: false, description: 'Pessoa de contato' },
  { key: 'contact_email', label: 'Email do Contato', required: false, description: 'Email de contato' },
  { key: 'contact_phone', label: 'Telefone do Contato', required: false, description: 'Telefone de contato' },
  { key: 'contract_start', label: 'Início do Contrato', required: false, description: 'Data AAAA-MM-DD' },
  { key: 'contract_end', label: 'Fim do Contrato', required: false, description: 'Data AAAA-MM-DD' },
  { key: 'service_type', label: 'Tipo de Serviço', required: false, description: 'Tipo do serviço prestado' },
  { key: 'data_classification', label: 'Classificação de Dados', required: false, description: 'publica, interna, confidencial, restrita' },
];

const VENDOR_SYNONYMS: Record<string, string[]> = {
  code: ['code', 'codigo', 'cod', 'id', 'identificador', 'ref', 'referencia', 'código'],
  name: ['name', 'nome', 'titulo', 'title', 'fornecedor', 'vendor', 'razao_social', 'razão social', 'empresa'],
  description: ['description', 'descricao', 'desc', 'descrição', 'detalhes', 'details', 'observacao', 'observação'],
  category: ['category', 'categoria', 'tipo', 'type', 'segmento', 'segment'],
  criticality: ['criticality', 'criticidade', 'severidade', 'severity', 'nivel_critico', 'risco'],
  status: ['status', 'situacao', 'situação', 'estado', 'state'],
  contact_name: ['contact_name', 'contato_nome', 'contato', 'contact', 'responsavel', 'responsável', 'nome_contato'],
  contact_email: ['contact_email', 'contato_email', 'email', 'e-mail', 'email_contato'],
  contact_phone: ['contact_phone', 'contato_telefone', 'telefone', 'phone', 'tel', 'fone', 'celular'],
  contract_start: ['contract_start', 'inicio_contrato', 'início_contrato', 'data_inicio', 'start_date', 'inicio', 'início'],
  contract_end: ['contract_end', 'fim_contrato', 'data_fim', 'end_date', 'termino', 'término', 'vencimento'],
  service_type: ['service_type', 'tipo_servico', 'tipo_serviço', 'servico', 'serviço', 'service'],
  data_classification: ['data_classification', 'classificacao_dados', 'classificação_dados', 'classificacao', 'classificação', 'dados'],
};

function removeBOM(content: string): string {
  if (content.charCodeAt(0) === 0xFEFF) return content.slice(1);
  return content.replace(/^\uFEFF/, '');
}

function countDelimiter(line: string, delimiter: string): number {
  let count = 0, inQuotes = false;
  for (const char of line) {
    if (char === '"') inQuotes = !inQuotes;
    else if (char === delimiter && !inQuotes) count++;
  }
  return count;
}

function detectDelimiter(content: string): string {
  const delimiters = [',', ';', '\t', '|'];
  const lines = content.split(/\r?\n/).filter(l => l.trim()).slice(0, 5);
  if (lines.length === 0) return ';';

  let best = ';', bestScore = 0;
  for (const d of delimiters) {
    const c = countDelimiter(lines[0], d);
    if (c === 0) continue;
    const consistent = lines.every((l, i) => i === 0 || Math.abs(countDelimiter(l, d) - c) <= 1);
    if (consistent && c > bestScore) { bestScore = c; best = d; }
  }
  return best;
}

function getDelimiterName(d: string): string {
  const names: Record<string, string> = { ',': 'Vírgula', ';': 'Ponto e vírgula', '\t': 'TAB', '|': 'Pipe' };
  return names[d] || d;
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) { result.push(current.trim()); current = ''; }
    else current += char;
  }
  result.push(current.trim());
  return result;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const VALID_CRITICALITIES = VENDOR_CRITICALITY.map(c => c.value);
const VALID_STATUSES = VENDOR_STATUS.map(s => s.value);
const VALID_CATEGORIES = VENDOR_CATEGORIES.map(c => c.toLowerCase());
const VALID_CLASSIFICATIONS = VENDOR_DATA_CLASSIFICATION.map(c => c.value);

export function autoMapVendorFields(csvHeaders: string[]): VendorFieldMapping {
  const mapping: VendorFieldMapping = {};
  const used = new Set<string>();

  csvHeaders.forEach(header => {
    const normalized = header.toLowerCase().trim().replace(/[_\-\s]+/g, '');
    for (const [field, aliases] of Object.entries(VENDOR_SYNONYMS)) {
      if (used.has(field)) continue;
      if (aliases.some(a => a.toLowerCase().replace(/[_\-\s]+/g, '') === normalized)) {
        mapping[header] = field;
        used.add(field);
        return;
      }
    }
    mapping[header] = null;
  });
  return mapping;
}

export function useImportVendors() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VendorImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedDelimiter, setDetectedDelimiter] = useState<string>(';');

  const extractHeaders = useCallback((content: string) => {
    const clean = removeBOM(content);
    const delimiter = detectDelimiter(clean);
    const lines = clean.split(/\r?\n/);
    const headers = lines.length > 0 ? parseCSVLine(lines[0], delimiter).map(h => h.trim()) : [];
    return { headers, delimiter, delimiterName: getDelimiterName(delimiter) };
  }, []);

  const parseCSV = useCallback((content: string, mapping?: VendorFieldMapping, explicitDelimiter?: string, existingCodes?: Set<string>): VendorImportResult => {
    const clean = removeBOM(content);
    const delimiter = explicitDelimiter || detectDelimiter(clean);
    setDetectedDelimiter(delimiter);

    const lines = clean.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) throw new Error('O arquivo deve conter cabeçalho e pelo menos uma linha de dados');

    const header = parseCSVLine(lines[0], delimiter).map(h => h.trim());

    const effectiveMapping: Record<string, string> = {};
    if (mapping) {
      header.forEach((h, i) => { const sf = mapping[h]; if (sf) effectiveMapping[i.toString()] = sf; });
    } else {
      header.forEach((h, i) => { effectiveMapping[i.toString()] = h.toLowerCase().trim(); });
    }

    const mappedFields = new Set(Object.values(effectiveMapping));
    if (!mappedFields.has('code') && !mappedFields.has('name')) {
      if (!mappedFields.has('name')) throw new Error('O campo obrigatório "name" deve ser mapeado');
    }

    const vendors: ParsedVendor[] = [];
    const seenCodes = new Set<string>();
    let autoCodeCounter = 1;

    // Find highest existing code for auto-generation
    if (existingCodes) {
      existingCodes.forEach(c => {
        const m = c.match(/VND-(\d+)/);
        if (m) autoCodeCounter = Math.max(autoCodeCounter, parseInt(m[1], 10) + 1);
      });
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line, delimiter);
      const errors: string[] = [];
      const row: Record<string, string> = {};
      header.forEach((_, idx) => {
        const sf = effectiveMapping[idx.toString()];
        if (sf) row[sf] = values[idx]?.trim() || '';
      });

      // Auto-generate code if missing
      if (!row.code) {
        row.code = `VND-${autoCodeCounter.toString().padStart(3, '0')}`;
        autoCodeCounter++;
      }

      if (!row.name) errors.push('Nome é obrigatório');

      if (seenCodes.has(row.code)) {
        errors.push(`Código "${row.code}" duplicado no arquivo`);
      } else {
        seenCodes.add(row.code);
      }

      if (existingCodes?.has(row.code)) {
        errors.push(`Código "${row.code}" já existe na organização`);
      }

      // Validate email
      if (row.contact_email && !EMAIL_REGEX.test(row.contact_email)) {
        errors.push('Email inválido');
      }

      // Validate dates
      if (row.contract_start && !DATE_REGEX.test(row.contract_start)) {
        errors.push('Data de início inválida (use AAAA-MM-DD)');
      }
      if (row.contract_end && !DATE_REGEX.test(row.contract_end)) {
        errors.push('Data de fim inválida (use AAAA-MM-DD)');
      }

      // Normalize criticality
      let criticality = 'media';
      if (row.criticality) {
        const norm = row.criticality.toLowerCase().trim();
        if (VALID_CRITICALITIES.includes(norm)) criticality = norm;
        else errors.push(`Criticidade "${row.criticality}" inválida`);
      }

      // Normalize status
      let status = 'ativo';
      if (row.status) {
        const norm = row.status.toLowerCase().trim();
        if (VALID_STATUSES.includes(norm)) status = norm;
        else errors.push(`Status "${row.status}" inválido`);
      }

      // Normalize category
      let category: string | null = null;
      if (row.category) {
        const match = VENDOR_CATEGORIES.find(c => c.toLowerCase() === row.category.toLowerCase().trim());
        category = match || row.category.trim();
      }

      // Normalize data classification
      let dataClassification: string | null = null;
      if (row.data_classification) {
        const norm = row.data_classification.toLowerCase().trim();
        if (VALID_CLASSIFICATIONS.includes(norm)) dataClassification = norm;
        else dataClassification = row.data_classification.trim();
      }

      vendors.push({
        code: row.code,
        name: row.name || '',
        description: row.description || null,
        category,
        criticality,
        status,
        contact_name: row.contact_name || null,
        contact_email: row.contact_email || null,
        contact_phone: row.contact_phone || null,
        contract_start: row.contract_start && DATE_REGEX.test(row.contract_start) ? row.contract_start : null,
        contract_end: row.contract_end && DATE_REGEX.test(row.contract_end) ? row.contract_end : null,
        service_type: row.service_type || null,
        data_classification: dataClassification,
        lifecycle_stage: 'ativo',
        rowNumber: i + 1,
        errors,
        isValid: errors.length === 0,
      });
    }

    return {
      vendors,
      validCount: vendors.filter(v => v.isValid).length,
      invalidCount: vendors.filter(v => !v.isValid).length,
      totalCount: vendors.length,
    };
  }, []);

  const parseFile = useCallback(async (file: File, mapping?: VendorFieldMapping, delimiter?: string, existingCodes?: Set<string>) => {
    setIsLoading(true); setError(null); setResult(null);
    try {
      const content = await file.text();
      const parsed = parseCSV(content, mapping, delimiter, existingCodes);
      setResult(parsed);
      return parsed;
    } catch (err: any) {
      setError(err.message || 'Erro ao processar arquivo');
      throw err;
    } finally { setIsLoading(false); }
  }, [parseCSV]);

  const parseContent = useCallback((content: string, mapping?: VendorFieldMapping, delimiter?: string, existingCodes?: Set<string>) => {
    setIsLoading(true); setError(null); setResult(null);
    try {
      const parsed = parseCSV(content, mapping, delimiter, existingCodes);
      setResult(parsed);
      return parsed;
    } catch (err: any) {
      setError(err.message || 'Erro ao processar arquivo');
      throw err;
    } finally { setIsLoading(false); }
  }, [parseCSV]);

  const reset = useCallback(() => { setResult(null); setError(null); setIsLoading(false); }, []);

  return { parseFile, parseContent, extractHeaders, isLoading, result, error, reset, detectedDelimiter };
}

export function generateVendorCSVTemplate(): string {
  const headers = ['codigo', 'nome', 'descricao', 'categoria', 'criticidade', 'status', 'contato_nome', 'contato_email', 'contato_telefone', 'inicio_contrato', 'fim_contrato', 'tipo_servico', 'classificacao_dados'];
  const rows = [
    ['VND-001', 'Amazon AWS', 'Servicos de cloud computing', 'Cloud', 'critica', 'ativo', 'Joao Silva', 'joao@aws.com', '11999990000', '2024-01-01', '2026-12-31', 'cloud', 'confidencial'],
    ['VND-002', 'Consultoria XYZ', 'Consultoria em seguranca', 'Consultoria', 'media', 'ativo', 'Maria Santos', 'maria@xyz.com', '11988880000', '2024-06-01', '2025-05-31', 'consultoria', 'interna'],
  ];
  return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
}

export function downloadVendorTemplate() {
  const content = generateVendorCSVTemplate();
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-fornecedores.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
