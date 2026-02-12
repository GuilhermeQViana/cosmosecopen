import { useCallback, useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  X,
  ArrowLeft,
  Link as LinkIcon,
  FileText,
  Sheet
} from 'lucide-react';
import { toast } from 'sonner';
import { useImportControls, downloadTemplate, FieldMapping, parseExcelToCSV, fetchGoogleSheetAsCSV, getFileType } from '@/hooks/useImportControls';
import { useBulkCreateControls, ControlInput } from '@/hooks/useCustomFrameworks';
import { CSVImportTutorial } from './CSVImportTutorial';
import { CSVFieldMapper, autoMapFields } from './CSVFieldMapper';

interface ImportControlsCSVProps {
  frameworkId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type ImportStep = 'upload' | 'mapping' | 'preview';
type SourceType = 'csv' | 'excel' | 'google-sheets';

export function ImportControlsCSV({ frameworkId, onSuccess, onCancel }: ImportControlsCSVProps) {
  const { parseContent, extractHeaders, isLoading: isParsing, result, error, reset, detectedDelimiter } = useImportControls();
  const bulkCreateControls = useBulkCreateControls();
  
  const [step, setStep] = useState<ImportStep>('upload');
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvDelimiter, setCsvDelimiter] = useState<string>(',');
  const [csvDelimiterName, setCsvDelimiterName] = useState<string>('Vírgula');
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [sourceType, setSourceType] = useState<SourceType>('csv');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [sourceName, setSourceName] = useState<string>('');

  const processContent = useCallback(async (content: string, fileName: string, type: SourceType) => {
    setCsvContent(content);
    setSourceType(type);
    setSourceName(fileName);

    const { headers, delimiter, delimiterName } = extractHeaders(content);
    if (headers.length === 0) {
      toast.error('Arquivo inválido ou vazio');
      return;
    }

    setCsvHeaders(headers);
    setCsvDelimiter(delimiter);
    setCsvDelimiterName(delimiterName);

    const autoMapping = autoMapFields(headers);
    setFieldMapping(autoMapping);
    setStep('mapping');
  }, [extractHeaders]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const fileType = getFileType(file.name);
    if (fileType === 'unknown') {
      toast.error('Formato não suportado. Use CSV, XLSX ou XLS.');
      return;
    }

    setImportedFile(file);

    try {
      let content: string;
      if (fileType === 'excel') {
        content = await parseExcelToCSV(file);
      } else {
        content = await file.text();
      }
      await processContent(content, file.name, fileType === 'excel' ? 'excel' : 'csv');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao ler arquivo');
    }
  }, [processContent]);

  const handleLoadGoogleSheet = useCallback(async () => {
    if (!googleSheetUrl.trim()) {
      toast.error('Cole o link da planilha do Google Sheets');
      return;
    }

    setIsLoadingSheet(true);
    try {
      const content = await fetchGoogleSheetAsCSV(googleSheetUrl);
      setImportedFile(null);
      await processContent(content, 'Google Sheets', 'google-sheets');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar planilha');
    } finally {
      setIsLoadingSheet(false);
    }
  }, [googleSheetUrl, processContent]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv', '.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    disabled: isParsing,
    noClick: false,
    noKeyboard: false,
  });

  const handleMappingConfirm = useCallback(() => {
    if (!csvContent) return;

    try {
      parseContent(csvContent, fieldMapping, csvDelimiter);
      setStep('preview');
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [csvContent, fieldMapping, csvDelimiter, parseContent]);

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
    setCsvContent(null);
    setCsvHeaders([]);
    setCsvDelimiter(',');
    setCsvDelimiterName('Vírgula');
    setFieldMapping({});
    setImportedFile(null);
    setSourceType('csv');
    setSourceName('');
    setGoogleSheetUrl('');
    setStep('upload');
  };

  const handleBackToUpload = () => {
    reset();
    setStep('upload');
  };

  const handleBackToMapping = () => {
    reset();
    setStep('mapping');
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

  // Render based on current step
  if (step === 'upload') {
    return (
      <div className="space-y-4">
        {/* Tutorial */}
        {showTutorial && (
          <CSVImportTutorial 
            onDownloadTemplate={downloadTemplate}
            defaultOpen={true}
          />
        )}

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importar Controles
              </span>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate()}>
                <Download className="mr-2 h-4 w-4" />
                Baixar Template
              </Button>
            </CardTitle>
            <CardDescription>
              Importe controles a partir de CSV, Excel ou Google Sheets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    Arraste um arquivo CSV ou Excel aqui
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Formatos aceitos: .csv, .xlsx, .xls
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

            {/* Google Sheets input */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sheet className="h-4 w-4" />
                Link do Google Sheets
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  disabled={isLoadingSheet}
                />
                <Button
                  onClick={handleLoadGoogleSheet}
                  disabled={isLoadingSheet || !googleSheetUrl.trim()}
                  variant="secondary"
                >
                  {isLoadingSheet ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LinkIcon className="h-4 w-4 mr-2" />
                  )}
                  Carregar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                A planilha deve estar compartilhada como "Qualquer pessoa com o link pode ver"
              </p>
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
      </div>
    );
  }

  if (step === 'mapping') {
    return (
      <div className="space-y-4">
        {/* File info */}
        <Card className="bg-muted/50">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              {sourceType === 'excel' ? <FileSpreadsheet className="h-5 w-5 text-muted-foreground" /> 
               : sourceType === 'google-sheets' ? <Sheet className="h-5 w-5 text-muted-foreground" /> 
               : <FileText className="h-5 w-5 text-muted-foreground" />}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{sourceName}</p>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {sourceType === 'excel' ? 'Excel' : sourceType === 'google-sheets' ? 'Google Sheets' : 'CSV'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {csvHeaders.length} colunas detectadas • Separador: {csvDelimiterName}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleBackToUpload}>
                <X className="h-4 w-4 mr-1" />
                Trocar arquivo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Field Mapper */}
        <CSVFieldMapper
          csvHeaders={csvHeaders}
          initialMapping={fieldMapping}
          onMappingChange={setFieldMapping}
          onConfirm={handleMappingConfirm}
          onBack={handleBackToUpload}
        />
      </div>
    );
  }

  // Preview step
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              {sourceType === 'excel' ? <FileSpreadsheet className="h-4 w-4" /> 
               : sourceType === 'google-sheets' ? <Sheet className="h-4 w-4" /> 
               : <FileText className="h-4 w-4" />}
              {sourceName}
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {sourceType === 'excel' ? 'Excel' : sourceType === 'google-sheets' ? 'Google Sheets' : 'CSV'}
              </Badge>
            </span>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            Revise os dados antes de importar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-medium">{result?.validCount || 0} válidos</span>
            </div>
            {result && result.invalidCount > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="font-medium">{result.invalidCount} com erros</span>
              </div>
            )}
            <span className="text-muted-foreground">
              Total: {result?.totalCount || 0} controles
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
                {result?.controls.map((control) => (
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
          {result && result.invalidCount > 0 && (
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
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={handleBackToMapping}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Mapeamento
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleImport}
                disabled={(result?.validCount || 0) === 0 || bulkCreateControls.isPending}
              >
                {bulkCreateControls.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Importar {result?.validCount || 0} Controles
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
