import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, Hash, Clock, Save } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  editor: { getText: () => string; getHTML: () => string } | null;
  version?: number;
  updatedAt?: string;
  isSaved: boolean;
  isSaving: boolean;
}

export function PolicyStatusBar({ editor, version, updatedAt, isSaved, isSaving }: Props) {
  const text = editor?.getText() || '';

  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [text]);

  const charCount = text.length;

  const lastEditLabel = useMemo(() => {
    if (!updatedAt) return null;
    try {
      return formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: ptBR });
    } catch {
      return null;
    }
  }, [updatedAt]);

  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-t border-border/50 bg-muted/30 text-xs text-muted-foreground select-none">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {wordCount} palavras
        </span>
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {charCount} caracteres
        </span>
      </div>
      <div className="flex items-center gap-4">
        {lastEditLabel && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastEditLabel}
          </span>
        )}
        {version !== undefined && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            v{version}
          </Badge>
        )}
        <span className="flex items-center gap-1">
          <Save className="w-3 h-3" />
          {isSaving ? 'Salvando...' : isSaved ? 'Salvo' : 'Não salvo'}
        </span>
      </div>
    </div>
  );
}
