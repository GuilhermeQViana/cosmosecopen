import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ApprovalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'aprovada' | 'rejeitada';
  policyTitle: string;
  onConfirm: (comments: string) => Promise<void>;
}

export function ApprovalActionDialog({ open, onOpenChange, action, policyTitle, onConfirm }: ApprovalActionDialogProps) {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const isReject = action === 'rejeitada';
  const canSubmit = isReject ? comments.trim().length > 0 : true;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(comments);
      setComments('');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isReject ? (
              <XCircle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            )}
            {isReject ? 'Rejeitar Aprovação' : 'Aprovar Política'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isReject
              ? `Você está rejeitando a política "${policyTitle}". Informe o motivo da rejeição.`
              : `Você está aprovando a política "${policyTitle}".`}
          </p>
          <div>
            <Label>{isReject ? 'Motivo da rejeição *' : 'Comentários (opcional)'}</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={isReject ? 'Descreva o motivo da rejeição...' : 'Adicione um comentário...'}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirm}
            disabled={!canSubmit || loading}
            className={isReject ? 'bg-destructive hover:bg-destructive/90' : 'bg-emerald-600 hover:bg-emerald-700'}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {isReject ? 'Rejeitar' : 'Aprovar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
