import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { History, Download, Trash2, Shuffle, Save } from 'lucide-react';
import { DiagnosticHistoryDialog } from './DiagnosticHistoryDialog';
import { SaveVersionDialog } from './SaveVersionDialog';
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

interface DiagnosticActionBarProps {
  onSave: () => void;
  onReset: () => void;
  onGenerateRandom: () => void;
  onRestoreSnapshot: (snapshotData: unknown[]) => void;
  isSaving: boolean;
  hasChanges: boolean;
}

export function DiagnosticActionBar({
  onSave,
  onReset,
  onGenerateRandom,
  onRestoreSnapshot,
  isSaving,
  hasChanges,
}: DiagnosticActionBarProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saveVersionOpen, setSaveVersionOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [randomConfirmOpen, setRandomConfirmOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 p-4 bg-card border border-border rounded-lg">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setHistoryOpen(true)}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          Histórico
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSaveVersionOpen(true)}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Salvar Versão
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setResetConfirmOpen(true)}
          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          Resetar
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setRandomConfirmOpen(true)}
          className="gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Dados Aleatórios
        </Button>

        <div className="flex-1" />

        <Button
          size="sm"
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <DiagnosticHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onRestore={onRestoreSnapshot}
      />

      <SaveVersionDialog
        open={saveVersionOpen}
        onOpenChange={setSaveVersionOpen}
      />

      {/* Confirmação de Reset */}
      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar todas as avaliações?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá todas as avaliações do framework atual. Esta ação não pode ser desfeita.
              Considere salvar uma versão antes de continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onReset();
                setResetConfirmOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Resetar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de Dados Aleatórios */}
      <AlertDialog open={randomConfirmOpen} onOpenChange={setRandomConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Preencher com dados aleatórios?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso substituirá todas as avaliações atuais com valores de maturidade aleatórios (0-5).
              Útil para testes e demonstrações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onGenerateRandom();
                setRandomConfirmOpen(false);
              }}
            >
              Preencher
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
