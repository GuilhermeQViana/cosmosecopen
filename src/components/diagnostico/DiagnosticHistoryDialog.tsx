import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, RotateCcw, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDiagnosticSnapshots, useDeleteSnapshot } from '@/hooks/useDiagnosticSnapshots';
import { toast } from 'sonner';

interface DiagnosticHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (snapshotData: unknown[]) => void;
}

export function DiagnosticHistoryDialog({
  open,
  onOpenChange,
  onRestore,
}: DiagnosticHistoryDialogProps) {
  const { data: snapshots, isLoading } = useDiagnosticSnapshots();
  const deleteSnapshot = useDeleteSnapshot();

  const handleRestore = (snapshot: { name: string; snapshot_data: unknown }) => {
    const data = snapshot.snapshot_data as unknown[];
    onRestore(data);
    onOpenChange(false);
    toast.success(`Versão "${snapshot.name}" restaurada`);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteSnapshot.mutateAsync(id);
      toast.success(`Versão "${name}" excluída`);
    } catch {
      toast.error('Erro ao excluir versão');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Versões
          </DialogTitle>
          <DialogDescription>
            Restaure uma versão anterior do diagnóstico ou exclua versões salvas.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : !snapshots?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma versão salva ainda.
              <br />
              Use "Salvar Versão" para criar um backup.
            </div>
          ) : (
            <div className="space-y-2">
              {snapshots.map((snapshot) => {
                const assessmentCount = Array.isArray(snapshot.snapshot_data)
                  ? snapshot.snapshot_data.length
                  : 0;

                return (
                  <div
                    key={snapshot.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{snapshot.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(snapshot.created_at), "dd MMM yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                        {' · '}
                        {assessmentCount} avaliações
                      </p>
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRestore(snapshot)}
                        title="Restaurar versão"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(snapshot.id, snapshot.name)}
                        disabled={deleteSnapshot.isPending}
                        className="text-destructive hover:text-destructive"
                        title="Excluir versão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
