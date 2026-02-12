import { type Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Bold, Italic, Strikethrough, List, ListOrdered, Heading1, Heading2, Heading3,
  Quote, Undo, Redo, Link as LinkIcon, Table as TableIcon, Code, ImageIcon, Minus,
} from 'lucide-react';

interface Props {
  editor: Editor | null;
}

function ToolbarButton({ active, onClick, tooltip, children }: {
  active?: boolean; onClick: () => void; tooltip: string; children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${active ? 'bg-emerald-500/20 text-emerald-400' : ''}`}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function PolicyEditorToolbar({ editor }: Props) {
  if (!editor) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5 flex-wrap border-b border-border/50 p-2 bg-muted/30 sticky top-0 z-10">
        <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} tooltip="Negrito (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} tooltip="Itálico (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} tooltip="Tachado">
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} tooltip="Código inline">
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} tooltip="Título 1">
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} tooltip="Título 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} tooltip="Título 3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} tooltip="Lista com marcadores">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} tooltip="Lista numerada">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} tooltip="Citação">
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton active={editor.isActive('link')} onClick={() => {
          const url = window.prompt('URL do link:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} tooltip="Inserir link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton active={false} onClick={() => {
          const url = window.prompt('URL da imagem:');
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }} tooltip="Inserir imagem">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton active={false} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} tooltip="Inserir tabela">
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} tooltip="Linha horizontal">
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} tooltip="Desfazer (Ctrl+Z)">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} tooltip="Refazer (Ctrl+Y)">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>
    </TooltipProvider>
  );
}
