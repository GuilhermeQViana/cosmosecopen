import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Save, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { usePolicy, usePolicies } from '@/hooks/usePolicies';
import { PolicyEditorToolbar } from '@/components/politicas/PolicyEditorToolbar';
import { PolicyMetadataPanel } from '@/components/politicas/PolicyMetadataPanel';
import { toast } from 'sonner';
import type { Policy } from '@/hooks/usePolicies';

export default function PoliticaEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = id === 'nova';
  const { data: existingPolicy, isLoading } = usePolicy(isNew ? undefined : id);
  const { createPolicy, updatePolicy } = usePolicies();

  const [metadata, setMetadata] = useState<Partial<Policy>>({
    title: '',
    description: '',
    category: '',
    status: 'rascunho',
    next_review_at: null,
    expires_at: null,
    tags: null,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Comece a escrever sua política aqui...' }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none p-6 min-h-[500px] focus:outline-none',
      },
    },
  });

  // Load existing policy or template content
  useEffect(() => {
    if (existingPolicy && editor) {
      setMetadata(existingPolicy);
      editor.commands.setContent(existingPolicy.content || '');
    }
  }, [existingPolicy, editor]);

  // Load template content if creating from template
  useEffect(() => {
    const templateContent = searchParams.get('templateContent');
    const templateTitle = searchParams.get('templateTitle');
    const templateCategory = searchParams.get('templateCategory');
    if (isNew && templateContent && editor) {
      editor.commands.setContent(decodeURIComponent(templateContent));
      if (templateTitle) setMetadata(prev => ({ ...prev, title: decodeURIComponent(templateTitle) }));
      if (templateCategory) setMetadata(prev => ({ ...prev, category: decodeURIComponent(templateCategory) }));
    }
  }, [isNew, searchParams, editor]);

  const handleSave = useCallback(async () => {
    if (!metadata.title?.trim()) {
      toast.error('Informe o título da política');
      return;
    }
    const content = editor?.getHTML() || '';

    if (isNew) {
      const result = await createPolicy.mutateAsync({
        title: metadata.title,
        description: metadata.description,
        content,
        category: metadata.category || null,
        status: metadata.status || 'rascunho',
        next_review_at: metadata.next_review_at,
        expires_at: metadata.expires_at,
        tags: metadata.tags,
      });
      navigate(`/policies/central/${result.id}`, { replace: true });
    } else if (id) {
      await updatePolicy.mutateAsync({
        id,
        title: metadata.title,
        description: metadata.description,
        content,
        category: metadata.category || null,
        status: metadata.status,
        next_review_at: metadata.next_review_at,
        expires_at: metadata.expires_at,
        tags: metadata.tags,
      });
      toast.success('Política salva');
    }
  }, [metadata, editor, isNew, id, createPolicy, updatePolicy, navigate]);

  const handleSubmitForReview = useCallback(async () => {
    if (!id || isNew) return;
    await updatePolicy.mutateAsync({ id, status: 'em_revisao' });
    setMetadata(prev => ({ ...prev, status: 'em_revisao' }));
    toast.success('Política enviada para revisão');
  }, [id, isNew, updatePolicy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const isSaving = createPolicy.isPending || updatePolicy.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/policies/central')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          {metadata.status === 'rascunho' && !isNew && (
            <Button variant="outline" onClick={handleSubmitForReview} className="gap-2">
              <Send className="w-4 h-4" /> Enviar para Revisão
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Editor */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <PolicyEditorToolbar editor={editor} />
            <EditorContent editor={editor} />
          </Card>
        </div>

        {/* Metadata Panel */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 text-emerald-400">Metadados</h3>
            <PolicyMetadataPanel
              policy={metadata}
              onChange={(updates) => setMetadata(prev => ({ ...prev, ...updates }))}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
