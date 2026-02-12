import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, ArrowLeft, Sparkles, Download, Send, Check, MoreVertical } from 'lucide-react';
import { usePolicy, usePolicies } from '@/hooks/usePolicies';
import { PolicyEditorToolbar } from '@/components/politicas/PolicyEditorToolbar';
import { PolicyMetadataPanel } from '@/components/politicas/PolicyMetadataPanel';
import { PolicyVersionHistory } from '@/components/politicas/PolicyVersionHistory';
import { PolicyComments } from '@/components/politicas/PolicyComments';
import { PolicyLinkages } from '@/components/politicas/PolicyLinkages';
import { AIWriterDialog } from '@/components/politicas/AIWriterDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { Policy } from '@/hooks/usePolicies';

const statusLabels: Record<string, { label: string; className: string }> = {
  rascunho: { label: 'Rascunho', className: 'bg-muted text-muted-foreground' },
  em_revisao: { label: 'Em Revisão', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  aprovada: { label: 'Aprovada', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  publicada: { label: 'Publicada', className: 'bg-primary/20 text-primary border-primary/30' },
  expirada: { label: 'Expirada', className: 'bg-destructive/20 text-destructive border-destructive/30' },
  arquivada: { label: 'Arquivada', className: 'bg-muted text-muted-foreground' },
};

export default function PoliticaEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = id === 'nova';
  const { data: existingPolicy, isLoading } = usePolicy(isNew ? undefined : id);
  const { createPolicy, updatePolicy } = usePolicies();

  const [showAIWriter, setShowAIWriter] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    onUpdate: () => {
      setIsSaved(false);
    },
  });

  // Load existing policy or template content
  useEffect(() => {
    if (existingPolicy && editor) {
      setMetadata(existingPolicy);
      editor.commands.setContent(existingPolicy.content || '');
      setIsSaved(true);
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

  // Mark unsaved on metadata change
  const handleMetadataChange = useCallback((updates: Partial<Policy>) => {
    setMetadata(prev => ({ ...prev, ...updates }));
    setIsSaved(false);
  }, []);

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
      setIsSaved(true);
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
      setIsSaved(true);
      toast.success('Política salva');
    }
  }, [metadata, editor, isNew, id, createPolicy, updatePolicy, navigate]);

  // Auto-save every 30s for existing policies
  useEffect(() => {
    if (isNew || isSaved) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (!isNew && id && metadata.title?.trim()) {
        handleSave();
      }
    }, 30000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [isSaved, isNew, id, metadata, handleSave]);

  // Ctrl+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const handleSubmitForReview = useCallback(async () => {
    if (!id || isNew) return;
    await updatePolicy.mutateAsync({ id, status: 'em_revisao' });
    setMetadata(prev => ({ ...prev, status: 'em_revisao' }));
    toast.success('Política enviada para revisão');
  }, [id, isNew, updatePolicy]);

  const handleExportPDF = useCallback(async () => {
    if (!id || isNew) return;
    setExportingPDF(true);
    try {
      const response = await supabase.functions.invoke('export-policy-pdf', {
        body: { policyId: id },
      });
      if (response.error) throw response.error;
      const html = response.data;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      if (w) w.onload = () => w.print();
      toast.success('Documento aberto para impressão/PDF');
    } catch (error) {
      toast.error('Erro ao exportar política');
    } finally {
      setExportingPDF(false);
    }
  }, [id, isNew]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const isSaving = createPolicy.isPending || updatePolicy.isPending;
  const statusInfo = statusLabels[metadata.status || 'rascunho'];

  return (
    <div className="space-y-4 relative z-20 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate('/policies/central')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className={statusInfo.className}>
              {statusInfo.label}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {isSaving ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</>
              ) : isSaved ? (
                <><Check className="w-3 h-3 text-emerald-500" /> Salvo</>
              ) : (
                '● Não salvo'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAIWriter(true)} className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> IA
          </Button>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Salvar
          </Button>
          {!isNew && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {metadata.status === 'rascunho' && (
                  <DropdownMenuItem onClick={handleSubmitForReview}>
                    <Send className="w-4 h-4 mr-2" /> Enviar para Revisão
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleExportPDF} disabled={exportingPDF}>
                  <Download className="w-4 h-4 mr-2" /> Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Editor */}
        <div className="lg:col-span-3 space-y-0">
          {/* Inline title */}
          <Card className="rounded-b-none border-b-0 p-4 pointer-events-auto">
            <input
              type="text"
              value={metadata.title || ''}
              onChange={(e) => handleMetadataChange({ title: e.target.value })}
              placeholder="Título da política..."
              className="w-full bg-transparent border-none outline-none text-xl font-semibold text-foreground placeholder:text-muted-foreground/50"
            />
          </Card>
          <Card className="overflow-hidden rounded-t-none pointer-events-auto">
            <PolicyEditorToolbar editor={editor} />
            <EditorContent editor={editor} />
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Tabs defaultValue="metadata">
            <TabsList className="w-full">
              <TabsTrigger value="metadata" className="flex-1">Metadados</TabsTrigger>
              {!isNew && <TabsTrigger value="linkages" className="flex-1">Vínculos</TabsTrigger>}
              {!isNew && <TabsTrigger value="history" className="flex-1">Versões</TabsTrigger>}
              {!isNew && <TabsTrigger value="comments" className="flex-1">Coment.</TabsTrigger>}
            </TabsList>
            <TabsContent value="metadata">
              <Card className="p-4 pointer-events-auto">
                <PolicyMetadataPanel
                  policy={metadata}
                  onChange={handleMetadataChange}
                />
              </Card>
            </TabsContent>
            {!isNew && id && (
              <TabsContent value="linkages">
                <PolicyLinkages policyId={id} />
              </TabsContent>
            )}
            {!isNew && id && (
              <TabsContent value="history">
                <PolicyVersionHistory
                  policyId={id}
                  onRestoreVersion={(content) => editor?.commands.setContent(content)}
                />
              </TabsContent>
            )}
            {!isNew && id && (
              <TabsContent value="comments">
                <PolicyComments policyId={id} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <AIWriterDialog
        open={showAIWriter}
        onOpenChange={setShowAIWriter}
        onGenerated={(content) => editor?.commands.setContent(content)}
        currentTitle={metadata.title || undefined}
        currentContent={editor?.getHTML()}
      />
    </div>
  );
}
