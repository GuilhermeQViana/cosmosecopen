import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEvidences, useUpdateEvidence, useDownloadEvidence, Evidence } from '@/hooks/useEvidences';
import { UploadEvidenceDialog } from '@/components/evidencias/UploadEvidenceDialog';
import { EvidencePreviewDialog } from '@/components/evidencias/EvidencePreviewDialog';
import { Paperclip, Plus, FileText, Upload, X, Loader2, Download, ChevronRight, FolderOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ControlEvidencesListProps {
  assessmentId: string | undefined;
  controlCode: string;
}

export function ControlEvidencesList({
  assessmentId,
  controlCode,
}: ControlEvidencesListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null);
  const [evidenceToUnlink, setEvidenceToUnlink] = useState<Evidence | null>(null);
  
  const { data: allEvidences = [] } = useEvidences();
  const updateEvidence = useUpdateEvidence();
  const { mutate: downloadEvidence, isPending: isDownloading } = useDownloadEvidence();
  const { toast } = useToast();

  // Filter evidences by tags containing control code
  const linkedEvidences = allEvidences.filter(
    (e) => e.tags?.includes(controlCode)
  );

  const handleUnlink = async () => {
    if (!evidenceToUnlink) return;
    
    const newTags = (evidenceToUnlink.tags || []).filter(t => t !== controlCode);
    
    try {
      await updateEvidence.mutateAsync({
        id: evidenceToUnlink.id,
        tags: newTags.length > 0 ? newTags : null,
      });
      toast({ title: 'Evidência desvinculada com sucesso' });
    } catch {
      toast({ 
        title: 'Erro ao desvincular', 
        variant: 'destructive' 
      });
    } finally {
      setEvidenceToUnlink(null);
    }
  };

  const handleLink = async (evidence: Evidence) => {
    const currentTags = evidence.tags || [];
    if (currentTags.includes(controlCode)) {
      setDialogOpen(false);
      return;
    }
    
    try {
      await updateEvidence.mutateAsync({
        id: evidence.id,
        tags: [...currentTags, controlCode],
      });
      toast({ title: 'Evidência vinculada com sucesso' });
      setDialogOpen(false);
    } catch {
      toast({ 
        title: 'Erro ao vincular', 
        variant: 'destructive' 
      });
    }
  };

  const handlePreviewEvidence = (evidence: Evidence) => {
    setPreviewEvidence(evidence);
  };

  const handleDownloadEvidence = (evidence: Evidence) => {
    downloadEvidence(evidence);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-primary" />
          Evidências
          {linkedEvidences.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {linkedEvidences.length}
            </Badge>
          )}
        </h4>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="h-7 gap-1">
              <Plus className="w-3 h-3" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vincular Evidência</DialogTitle>
            </DialogHeader>
            
            {/* Botão para nova evidência */}
            <div className="flex items-center justify-between pb-2 border-b">
              <p className="text-sm text-muted-foreground">
                Selecione uma existente ou crie nova
              </p>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="w-4 h-4 mr-1" />
                Nova Evidência
              </Button>
            </div>

            <ScrollArea className="max-h-80">
              {allEvidences.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma evidência disponível.
                </p>
              ) : (
                <div className="space-y-2">
                  {allEvidences.map((evidence) => {
                    const isLinked = evidence.tags?.includes(controlCode);
                    return (
                      <div
                        key={evidence.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{evidence.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {evidence.file_type}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={isLinked ? "secondary" : "ghost"}
                          size="sm"
                          disabled={isLinked || updateEvidence.isPending}
                          onClick={() => handleLink(evidence)}
                        >
                          {updateEvidence.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isLinked ? (
                            'Vinculada'
                          ) : (
                            'Vincular'
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {linkedEvidences.length === 0 && (
        <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
          <FolderOpen className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mb-3">
            Nenhuma evidência anexada
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="w-3 h-3" />
                Adicionar Evidência
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}

      {/* Evidence Cards */}
      {linkedEvidences.length > 0 && (
        <ScrollArea className="max-h-[280px]">
          <div className="space-y-2 pr-2">
            {linkedEvidences.map((evidence) => (
              <div
                key={evidence.id}
                onClick={() => handlePreviewEvidence(evidence)}
                className={cn(
                  'p-3 rounded-lg border bg-card cursor-pointer transition-all duration-150',
                  'hover:bg-accent/50 hover:border-primary/50 hover:shadow-sm',
                  'active:scale-[0.99]'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* File type icon */}
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{evidence.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {evidence.file_type || 'Arquivo'} 
                        {evidence.file_size && ` • ${(evidence.file_size / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Download Button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadEvidence(evidence);
                          }}
                          disabled={isDownloading}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Baixar</TooltipContent>
                    </Tooltip>

                    {/* Unlink Button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEvidenceToUnlink(evidence);
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Desvincular</TooltipContent>
                    </Tooltip>

                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Diálogo de upload de nova evidência */}
      <UploadEvidenceDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        defaultTags={[controlCode]}
        onSuccess={() => {
          setUploadDialogOpen(false);
          setDialogOpen(false);
        }}
      />

      {/* Preview inline de evidência */}
      <EvidencePreviewDialog
        evidence={previewEvidence}
        open={!!previewEvidence}
        onOpenChange={(open) => !open && setPreviewEvidence(null)}
        onDownload={handleDownloadEvidence}
      />

      {/* Confirmação de desvincular */}
      <AlertDialog open={!!evidenceToUnlink} onOpenChange={(open) => !open && setEvidenceToUnlink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular evidência?</AlertDialogTitle>
            <AlertDialogDescription>
              A evidência "{evidenceToUnlink?.name}" será desvinculada deste controle. 
              O arquivo não será excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnlink}
              disabled={updateEvidence.isPending}
            >
              {updateEvidence.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
