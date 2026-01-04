import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navegação Global',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Abrir busca rápida' },
      { keys: ['?'], description: 'Mostrar atalhos de teclado' },
      { keys: ['G', 'D'], description: 'Ir para Dashboard' },
      { keys: ['G', 'C'], description: 'Ir para Diagnóstico de Controles' },
      { keys: ['G', 'R'], description: 'Ir para Riscos' },
      { keys: ['G', 'E'], description: 'Ir para Evidências' },
      { keys: ['G', 'A'], description: 'Ir para Plano de Ação' },
    ],
  },
  {
    title: 'Diagnóstico de Controles',
    shortcuts: [
      { keys: ['J', '↓'], description: 'Próximo controle' },
      { keys: ['K', '↑'], description: 'Controle anterior' },
      { keys: ['Enter'], description: 'Expandir/recolher controle' },
      { keys: ['0-5'], description: 'Definir nível de maturidade' },
      { keys: ['⌘', 'S'], description: 'Salvar controle atual' },
      { keys: ['N'], description: 'Ir para próximo pendente' },
      { keys: ['/'], description: 'Focar na busca' },
    ],
  },
  {
    title: 'Ações Rápidas',
    shortcuts: [
      { keys: ['Esc'], description: 'Fechar diálogo/limpar foco' },
    ],
  },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with ? key (Shift + /)
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {shortcutGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {groupIndex > 0 && <Separator className="mb-4" />}
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs px-2 py-0.5"
                          >
                            {key}
                          </Badge>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground mx-1">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          Pressione <Badge variant="outline" className="font-mono text-xs mx-1">?</Badge> 
          a qualquer momento para ver esta lista
        </p>
      </DialogContent>
    </Dialog>
  );
}
