import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Upload, Plus, Rocket } from 'lucide-react';
import { useFrameworkContext, FrameworkCode } from '@/contexts/FrameworkContext';

interface FrameworkSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frameworkId: string;
  frameworkCode: string;
  frameworkName: string;
  onManageControls: () => void;
}

export function FrameworkSuccessDialog({
  open,
  onOpenChange,
  frameworkId,
  frameworkCode,
  frameworkName,
  onManageControls,
}: FrameworkSuccessDialogProps) {
  const navigate = useNavigate();
  const { setFramework } = useFrameworkContext();

  const handleImportCSV = () => {
    onOpenChange(false);
    navigate(`/configuracoes?tab=frameworks&action=import&frameworkId=${frameworkId}`);
  };

  const handleAddManually = () => {
    onOpenChange(false);
    onManageControls();
  };

  const handleSelectAndUse = () => {
    setFramework(frameworkCode as FrameworkCode);
    onOpenChange(false);
    navigate('/dashboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <DialogTitle className="text-xl">Framework criado com sucesso!</DialogTitle>
          <DialogDescription className="text-base">
            O framework <strong>"{frameworkName}"</strong> foi criado. O que você gostaria de fazer agora?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="h-auto py-4 px-4 justify-start gap-4"
            onClick={handleImportCSV}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Importar Controles (CSV)</p>
              <p className="text-sm text-muted-foreground">
                Importe controles de um arquivo CSV
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 px-4 justify-start gap-4"
            onClick={handleAddManually}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Adicionar Manualmente</p>
              <p className="text-sm text-muted-foreground">
                Crie controles um a um
              </p>
            </div>
          </Button>

          <Button
            className="h-auto py-4 px-4 justify-start gap-4"
            onClick={handleSelectAndUse}
          >
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center shrink-0">
              <Rocket className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium">Selecionar e Usar</p>
              <p className="text-sm opacity-80">
                Ativar este framework e ir para o Dashboard
              </p>
            </div>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
