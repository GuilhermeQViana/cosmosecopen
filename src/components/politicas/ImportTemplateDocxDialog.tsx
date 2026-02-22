import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { convertDocxToHtml } from '@/lib/docx-utils';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/lib/sanitize';

interface ImportTemplateDocxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; description: string; category: string; content: string }) => Promise<void>;
}

const categories = ['Segurança', 'Privacidade', 'Acesso', 'Continuidade', 'Backup', 'Incidentes'];

export default function ImportTemplateDocxDialog({ open, onOpenChange, onSave }: ImportTemplateDocxDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [converting, setConverting] = useState(false);
  const [saving, setSaving] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setConverting(true);
    try {
      const html = await convertDocxToHtml(f);
      setPreviewHtml(html);
      if (!title) setTitle(f.name.replace(/\.docx$/i, ''));
    } catch {
      toast.error('Erro ao converter o arquivo DOCX');
    } finally {
      setConverting(false);
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
  });

  const handleSave = async () => {
    if (!title.trim() || !previewHtml) {
      toast.error('Preencha o título e envie um arquivo DOCX');
      return;
    }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), description: description.trim(), category, content: previewHtml });
      toast.success('Template importado com sucesso!');
      handleClose();
    } catch {
      toast.error('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setPreviewHtml('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Template DOCX</DialogTitle>
          <DialogDescription>Envie um arquivo .docx para criar um novo template personalizado</DialogDescription>
        </DialogHeader>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-border hover:border-emerald-500/50'
          }`}
        >
          <input {...getInputProps()} />
          {converting ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm text-muted-foreground">Convertendo arquivo...</p>
            </div>
          ) : file ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">(clique para trocar)</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Arraste um arquivo .docx ou clique para selecionar</p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="import-title">Título *</Label>
            <Input id="import-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do template" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="import-category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="import-category"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="import-desc">Descrição</Label>
            <Input id="import-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descrição do template" />
          </div>
        </div>

        {/* Preview */}
        {previewHtml && (
          <div className="space-y-1.5">
            <Label>Preview do conteúdo</Label>
            <ScrollArea className="h-48 border rounded-lg">
              <div className="prose prose-invert max-w-none p-3 text-sm" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </ScrollArea>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={saving || !previewHtml || !title.trim()}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            Salvar Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
