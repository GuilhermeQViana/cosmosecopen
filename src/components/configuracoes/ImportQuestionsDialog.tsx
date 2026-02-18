import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  Loader2,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  parseQuestionsCSV,
  downloadQuestionsTemplate,
  parseExcelQuestionsToCSV,
  QuestionsImportResult,
} from '@/hooks/useImportQualificationQuestions';
import { useUpsertQualificationQuestion } from '@/hooks/useQualificationQuestions';

interface ImportQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  existingCount: number;
}

type Step = 'upload' | 'preview';

export function ImportQuestionsDialog({
  open,
  onOpenChange,
  templateId,
  existingCount,
}: ImportQuestionsDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [result, setResult] = useState<QuestionsImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const upsertQuestion = useUpsertQualificationQuestion();

  const handleReset = useCallback(() => {
    setStep('upload');
    setResult(null);
    setIsImporting(false);
    setIsParsing(false);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onOpenChange(false);
  }, [handleReset, onOpenChange]);

  const processFile = useCallback(async (file: File) => {
    setIsParsing(true);
    try {
      let content: string;
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') {
        content = await parseExcelQuestionsToCSV(file);
      } else {
        content = await file.text();
      }

      const parsed = parseQuestionsCSV(content);
      setResult(parsed);
      setStep('preview');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar arquivo');
    } finally {
      setIsParsing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    onDrop: (files) => files[0] && processFile(files[0]),
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv', '.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    disabled: isParsing,
    noClick: false,
  });

  const handleImport = useCallback(async () => {
    if (!result || result.validCount === 0) return;

    setIsImporting(true);
    try {
      const validQuestions = result.questions.filter(q => q.isValid);
      for (let i = 0; i < validQuestions.length; i++) {
        const q = validQuestions[i];
        await upsertQuestion.mutateAsync({
          template_id: templateId,
          label: q.label,
          type: q.type,
          weight: q.weight,
          is_required: q.is_required,
          is_ko: q.is_ko,
          ko_value: q.ko_value,
          options: q.options,
          order_index: existingCount + i,
        });
      }
      toast.success(`${validQuestions.length} perguntas importadas com sucesso`);
      handleClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao importar perguntas');
    } finally {
      setIsImporting(false);
    }
  }, [result, templateId, existingCount, upsertQuestion, handleClose]);

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      text: 'Texto',
      multiple_choice: 'Múltipla Escolha',
      number: 'Número',
      date: 'Data',
      currency: 'Moeda',
      upload: 'Upload',
    };
    return map[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Importar Perguntas</DialogTitle>
          <DialogDescription>
            {step === 'upload'
              ? 'Faça upload de um arquivo CSV ou Excel com as perguntas do questionário.'
              : `${result?.validCount || 0} perguntas prontas para importar.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={downloadQuestionsTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Template Modelo
              </Button>
            </div>

            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                ${isParsing ? 'opacity-50 cursor-wait' : ''}
              `}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              {isParsing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : isDragActive ? (
                <p>Solte o arquivo aqui...</p>
              ) : (
                <>
                  <p className="text-sm mb-1">Arraste um arquivo CSV ou Excel aqui</p>
                  <p className="text-xs text-muted-foreground mb-3">Formatos: .csv, .xlsx, .xls</p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); openFilePicker(); }}
                  >
                    Selecionar Arquivo
                  </Button>
                </>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Colunas do template:</strong> pergunta (obrigatória), tipo, peso, obrigatoria, ko, valor_ko, opcoes</p>
              <p><strong>Formato opções:</strong> Sim(10);Não(0);Parcial(5) — label(score) separados por ;</p>
            </div>
          </div>
        )}

        {step === 'preview' && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{result.validCount} válidas</span>
                </div>
                {result.invalidCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">{result.invalidCount} com erros</span>
                  </div>
                )}
              </div>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-12">✓</TableHead>
                    <TableHead>Pergunta</TableHead>
                    <TableHead className="w-28">Tipo</TableHead>
                    <TableHead className="w-16">Peso</TableHead>
                    <TableHead className="min-w-[150px]">Erros</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.questions.map((q) => (
                    <TableRow
                      key={q.rowNumber}
                      className={!q.isValid ? 'bg-destructive/5' : ''}
                    >
                      <TableCell className="font-mono text-xs">{q.rowNumber}</TableCell>
                      <TableCell>
                        {q.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{q.label || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{typeLabel(q.type)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{q.weight}</TableCell>
                      <TableCell>
                        {q.errors.length > 0 && (
                          <div className="space-y-0.5">
                            {q.errors.map((e, idx) => (
                              <p key={idx} className="text-xs text-destructive">• {e}</p>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={isImporting || result.validCount === 0}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar {result.validCount} perguntas
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
