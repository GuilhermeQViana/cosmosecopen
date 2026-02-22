import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { History, Clock, Eye, Loader2 } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePolicyVersions, type PolicyVersion } from '@/hooks/usePolicyVersions';

interface Props {
  policyId: string;
  onRestoreVersion?: (content: string) => void;
}

export function PolicyVersionHistory({ policyId, onRestoreVersion }: Props) {
  const { data: versions, isLoading } = usePolicyVersions(policyId);
  const [previewVersion, setPreviewVersion] = useState<PolicyVersion | null>(null);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-emerald-500" />
          <h3 className="font-semibold">Histórico de Versões</h3>
        </div>
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-emerald-500" />
          <h3 className="font-semibold">Histórico de Versões</h3>
        </div>
        {!versions || versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma versão anterior registrada.</p>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {versions.map((v) => (
                <div key={v.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/50 hover:border-emerald-500/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs shrink-0">v{v.version_number}</Badge>
                      <span className="text-sm truncate">{v.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(v.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                    {v.change_summary && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{v.change_summary}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                    onClick={() => setPreviewVersion(v)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* Version Preview Dialog */}
      <Dialog open={!!previewVersion} onOpenChange={() => setPreviewVersion(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" />
              Versão {previewVersion?.version_number} — {previewVersion?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="prose prose-invert max-w-none p-4"
              dangerouslySetInnerHTML={{ __html: previewVersion?.content || '' }} />
          </ScrollArea>
          {onRestoreVersion && previewVersion && (
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => {
                onRestoreVersion(previewVersion.content);
                setPreviewVersion(null);
              }}>
                Restaurar esta versão
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
