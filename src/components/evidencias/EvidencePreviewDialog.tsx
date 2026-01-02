import { useState, useEffect } from 'react';
import { Evidence, formatFileSize, getFileIcon } from '@/hooks/useEvidences';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ExternalLink, FileQuestion, Loader2 } from 'lucide-react';

interface EvidencePreviewDialogProps {
  evidence: Evidence | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (evidence: Evidence) => void;
}

export function EvidencePreviewDialog({
  evidence,
  open,
  onOpenChange,
  onDownload,
}: EvidencePreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!evidence || !open) {
      setPreviewUrl(null);
      setTextContent(null);
      setError(null);
      return;
    }

    const loadPreview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: urlError } = await supabase.storage
          .from('evidences')
          .createSignedUrl(evidence.file_path, 3600); // 1 hour

        if (urlError) throw urlError;
        setPreviewUrl(data.signedUrl);

        // For text files, fetch content
        if (isTextFile(evidence.file_type)) {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('evidences')
            .download(evidence.file_path);

          if (!downloadError && fileData) {
            const text = await fileData.text();
            setTextContent(text);
          }
        }
      } catch (err) {
        console.error('Error loading preview:', err);
        setError('Não foi possível carregar a prévia');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [evidence, open]);

  const isImageFile = (fileType: string | null) => {
    return fileType?.startsWith('image/');
  };

  const isPdfFile = (fileType: string | null) => {
    return fileType === 'application/pdf';
  };

  const isTextFile = (fileType: string | null) => {
    if (!fileType) return false;
    return (
      fileType.startsWith('text/') ||
      fileType === 'application/json' ||
      fileType === 'application/xml' ||
      fileType.includes('javascript') ||
      fileType.includes('typescript')
    );
  };

  const isVideoFile = (fileType: string | null) => {
    return fileType?.startsWith('video/');
  };

  const isAudioFile = (fileType: string | null) => {
    return fileType?.startsWith('audio/');
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando prévia...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <FileQuestion className="h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (!previewUrl || !evidence) {
      return null;
    }

    if (isImageFile(evidence.file_type)) {
      return (
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg min-h-96">
          <img
            src={previewUrl}
            alt={evidence.name}
            className="max-h-[60vh] max-w-full object-contain rounded"
          />
        </div>
      );
    }

    if (isPdfFile(evidence.file_type)) {
      return (
        <div className="h-[60vh] rounded-lg overflow-hidden border">
          <iframe
            src={`${previewUrl}#toolbar=0`}
            className="w-full h-full"
            title={evidence.name}
          />
        </div>
      );
    }

    if (isTextFile(evidence.file_type) && textContent) {
      return (
        <ScrollArea className="h-[60vh] rounded-lg border bg-muted/30">
          <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
            {textContent}
          </pre>
        </ScrollArea>
      );
    }

    if (isVideoFile(evidence.file_type)) {
      return (
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
          <video
            src={previewUrl}
            controls
            className="max-h-[60vh] max-w-full rounded"
          >
            Seu navegador não suporta vídeo.
          </video>
        </div>
      );
    }

    if (isAudioFile(evidence.file_type)) {
      return (
        <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
          <audio src={previewUrl} controls className="w-full max-w-md">
            Seu navegador não suporta áudio.
          </audio>
        </div>
      );
    }

    // Fallback for unsupported types
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 bg-muted/30 rounded-lg">
        <div className="text-6xl">{getFileIcon(evidence.file_type)}</div>
        <p className="text-muted-foreground text-center">
          Prévia não disponível para este tipo de arquivo
        </p>
        <Button variant="outline" onClick={() => window.open(previewUrl, '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir em nova aba
        </Button>
      </div>
    );
  };

  if (!evidence) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getFileIcon(evidence.file_type)}</span>
            <span className="truncate">{evidence.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{evidence.file_type || 'Desconhecido'}</Badge>
          <span>•</span>
          <span>{formatFileSize(evidence.file_size)}</span>
          {evidence.tags && evidence.tags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex gap-1">
                {evidence.tags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {evidence.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{evidence.tags.length - 3}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {renderPreview()}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => onDownload(evidence)}>
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
