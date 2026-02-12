import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type FieldMapping = Record<string, string | null>;

interface CSVFieldMapperProps {
  csvHeaders: string[];
  initialMapping?: FieldMapping;
  onMappingChange: (mapping: FieldMapping) => void;
  onConfirm: () => void;
  onBack: () => void;
}

interface SystemField {
  key: string;
  label: string;
  required: boolean;
  description: string;
}

const SYSTEM_FIELDS: SystemField[] = [
  { key: 'code', label: 'Código', required: true, description: 'Identificador único do controle' },
  { key: 'name', label: 'Nome', required: true, description: 'Nome/título do controle' },
  { key: 'category', label: 'Categoria', required: false, description: 'Agrupamento lógico' },
  { key: 'description', label: 'Descrição', required: false, description: 'Texto explicativo' },
  { key: 'weight', label: 'Peso (1-5)', required: false, description: 'Importância do controle' },
  { key: 'criticality', label: 'Criticidade', required: false, description: 'baixa/media/alta' },
  { key: 'weight_reason', label: 'Justificativa do Peso', required: false, description: 'Razão do peso' },
  { key: 'implementation_example', label: 'Exemplo de Implementação', required: false, description: 'Como implementar' },
  { key: 'evidence_example', label: 'Exemplo de Evidência', required: false, description: 'Evidências esperadas' },
  { key: 'order_index', label: 'Ordem', required: false, description: 'Ordem de exibição' },
];

const SYNONYMS: Record<string, string[]> = {
  code: ['code', 'codigo', 'cod', 'id', 'identificador', 'ref', 'referencia'],
  name: ['name', 'nome', 'titulo', 'title', 'controle', 'control', 'nome_controle'],
  category: ['category', 'categoria', 'grupo', 'group', 'dominio', 'domain', 'area'],
  description: ['description', 'descricao', 'desc', 'objetivo', 'detalhes', 'details'],
  weight: ['weight', 'peso', 'importancia', 'importance', 'prioridade', 'priority'],
  criticality: ['criticality', 'criticidade', 'severidade', 'severity', 'nivel', 'level'],
  weight_reason: ['weight_reason', 'justificativa', 'razao', 'motivo', 'reason'],
  implementation_example: ['implementation_example', 'implementacao', 'implementation', 'como_implementar'],
  evidence_example: ['evidence_example', 'evidencia', 'evidence', 'exemplo_evidencia'],
  order_index: ['order_index', 'ordem', 'order', 'indice', 'index', 'sequencia'],
};

// Generate unique key for localStorage based on headers
function getMappingKey(headers: string[]): string {
  const sorted = [...headers].sort().join('|');
  // Simple hash using btoa
  try {
    return `csv-mapping-${btoa(encodeURIComponent(sorted)).slice(0, 16)}`;
  } catch {
    return `csv-mapping-${headers.length}-${headers[0] || 'default'}`;
  }
}

// Save mapping to localStorage
function saveMappingToStorage(headers: string[], mapping: FieldMapping): void {
  try {
    localStorage.setItem(getMappingKey(headers), JSON.stringify(mapping));
  } catch (e) {
    console.warn('Failed to save mapping to localStorage:', e);
  }
}

