import { type Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold, Italic, Strikethrough, List, ListOrdered, Heading1, Heading2, Heading3,
  Quote, Undo, Redo, Link as LinkIcon, Table as TableIcon, Code,
} from 'lucide-react';

interface Props {
  editor: Editor | null;
}

export function PolicyEditorToolbar({ editor }: Props) {
  if (!editor) return null;

  const btn = (active: boolean) =>
    `h-8 w-8 ${active ? 'bg-emerald-500/20 text-emerald-400' : ''}`;

  return (
    <div className="flex items-center gap-0.5 flex-wrap border-b border-border/50 p-2 bg-muted/30">
      <Button variant="ghost" size="icon" className={btn(editor.isActive('bold'))}
        onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btn(editor.isActive('italic'))}
        onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btn(editor.isActive('strike'))}
        onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btn(editor.isActive('code'))}
        onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="w-4 h-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" className={btn(editor.isActive('heading', { level: 1 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btn(editor.isActive('heading', { level: 2 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btn(editor.isActive('heading', { level: 3 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="w-4 h-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" className={btn(editor.isActive('bulletList'))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btn(editor.isActive('orderedList'))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btn(editor.isActive('blockquote'))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="w-4 h-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" className={btn(editor.isActive('link'))}
        onClick={() => {
          const url = window.prompt('URL do link:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}>
        <LinkIcon className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btn(false)}
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <TableIcon className="w-4 h-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()}>
        <Undo className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()}>
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  );
}
