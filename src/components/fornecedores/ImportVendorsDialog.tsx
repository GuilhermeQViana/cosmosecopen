import { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import {
  Upload, Download, FileSpreadsheet, ArrowRight, ArrowLeft, CheckCircle2,
  AlertTriangle, Sparkles, X, Loader2, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useImportVendors,
  VendorFieldMapping,
  ParsedVendor,
  VENDOR_SYSTEM_FIELDS,
  autoMapVendorFields,
  downloadVendorTemplate,
} from '@/hooks/useImportVendors';
import { useVendors, useBulkCreateVendors } from '@/hooks/useVendors';

type Step = 'upload' | 'mapping' | 'preview';

interface ImportVendorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportVendorsDialog({ open, onOpenChange }: ImportVendorsDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<VendorFieldMapping>({});
  const [delimiter, setDelimiter] = useState<string>(';');
  const [delimiterName, setDelimiterName] = useState<string>('Ponto e vírgula');

  const { toast } = useToast();
  const { data: existingVendors } = useVendors();
  const importHook = useImportVendors();
  const bulkCreate = useBulkCreateVendors();

  const existingCodes = useMemo(() => {
    return new Set(existingVendors?.map(v => v.code) || []);
  }, [existingVendors]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    const content = await f.text();
    setFileContent(content);
    const { headers, delimiter: d, delimiterName: dn } = importHook.extractHeaders(content);
    setCsvHeaders(headers);
    setDelimiter(d);
    setDelimiterName(dn);
    setMapping(autoMapVendorFields(headers));
    setStep('mapping');
  }, [importHook]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.txt'], 'application/vnd.ms-excel': ['.xls', '.csv'] },
    maxFiles: 1,
  });

  const handleParsePreview = () => {
    try {
      importHook.parseContent(fileContent, mapping, delimiter, existingCodes);
      setStep('preview');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleImport = async () => {
    const validVendors = importHook.result?.vendors.filter(v => v.isValid);
    if (!validVendors || validVendors.length === 0) return;

    try {
      await bulkCreate.mutateAsync(validVendors.map(v => ({
        code: v.code,
        name: v.name,
        description: v.description,
        category: v.category,
        criticality: v.criticality,
        status: v.status,
        contact_name: v.contact_name,
        contact_email: v.contact_email,
        contact_phone: v.contact_phone,
        contract_start: v.contract_start,
        contract_end: v.contract_end,
        service_type: v.service_type,
        data_classification: v.data_classification,
        lifecycle_stage: v.lifecycle_stage,
      })));
      toast({ title: 'Importação concluída', description: `${validVendors.length} fornecedores importados com sucesso` });
      handleClose();
    } catch (err: any) {
      toast({ title: 'Erro na importação', description: err.message, variant: 'destructive' });
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setFileContent('');
    setCsvHeaders([]);
    setMapping({});
    importHook.reset();
    onOpenChange(false);
  };

  // Mapping helpers
  const mappedSystemFields = useMemo(() => new Set(Object.values(mapping).filter(Boolean) as string[]), [mapping]);
  const requiredMapped = useMemo(() => {
    const req = VENDOR_SYSTEM_FIELDS.filter(f => f.required);
    const mapped = req.filter(f => mappedSystemFields.has(f.key));
    return { total: req.length, mapped: mapped.length, isComplete: mapped.length === req.length, missing: req.filter(f => !mappedSystemFields.has(f.key)) };
  }, [mappedSystemFields]);

  const autoMappedCount = useMemo(() => Object.values(mapping).filter(Boolean).length, [mapping]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o ? handleClose() : onOpenChange(o)}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-space">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Importar Fornecedores
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Faça upload do arquivo CSV com seus fornecedores'}
            {step === 'mapping' && 'Associe as colunas do CSV aos campos do sistema'}
            {step === 'preview' && 'Revise os dados antes de importar'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          {(['upload', 'mapping', 'preview'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === s ? "bg-primary text-primary-foreground" :
                  (['upload', 'mapping', 'preview'].indexOf(step) > i) ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              )}>
                {(['upload', 'mapping', 'preview'].indexOf(step) > i) ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("text-sm hidden sm:inline", step === s ? "font-medium" : "text-muted-foreground")}>
                {s === 'upload' ? 'Upload' : s === 'mapping' ? 'Mapeamento' : 'Preview'}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-1">
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo CSV'}
              </p>
              <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground mt-2">Formatos aceitos: .csv, .txt</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Não tem um arquivo?</p>
                <p className="text-xs text-muted-foreground">Baixe o template com exemplos preenchidos</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadVendorTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Template
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Mapping */}
        {step === 'mapping' && (
          <div className="space-y-4">
            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg text-sm">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <span className="font-medium">{file.name}</span>
                <Badge variant="outline" className="ml-auto">{delimiterName}</Badge>
                <Badge variant="outline">{csvHeaders.length} colunas</Badge>
              </div>
            )}

            {autoMappedCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">{autoMappedCount} campo(s) mapeado(s) automaticamente</span>
                <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => setMapping(autoMapVendorFields(csvHeaders))}>
                  Remapear
                </Button>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden max-h-[40vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Coluna do CSV</TableHead>
                    <TableHead className="w-12 text-center" />
                    <TableHead>Campo do Sistema</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvHeaders.map(header => {
                    const current = mapping[header];
                    const sf = VENDOR_SYSTEM_FIELDS.find(f => f.key === current);
                    return (
                      <TableRow key={header}>
                        <TableCell><code className="px-2 py-1 bg-muted rounded text-sm">{header}</code></TableCell>
                        <TableCell className="text-center"><ArrowRight className="h-4 w-4 text-muted-foreground inline-block" /></TableCell>
                        <TableCell>
                          <Select value={current || 'none'} onValueChange={v => setMapping(p => ({ ...p, [header]: v === 'none' ? null : v }))}>
                            <SelectTrigger className={cn("w-full", sf?.required && "border-green-500/50")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none"><span className="text-muted-foreground flex items-center gap-2"><X className="h-3 w-3" /> Não mapear</span></SelectItem>
                              {VENDOR_SYSTEM_FIELDS.map(field => {
                                const used = mappedSystemFields.has(field.key) && mapping[header] !== field.key;
                                return (
                                  <SelectItem key={field.key} value={field.key} disabled={used}>
                                    <span className="flex items-center gap-2">
                                      {field.label}
                                      {field.required && <Badge variant="destructive" className="text-[10px] h-4">*</Badge>}
                                      {used && <span className="text-xs text-muted-foreground">(em uso)</span>}
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

            <div className={cn("p-3 rounded-lg border flex items-center gap-3", requiredMapped.isComplete ? "bg-green-500/10 border-green-500/20" : "bg-amber-500/10 border-amber-500/20")}>
              {requiredMapped.isComplete ? (
                <><CheckCircle2 className="h-5 w-5 text-green-500" /><span className="text-sm font-medium text-green-700 dark:text-green-400">Todos os campos obrigatórios mapeados</span></>
              ) : (
                <><AlertTriangle className="h-5 w-5 text-amber-500" /><div><span className="text-sm font-medium text-amber-700 dark:text-amber-400">{requiredMapped.mapped}/{requiredMapped.total} campos obrigatórios</span><p className="text-xs text-muted-foreground">Faltando: {requiredMapped.missing.map(f => f.label).join(', ')}</p></div></>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
              <Button onClick={handleParsePreview} disabled={!requiredMapped.isComplete}>Preview <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && importHook.result && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Card className="flex-1"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{importHook.result.totalCount}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
              <Card className="flex-1 border-green-500/30"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-500">{importHook.result.validCount}</p><p className="text-xs text-muted-foreground">Válidos</p></CardContent></Card>
              <Card className="flex-1 border-red-500/30"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-500">{importHook.result.invalidCount}</p><p className="text-xs text-muted-foreground">Inválidos</p></CardContent></Card>
            </div>

            <div className="border rounded-lg overflow-hidden max-h-[40vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Criticidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importHook.result.vendors.map((v, i) => (
                    <TableRow key={i} className={cn(!v.isValid && "bg-red-500/5")}>
                      <TableCell className="text-muted-foreground text-xs">{v.rowNumber}</TableCell>
                      <TableCell className="font-mono text-sm">{v.code}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{v.name}</TableCell>
                      <TableCell>{v.category || '-'}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{v.criticality}</Badge></TableCell>
                      <TableCell>{v.status}</TableCell>
                      <TableCell className="text-center">
                        {v.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 inline-block" />
                        ) : (
                          <div className="flex items-center gap-1 justify-center">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-xs text-red-500 max-w-[150px] truncate">{v.errors[0]}</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('mapping')}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
              <Button
                onClick={handleImport}
                disabled={importHook.result.validCount === 0 || bulkCreate.isPending}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {bulkCreate.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importando...</> : <><Check className="mr-2 h-4 w-4" />Importar {importHook.result.validCount} fornecedor(es)</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