// Load mapping from localStorage
function loadMappingFromStorage(headers: string[]): FieldMapping | null {
  try {
    const saved = localStorage.getItem(getMappingKey(headers));
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Auto-map fields based on synonyms with flexible matching
export function autoMapFields(csvHeaders: string[]): FieldMapping {
  const mapping: FieldMapping = {};
  const usedSystemFields = new Set<string>();

  csvHeaders.forEach(header => {
    const normalized = header.toLowerCase().trim().replace(/[_\-\s]+/g, '');
    
    for (const [field, aliases] of Object.entries(SYNONYMS)) {
      if (usedSystemFields.has(field)) continue;
      
      const normalizedAliases = aliases.map(a => a.toLowerCase().replace(/[_\-\s]+/g, ''));
      
      // 1. Exact match
      if (normalizedAliases.includes(normalized)) {
        mapping[header] = field;
        usedSystemFields.add(field);
        break;
      }
      
      // 2. Starts-with match (e.g. "codigo_controle" matches "codigo")
      const startsWithMatch = normalizedAliases.some(alias => normalized.startsWith(alias) || alias.startsWith(normalized));
      if (startsWithMatch) {
        mapping[header] = field;
        usedSystemFields.add(field);
        break;
      }

      // 3. Contains match (e.g. "nome_do_controle" contains "nome")
      const containsMatch = normalizedAliases.some(alias => 
        (alias.length >= 3 && normalized.includes(alias)) || 
        (normalized.length >= 3 && alias.includes(normalized))
      );
      if (containsMatch) {
        mapping[header] = field;
        usedSystemFields.add(field);
        break;
      }
    }
    
    if (!mapping[header]) {
      mapping[header] = null;
    }
  });

  return mapping;
}

export function CSVFieldMapper({
  csvHeaders,
  initialMapping,
  onMappingChange,
  onConfirm,
  onBack,
}: CSVFieldMapperProps) {
  // Check for saved mapping first, then use initial or auto-map
  const [mapping, setMapping] = useState<FieldMapping>(() => {
    const saved = loadMappingFromStorage(csvHeaders);
    if (saved) return saved;
    if (initialMapping) return initialMapping;
    return autoMapFields(csvHeaders);
  });
  
  const [rememberMapping, setRememberMapping] = useState(false);

  // Notify parent of mapping changes
  useEffect(() => {
    onMappingChange(mapping);
  }, [mapping, onMappingChange]);

  // Get list of already mapped system fields
  const mappedSystemFields = useMemo(() => {
    return new Set(Object.values(mapping).filter(Boolean) as string[]);
  }, [mapping]);

  // Check if required fields are mapped
  const requiredFieldsStatus = useMemo(() => {
    const requiredFields = SYSTEM_FIELDS.filter(f => f.required);
    const mappedRequired = requiredFields.filter(f => mappedSystemFields.has(f.key));
    return {
      total: requiredFields.length,
      mapped: mappedRequired.length,
      isComplete: mappedRequired.length === requiredFields.length,
      missing: requiredFields.filter(f => !mappedSystemFields.has(f.key)),
    };
  }, [mappedSystemFields]);

  // Count auto-mapped fields
  const autoMappedCount = useMemo(() => {
    return Object.values(mapping).filter(Boolean).length;
  }, [mapping]);

  const handleMappingChange = (csvHeader: string, systemField: string | null) => {
    setMapping(prev => ({
      ...prev,
      [csvHeader]: systemField === 'none' ? null : systemField,
    }));
  };

  const handleConfirm = () => {
    if (rememberMapping) {
      saveMappingToStorage(csvHeaders, mapping);
    }
    onConfirm();
  };

  const handleResetMapping = () => {
    setMapping(autoMapFields(csvHeaders));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          Mapeamento de Campos
        </CardTitle>
        <CardDescription>
          Seu arquivo tem {csvHeaders.length} colunas. Associe cada uma ao campo correspondente do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-mapping status */}
        {autoMappedCount > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm">
              {autoMappedCount} campo(s) mapeado(s) automaticamente
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto h-7 text-xs"
              onClick={handleResetMapping}
            >
              Remapear automaticamente
            </Button>
          </div>
        )}

        {/* Mapping Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Coluna do CSV</TableHead>
                <TableHead className="w-12 text-center"></TableHead>
                <TableHead>Campo do Sistema</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvHeaders.map((header) => {
                const currentMapping = mapping[header];
                const systemField = SYSTEM_FIELDS.find(f => f.key === currentMapping);
                const isRequired = systemField?.required;

                return (
                  <TableRow key={header}>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {header}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground inline-block" />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={currentMapping || 'none'}
                        onValueChange={(value) => handleMappingChange(header, value)}
                      >
                        <SelectTrigger className={cn(
                          "w-full",
                          isRequired && "border-green-500/50"
                        )}>
                          <SelectValue placeholder="Selecione um campo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <X className="h-3 w-3" />
                              Não mapear
                            </span>
                          </SelectItem>
                          {SYSTEM_FIELDS.map((field) => {
                            const isUsed = mappedSystemFields.has(field.key) && mapping[header] !== field.key;
                            return (
                              <SelectItem 
                                key={field.key} 
                                value={field.key}
                                disabled={isUsed}
                              >
                                <span className="flex items-center gap-2">
                                  {field.label}
                                  {field.required && (
                                    <Badge variant="destructive" className="text-[10px] h-4">
                                      *
                                    </Badge>
                                  )}
                                  {isUsed && (
                                    <span className="text-xs text-muted-foreground">(em uso)</span>
                                  )}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Required fields status */}
        <div className={cn(
          "p-3 rounded-lg border flex items-center gap-3",
          requiredFieldsStatus.isComplete 
            ? "bg-green-500/10 border-green-500/20" 
            : "bg-amber-500/10 border-amber-500/20"
        )}>
          {requiredFieldsStatus.isComplete ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Todos os campos obrigatórios estão mapeados
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div className="flex-1">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {requiredFieldsStatus.mapped}/{requiredFieldsStatus.total} campos obrigatórios mapeados
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Faltando: {requiredFieldsStatus.missing.map(f => f.label).join(', ')}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Remember mapping checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-mapping"
            checked={rememberMapping}
            onCheckedChange={(checked) => setRememberMapping(checked as boolean)}
          />
          <Label 
            htmlFor="remember-mapping" 
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Lembrar mapeamento para arquivos com mesmas colunas
          </Label>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!requiredFieldsStatus.isComplete}
          >
            Continuar para Preview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
