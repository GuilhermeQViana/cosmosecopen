import { useCallback, useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Download,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useImportControls, downloadTemplate, ParsedControl } from '@/hooks/useImportControls';
import { useBulkCreateControls, ControlInput } from '@/hooks/useCustomFrameworks';

interface ImportControlsCSVProps {
  frameworkId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ImportControlsCSV({ frameworkId, onSuccess, onCancel }: ImportControlsCSVProps) {
  const { parseFile, isLoading: isParsing, result, error, reset } = useImportControls();
  const bulkCreateControls = useBulkCreateControls();
  const [importedFile, setImportedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    setImportedFile(file);
    try {
      await parseFile(file);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [parseFile]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    disabled: isParsing,
    noClick: false,
    noKeyboard: false,
  });

  const handleImport = async () => {
    if (!result || result.validCount === 0) {
      toast.error('Não há controles válidos para importar');
      return;
    }

    try {
      const validControls: ControlInput[] = result.controls
        .filter((c) => c.isValid)
        .map(({ rowNumber, errors, isValid, ...control }) => control);

      await bulkCreateControls.mutateAsync({
        frameworkId,
        controls: validControls,
      });

      toast.success(`${validControls.length} controles importados com sucesso`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao importar controles');
    }
  };

  const handleReset = () => {
    reset();
    setImportedFile(null);
  };

  // Group errors by type for summary
  const errorSummary = useMemo(() => {
    if (!result) return [];
    const summary = new Map<string, number>();
    result.controls.forEach(control => {
      control.errors.forEach(error => {
        // Normalize duplicate code messages
        const key = error.startsWith('Código "') 
          ? 'Código duplicado no arquivo' 
          : error;
        summary.set(key, (summary.get(key) || 0) + 1);
      });
    });
    return Array.from(summary.entries())
      .sort((a, b) => b[1] - a[1]);
  }, [result]);

  return (
    <div className="space-y-4">
      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importar Controles via CSV
              </span>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate()}>
                <Download className="mr-2 h-4 w-4" />
                Baixar Template
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps({
                onClick: (e) => {
                  e.stopPropagation();
                },
              })}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors
                ${isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
                }
                ${isParsing ? 'opacity-50 cursor-wait' : ''}
              `}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isParsing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processando arquivo...</span>
                </div>
              ) : isDragActive ? (
                <p className="text-lg">Solte o arquivo aqui...</p>
              ) : (
                <>
                  <p className="text-lg mb-2">
                    Arraste um arquivo CSV ou clique para selecionar
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    O arquivo deve conter as colunas: code, name (obrigatórias)
                  </p>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      open();
                    }}
                  >
                    Selecionar Arquivo
                  </Button>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Erro ao processar arquivo</span>
                </div>
                <p className="mt-1 text-sm text-destructive/80">{error}</p>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                {importedFile?.name}
              </span>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">{result.validCount} válidos</span>
              </div>
              {result.invalidCount > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="font-medium">{result.invalidCount} com erros</span>
                </div>
              )}
              <span className="text-muted-foreground">
                Total: {result.totalCount} controles
              </span>
            </div>

            {/* Preview Table */}
            <ScrollArea className="h-[300px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Linha</TableHead>
                    <TableHead className="w-16">Status</TableHead>
                    <TableHead className="w-28">Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="min-w-[200px]">Erros</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.controls.map((control) => (
                    <TableRow 
                      key={control.rowNumber}
                      className={!control.isValid ? 'bg-destructive/5' : ''}
                    >
                      <TableCell className="font-mono text-sm">
                        {control.rowNumber}
                      </TableCell>
                      <TableCell>
                        {control.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {control.code || '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {control.name || '-'}
                      </TableCell>
                      <TableCell>{control.category || '-'}</TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Error Details */}
            {result.invalidCount > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Atenção - {result.invalidCount} controle(s) com erros</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Corrija os erros no arquivo e tente novamente, ou prossiga para importar 
                  apenas os {result.validCount} controles válidos.
                </p>
                
                {errorSummary.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Tipos de erros encontrados:
                    </p>
                    {errorSummary.map(([error, count]) => (
                      <div key={error} className="text-sm flex items-center gap-2">
                        <Badge variant="outline" className="shrink-0">{count}</Badge>
                        <span className="text-muted-foreground">{error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleReset}>
                Escolher Outro Arquivo
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleImport}
                disabled={result.validCount === 0 || bulkCreateControls.isPending}
              >
                {bulkCreateControls.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Importar {result.validCount} Controles
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
