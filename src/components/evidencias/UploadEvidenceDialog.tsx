import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadEvidence, CLASSIFICATION_OPTIONS } from '@/hooks/useEvidences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Upload, X, File, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type EvidenceClassification = Database['public']['Enums']['evidence_classification'];

interface UploadEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function UploadEvidenceDialog({ open, onOpenChange }: UploadEvidenceDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [classification, setClassification] = useState<EvidenceClassification>('interno');
  const [tags, setTags] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const { toast } = useToast();
  const uploadEvidence = useUploadEvidence();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O tamanho máximo é 20MB',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name);
      }
    }
  }, [name, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploadProgress(30);
      await uploadEvidence.mutateAsync({
        file,
        metadata: {
          name,
          description: description || undefined,
          classification,
          tags: tags ? tags.split(',').map((t) => t.trim()) : undefined,
          expires_at: expiresAt || null,
        },
      });
      setUploadProgress(100);
      toast({ title: 'Evidência enviada com sucesso' });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar a evidência',
        variant: 'destructive',
      });
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setName('');
    setDescription('');
    setClassification('interno');
    setTags('');
    setExpiresAt('');
    setUploadProgress(0);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar Evidência</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drop zone */}
          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo ou clique para selecionar'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, Word, Excel, imagens até 20MB
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-4 flex items-center gap-3">
              <File className="h-8 w-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Progress value={uploadProgress} />
          )}

          {/* Metadata */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do documento"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Classificação *</Label>
              <Select
                value={classification}
                onValueChange={(v) => setClassification(v as EvidenceClassification)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSIFICATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', opt.color)} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">Validade</Label>
              <Input
                id="expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="política, segurança, backup"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!file || uploadEvidence.isPending}>
              {uploadEvidence.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
