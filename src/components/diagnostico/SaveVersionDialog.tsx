import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateSnapshot } from '@/hooks/useDiagnosticSnapshots';
import { toast } from 'sonner';

interface SaveVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveVersionDialog({ open, onOpenChange }: SaveVersionDialogProps) {
  const defaultName = `Backup ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`;
  const [name, setName] = useState(defaultName);
  const createSnapshot = useCreateSnapshot();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Informe um nome para a versão');
      return;
    }

    try {
      await createSnapshot.mutateAsync(name.trim());
      toast.success('Versão salva com sucesso');
      onOpenChange(false);
      setName(defaultName);
    } catch {
      toast.error('Erro ao salvar versão');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setName(`Backup ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Salvar Versão
          </DialogTitle>
          <DialogDescription>
            Crie um backup do estado atual do diagnóstico para restaurar depois.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="version-name">Nome da versão</Label>
            <Input
              id="version-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Antes da auditoria"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={createSnapshot.isPending}>
            {createSnapshot.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
