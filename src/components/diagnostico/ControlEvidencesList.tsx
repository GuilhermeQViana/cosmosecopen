import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useEvidences, useUpdateEvidence, useDownloadEvidence, Evidence } from '@/hooks/useEvidences';
import { UploadEvidenceDialog } from '@/components/evidencias/UploadEvidenceDialog';
import { EvidencePreviewDialog } from '@/components/evidencias/EvidencePreviewDialog';
import { Paperclip, Plus, FileText, Eye, Upload, X, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

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
  const [unlinkEvidence, setUnlinkEvidence] = useState<Evidence | null>(null);
  
  const { data: allEvidences = [] } = useEvidences();
  const updateEvidence = useUpdateEvidence();
  const downloadEvidence = useDownloadEvidence();
  const { toast } = useToast();

  // Filter evidences by tags containing control code
  const linkedEvidences = allEvidences.filter(
    (e) => e.tags?.includes(controlCode)
  );

  const handleUnlink = async () => {
    if (!unlinkEvidence) return;
    
    const newTags = (unlinkEvidence.tags || []).filter(t => t !== controlCode);
    
    try {
      await updateEvidence.mutateAsync({
        id: unlinkEvidence.id,
        tags: newTags.length > 0 ? newTags : null,
      });
      toast({ title: 'Evidência desvinculada com sucesso' });
    } catch {
      toast({ 
        title: 'Erro ao desvincular', 
        variant: 'destructive' 
      });
    } finally {
      setUnlinkEvidence(null);
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

  const handleDownload = (evidence: Evidence) => {
    downloadEvidence.mutate(evidence);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Paperclip className="w-4 h-4" />
          Evidências ({linkedEvidences.length})
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
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

      {linkedEvidences.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Nenhuma evidência anexada
        </p>
      ) : (
        <div className="space-y-1">
          {linkedEvidences.map((evidence) => (
            <div
              key={evidence.id}
              className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm group"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{evidence.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setPreviewEvidence(evidence)}
                  title="Visualizar"
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setUnlinkEvidence(evidence)}
                  title="Desvincular"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
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
        onDownload={handleDownload}
      />

      {/* Confirmação de desvincular */}
      <AlertDialog open={!!unlinkEvidence} onOpenChange={(open) => !open && setUnlinkEvidence(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular evidência?</AlertDialogTitle>
            <AlertDialogDescription>
              A evidência "{unlinkEvidence?.name}" será desvinculada deste controle. 
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
