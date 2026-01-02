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
import { useEvidences } from '@/hooks/useEvidences';
import { Paperclip, Plus, FileText, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ControlEvidencesListProps {
  assessmentId: string | undefined;
  controlCode: string;
}

export function ControlEvidencesList({
  assessmentId,
  controlCode,
}: ControlEvidencesListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: allEvidences = [] } = useEvidences();

  // For now, filter evidences by tags containing control code
  // In a real implementation, you'd have assessment_evidences junction table
  const linkedEvidences = allEvidences.filter(
    (e) => e.tags?.includes(controlCode) || e.description?.includes(controlCode)
  );

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
            <ScrollArea className="max-h-80">
              {allEvidences.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma evidência disponível. Faça upload na seção de Evidências.
                </p>
              ) : (
                <div className="space-y-2">
                  {allEvidences.map((evidence) => (
                    <div
                      key={evidence.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{evidence.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {evidence.file_type}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // In a real implementation, link evidence to assessment
                          setDialogOpen(false);
                        }}
                      >
                        Vincular
                      </Button>
                    </div>
                  ))}
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
              className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{evidence.name}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
