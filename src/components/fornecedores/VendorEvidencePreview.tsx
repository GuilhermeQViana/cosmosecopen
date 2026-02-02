import { useEffect, useState } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VendorEvidenceVault } from '@/hooks/useVendorEvidenceVault';
import { supabase } from '@/integrations/supabase/client';

interface VendorEvidencePreviewProps {
  evidence: VendorEvidenceVault | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
}

export function VendorEvidencePreview({
  evidence,
  open,
  onOpenChange,
  onDownload,
}: VendorEvidencePreviewProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (evidence && open) {
      setLoading(true);
      supabase.storage
        .from('vendor-evidences')
        .createSignedUrl(evidence.file_path, 3600)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error creating signed URL:', error);
            setSignedUrl(null);
          } else {
            setSignedUrl(data?.signedUrl || null);
          }
          setLoading(false);
        });
    } else {
      setSignedUrl(null);
    }
  }, [evidence, open]);

  if (!evidence) return null;

  const isImage = evidence.file_type?.startsWith('image/');
  const isPdf = evidence.file_type === 'application/pdf';
  const canPreview = isImage || isPdf;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="truncate">{evidence.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {signedUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !canPreview ? (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-medium">Preview não disponível</p>
              <p className="text-sm">Use o botão de download para visualizar este arquivo.</p>
            </div>
          ) : isImage && signedUrl ? (
            <div className="flex items-center justify-center p-4">
              <img
                src={signedUrl}
                alt={evidence.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          ) : isPdf && signedUrl ? (
            <iframe
              src={signedUrl}
              className="w-full h-[70vh] rounded-lg"
              title={evidence.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
              <p>Erro ao carregar preview</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
