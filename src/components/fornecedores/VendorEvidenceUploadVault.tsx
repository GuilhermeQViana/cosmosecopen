import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useVendorEvidenceVault, VendorEvidenceCategory, VendorEvidenceClassification } from '@/hooks/useVendorEvidenceVault';
import { cn } from '@/lib/utils';

interface VendorEvidenceUploadVaultProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  vendorName: string;
}

const categories: { value: VendorEvidenceCategory; label: string }[] = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'certificacao', label: 'Certificação' },
  { value: 'ddq', label: 'DDQ (Due Diligence)' },
  { value: 'politica', label: 'Política' },
  { value: 'sla', label: 'SLA' },
  { value: 'auditoria', label: 'Auditoria' },
  { value: 'outro', label: 'Outro' },
];

const classifications: { value: VendorEvidenceClassification; label: string; description: string }[] = [
  { value: 'publico', label: 'Público', description: 'Documentos públicos' },
  { value: 'interno', label: 'Interno', description: 'Uso interno' },
  { value: 'confidencial', label: 'Confidencial', description: 'Acesso restrito' },
];

export function VendorEvidenceUploadVault({
  open,
  onOpenChange,
  vendorId,
  vendorName,
}: VendorEvidenceUploadVaultProps) {
  const { createEvidence, uploadFile } = useVendorEvidenceVault();
  
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VendorEvidenceCategory>('outro');
  const [classification, setClassification] = useState<VendorEvidenceClassification>('interno');
  const [expiresAt, setExpiresAt] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [name]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagsInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagsInput.trim())) {
        setTags([...tags, tagsInput.trim()]);
      }
      setTagsInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!file || !name.trim()) return;

    setIsUploading(true);
    try {
      const filePath = await uploadFile(file, vendorId);
      
      await createEvidence.mutateAsync({
        vendor_id: vendorId,
        name: name.trim(),
        description: description.trim() || undefined,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        category,
        classification,
        expires_at: expiresAt || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading evidence:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setName('');
    setDescription('');
    setCategory('outro');
    setClassification('interno');
    setExpiresAt('');
    setTags([]);
    setTagsInput('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Evidência</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adicionar evidência para: <strong>{vendorName}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50',
              file && 'border-green-500 bg-green-500/5'
            )}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-green-500" />
                <div className="text-left">
                  <p className="font-medium truncate max-w-[300px]">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arraste um arquivo ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo: 50MB
                </p>
              </>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da evidência"
            />
          </div>

          {/* Category & Classification */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as VendorEvidenceCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Classificação *</Label>
              <Select value={classification} onValueChange={(v) => setClassification(v as VendorEvidenceClassification)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classifications.map((cls) => (
                    <SelectItem key={cls.value} value={cls.value}>
                      {cls.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional"
              rows={2}
            />
          </div>

          {/* Expiration date */}
          <div className="space-y-2">
            <Label htmlFor="expires_at">Data de Expiração</Label>
            <Input
              id="expires_at"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Digite e pressione Enter"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || !name.trim() || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Adicionar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
