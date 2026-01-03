import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Upload,
  FileJson,
  FileSpreadsheet,
  Loader2,
  Check,
  X,
  AlertTriangle,
  FileUp,
  Database,
} from 'lucide-react';

interface ImportResult {
  total: number;
  valid: number;
  errors: string[];
}

interface PreviewData {
  metadata?: {
    organization_name?: string;
    exported_at?: string;
    version?: string;
  };
  results: {
    assessments: ImportResult;
    risks: ImportResult;
    action_plans: ImportResult;
  };
}

export function ImportBackupDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [fileData, setFileData] = useState<any>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const parseCSV = (content: string): any => {
    // Simple CSV to JSON parser for backup format
    const lines = content.trim().split('\n');
    if (lines.length < 2) return null;

    // Detect section headers
    const result: any = {
      assessments: [],
      risks: [],
      action_plans: [],
    };

    let currentSection = '';
    let headers: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('## ')) {
        currentSection = trimmedLine.replace('## ', '').toLowerCase().replace(' ', '_');
        headers = [];
        continue;
      }

      if (!currentSection) continue;

      const values = trimmedLine.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (headers.length === 0) {
        headers = values;
        continue;
      }

      if (values.length !== headers.length) continue;

      const item: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // Convert numeric fields
        if (['inherent_probability', 'inherent_impact', 'residual_probability', 'residual_impact'].includes(header)) {
          item[header] = parseInt(value, 10) || 1;
        } else {
          item[header] = value;
        }
      });

      if (currentSection === 'assessments' && result.assessments) {
        result.assessments.push(item);
      } else if (currentSection === 'risks' && result.risks) {
        result.risks.push(item);
      } else if (currentSection === 'action_plans' && result.action_plans) {
        result.action_plans.push(item);
      }
    }

    return result;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    try {
      const content = await file.text();
      let parsedData: any;

      if (file.name.endsWith('.json')) {
        parsedData = JSON.parse(content);
      } else if (file.name.endsWith('.csv')) {
        parsedData = parseCSV(content);
      } else {
        throw new Error('Formato de arquivo não suportado');
      }

      if (!parsedData) {
        throw new Error('Não foi possível processar o arquivo');
      }

      setFileData(parsedData);

      // Preview the import
      const { data, error } = await supabase.functions.invoke('import-data', {
        body: { data: parsedData, mode: 'preview' },
      });

      if (error) throw error;

      setPreviewData(data);
    } catch (error: any) {
      console.error('Error parsing file:', error);
      toast.error(error.message || 'Erro ao processar arquivo');
      setFileData(null);
      setPreviewData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleImport = async () => {
    if (!fileData) return;

    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-data', {
        body: { data: fileData, mode: 'import' },
      });

      if (error) throw error;

      const results = data.results;
      const totalImported = 
        results.assessments.valid + 
        results.risks.valid + 
        results.action_plans.valid;

      toast.success(`Importação concluída! ${totalImported} itens importados.`);
      
      setConfirmDialogOpen(false);
      setDialogOpen(false);
      resetState();
    } catch (error: any) {
      console.error('Error importing:', error);
      toast.error(error.message || 'Erro ao importar dados');
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setFileData(null);
    setFileName('');
    setPreviewData(null);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetState();
  };

  const getTotalValid = () => {
    if (!previewData) return 0;
    return (
      previewData.results.assessments.valid +
      previewData.results.risks.valid +
      previewData.results.action_plans.valid
    );
  };

  const getTotalErrors = () => {
    if (!previewData) return 0;
    return (
      previewData.results.assessments.errors.length +
      previewData.results.risks.errors.length +
      previewData.results.action_plans.errors.length
    );
  };

  return (
    <>
      <Button variant="outline" onClick={() => setDialogOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Importar Backup
      </Button>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Importar Backup
            </DialogTitle>
            <DialogDescription>
              Restaure dados de um backup JSON ou CSV exportado anteriormente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!previewData ? (
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors duration-200
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                `}
              >
                <input {...getInputProps()} />
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Processando arquivo...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <FileUp className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo ou clique para selecionar'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Formatos aceitos: JSON, CSV (máx. 10MB)
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="gap-1">
                        <FileJson className="h-3 w-3" />
                        JSON
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <FileSpreadsheet className="h-3 w-3" />
                        CSV
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* File info */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileJson className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{fileName}</p>
                    {previewData.metadata?.exported_at && (
                      <p className="text-xs text-muted-foreground">
                        Exportado em: {new Date(previewData.metadata.exported_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetState}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Preview summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Resumo da Importação</CardTitle>
                    <CardDescription>
                      {getTotalValid()} itens serão importados
                      {getTotalErrors() > 0 && `, ${getTotalErrors()} com erros`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Assessments */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Avaliações de Controles</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {previewData.results.assessments.valid}/{previewData.results.assessments.total}
                          </Badge>
                          {previewData.results.assessments.errors.length > 0 && (
                            <Badge variant="destructive">
                              {previewData.results.assessments.errors.length} erros
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={previewData.results.assessments.total > 0 
                          ? (previewData.results.assessments.valid / previewData.results.assessments.total) * 100 
                          : 0} 
                        className="h-2"
                      />
                    </div>

                    {/* Risks */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Riscos</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {previewData.results.risks.valid}/{previewData.results.risks.total}
                          </Badge>
                          {previewData.results.risks.errors.length > 0 && (
                            <Badge variant="destructive">
                              {previewData.results.risks.errors.length} erros
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={previewData.results.risks.total > 0 
                          ? (previewData.results.risks.valid / previewData.results.risks.total) * 100 
                          : 0} 
                        className="h-2"
                      />
                    </div>

                    {/* Action Plans */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Planos de Ação</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {previewData.results.action_plans.valid}/{previewData.results.action_plans.total}
                          </Badge>
                          {previewData.results.action_plans.errors.length > 0 && (
                            <Badge variant="destructive">
                              {previewData.results.action_plans.errors.length} erros
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={previewData.results.action_plans.total > 0 
                          ? (previewData.results.action_plans.valid / previewData.results.action_plans.total) * 100 
                          : 0} 
                        className="h-2"
                      />
                    </div>

                    {/* Errors */}
                    {getTotalErrors() > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Erros encontrados
                          </p>
                          <ScrollArea className="h-32 rounded border p-2">
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {[
                                ...previewData.results.assessments.errors,
                                ...previewData.results.risks.errors,
                                ...previewData.results.action_plans.errors,
                              ].map((error, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <X className="h-3 w-3 mt-0.5 text-destructive shrink-0" />
                                  {error}
                                </li>
                              ))}
                            </ul>
                          </ScrollArea>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => setConfirmDialogOpen(true)}
              disabled={!previewData || getTotalValid() === 0}
            >
              <Check className="mr-2 h-4 w-4" />
              Importar Dados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Importação</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá importar {getTotalValid()} itens para sua organização.
              Itens existentes com o mesmo identificador serão atualizados.
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImporting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport} disabled={isImporting}>
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Confirmar Importação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
