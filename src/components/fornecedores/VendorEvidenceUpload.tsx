import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useVendorRequirements, VendorRequirement } from '@/hooks/useVendorRequirements';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  X,
  Loader2,
  Trash2,
  Download,
  Eye,
  Paperclip,
} from 'lucide-react';

interface VendorEvidence {
  id: string;
  assessment_id: string;
  requirement_id: string | null;
  organization_id: string;
  name: string;
  description: string | null;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
  requirement?: VendorRequirement;
}

interface VendorEvidenceUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string | null;
  vendorName: string;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  'application/pdf': <FileText className="h-5 w-5 text-red-500" />,
  'image/': <Image className="h-5 w-5 text-blue-500" />,
  'application/vnd.ms-excel': <FileSpreadsheet className="h-5 w-5 text-green-500" />,
  'application/vnd.openxmlformats': <FileSpreadsheet className="h-5 w-5 text-green-500" />,
  default: <File className="h-5 w-5 text-muted-foreground" />,
};

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FILE_ICONS.default;
  for (const [key, icon] of Object.entries(FILE_ICONS)) {
    if (mimeType.startsWith(key)) return icon;
  }
  return FILE_ICONS.default;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VendorEvidenceUpload({
  open,
  onOpenChange,
  assessmentId,
  vendorName,
}: VendorEvidenceUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requirementId, setRequirementId] = useState<string>('');
  const [deleteEvidence, setDeleteEvidence] = useState<VendorEvidence | null>(null);

  const { toast } = useToast();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const { data: requirements } = useVendorRequirements();

  // Fetch evidences for this assessment
  const { data: evidences, isLoading: evidencesLoading } = useQuery({
    queryKey: ['vendor-evidences', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return [];

      const { data, error } = await supabase
        .from('vendor_evidences')
        .select(`
          *,
          requirement:vendor_requirements(id, code, name)
        `)
        .eq('assessment_id', assessmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as VendorEvidence[];
    },
    enabled: !!assessmentId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (evidence: VendorEvidence) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('vendor-evidences')
        .remove([evidence.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('vendor_evidences')
        .delete()
        .eq('id', evidence.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-evidences', assessmentId] });
      toast({ title: 'Evidência excluída' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível excluir a evidência', variant: 'destructive' });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [name]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
  });

  const handleUpload = async () => {
    if (!selectedFile || !assessmentId || !organization?.id) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${organization.id}/${assessmentId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('vendor-evidences')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Get user
      const { data: userData } = await supabase.auth.getUser();

      // Create database record
      const { error: dbError } = await supabase.from('vendor_evidences').insert({
        assessment_id: assessmentId,
        organization_id: organization.id,
        requirement_id: requirementId || null,
        name: name || selectedFile.name,
        description: description || null,
        file_path: filePath,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        uploaded_by: userData.user?.id || null,
      });

      if (dbError) throw dbError;

      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ['vendor-evidences', assessmentId] });
      toast({ title: 'Evidência enviada com sucesso' });

      // Reset form
      setSelectedFile(null);
      setName('');
      setDescription('');
      setRequirementId('');
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Erro', description: 'Não foi possível enviar a evidência', variant: 'destructive' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (evidence: VendorEvidence) => {
    try {
      const { data, error } = await supabase.storage
        .from('vendor-evidences')
        .download(evidence.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = evidence.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível baixar o arquivo', variant: 'destructive' });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl border-border/50 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-space flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-primary" />
              Evidências da Avaliação
            </DialogTitle>
            <DialogDescription>
              {vendorName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2 py-4">
            {/* Upload Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Enviar Nova Evidência</h4>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    {getFileIcon(selectedFile.type)}
                    <span className="text-sm">{selectedFile.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Arraste um arquivo ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, imagens, documentos (máx. 10MB)
                    </p>
                  </>
                )}
              </div>

              {selectedFile && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Nome do Arquivo</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Requisito Relacionado (opcional)</Label>
                    <Select value={requirementId} onValueChange={setRequirementId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecionar requisito..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {requirements?.map((req) => (
                          <SelectItem key={req.id} value={req.id}>
                            {req.code} - {req.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Descrição (opcional)</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 resize-none"
                      rows={2}
                    />
                  </div>

                  {uploading && (
                    <Progress value={uploadProgress} className="h-2" />
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                    className="w-full"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Enviar Evidência
                  </Button>
                </div>
              )}
            </div>

            {/* Evidence List */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">
                Evidências Enviadas ({evidences?.length || 0})
              </h4>

              <ScrollArea className="h-[350px]">
                {evidencesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : evidences && evidences.length > 0 ? (
                  <div className="space-y-2 pr-4">
                    {evidences.map((evidence) => (
                      <div
                        key={evidence.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        {getFileIcon(evidence.file_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{evidence.name}</p>
                          {evidence.requirement && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {evidence.requirement.code}
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(evidence.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            {' • '}
                            {formatFileSize(evidence.file_size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleDownload(evidence)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteEvidence(evidence)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma evidência enviada</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteEvidence} onOpenChange={(open) => !open && setDeleteEvidence(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Evidência</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteEvidence?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteEvidence) {
                  deleteMutation.mutate(deleteEvidence);
                  setDeleteEvidence(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
