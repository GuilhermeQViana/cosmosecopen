import { useEffect, useCallback, useState } from 'react';

interface UseDiagnosticKeyboardNavProps {
  controlIds: string[];
  onNavigate: (controlId: string) => void;
  onExpandToggle: (controlId: string) => void;
  onMaturityChange: (controlId: string, level: number) => void;
  onSave: (controlId: string) => void;
  onNextPending: () => void;
  onFocusSearch: () => void;
  enabled?: boolean;
}

export function useDiagnosticKeyboardNav({
  controlIds,
  onNavigate,
  onExpandToggle,
  onMaturityChange,
  onSave,
  onNextPending,
  onFocusSearch,
  enabled = true,
}: UseDiagnosticKeyboardNavProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedControlId, setFocusedControlId] = useState<string | null>(null);

  const focusControl = useCallback((index: number) => {
    if (index < 0 || index >= controlIds.length) return;
    
    const controlId = controlIds[index];
    setFocusedIndex(index);
    setFocusedControlId(controlId);
    onNavigate(controlId);
    
    // Scroll to element
    const element = document.getElementById(`control-${controlId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  }, [controlIds, onNavigate]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Ignore if typing in an input/textarea
    const target = event.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable;

    // Search shortcut works everywhere
    if (event.key === '/' && !isTyping) {
      event.preventDefault();
      onFocusSearch();
      return;
    }

    // Other shortcuts only work when not typing
    if (isTyping) return;

    switch (event.key) {
      case 'j':
      case 'ArrowDown':
        event.preventDefault();
        if (focusedIndex < controlIds.length - 1) {
          focusControl(focusedIndex + 1);
        } else if (focusedIndex === -1 && controlIds.length > 0) {
          focusControl(0);
        }
        break;

      case 'k':
      case 'ArrowUp':
        event.preventDefault();
        if (focusedIndex > 0) {
          focusControl(focusedIndex - 1);
        } else if (focusedIndex === -1 && controlIds.length > 0) {
          focusControl(0);
        }
        break;

      case 'Enter':
      case ' ' :
        if (focusedControlId) {
          event.preventDefault();
          onExpandToggle(focusedControlId);
        }
        break;

      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        if (focusedControlId) {
          event.preventDefault();
          onMaturityChange(focusedControlId, parseInt(event.key));
        }
        break;

      case 's':
        if (focusedControlId && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          onSave(focusedControlId);
        }
        break;

      case 'n':
        event.preventDefault();
        onNextPending();
        break;

      case 'Escape':
        setFocusedIndex(-1);
        setFocusedControlId(null);
        break;
    }
  }, [
    enabled,
    focusedIndex,
    focusedControlId,
    controlIds,
    focusControl,
    onExpandToggle,
    onMaturityChange,
    onSave,
    onNextPending,
    onFocusSearch,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset focused index when control list changes
  useEffect(() => {
    if (focusedControlId && !controlIds.includes(focusedControlId)) {
      setFocusedIndex(-1);
      setFocusedControlId(null);
    }
  }, [controlIds, focusedControlId]);

  return {
    focusedControlId,
    focusedIndex,
    setFocusedControlId,
    focusControl,
  };
}

// Keyboard shortcuts info for the help dialog
export const DIAGNOSTIC_SHORTCUTS = [
  { key: 'j / ↓', description: 'Próximo controle' },
  { key: 'k / ↑', description: 'Controle anterior' },
  { key: 'Enter / Space', description: 'Expandir/recolher controle' },
  { key: '0-5', description: 'Definir nível de maturidade' },
  { key: 'Ctrl+S', description: 'Salvar controle atual' },
  { key: 'n', description: 'Ir para próximo pendente' },
  { key: '/', description: 'Focar na busca' },
  { key: 'Esc', description: 'Limpar foco' },
];
