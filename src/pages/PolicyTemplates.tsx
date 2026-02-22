import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookTemplate, Search, Eye, FileText, Loader2, Download, Upload } from 'lucide-react';
import { usePolicyTemplates, PolicyTemplate } from '@/hooks/usePolicyTemplates';
import { downloadTemplateAsDocx } from '@/lib/docx-utils';
import ImportTemplateDocxDialog from '@/components/politicas/ImportTemplateDocxDialog';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/lib/sanitize';

const categoryColors: Record<string, string> = {
  'Segurança': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Privacidade': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Acesso': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Continuidade': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Backup': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Incidentes': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const frameworkLabels: Record<string, string> = {
  iso_27001: 'ISO 27001',
  nist_csf: 'NIST CSF',
  bcb_cmn: 'BCB/CMN',
};

export default function PolicyTemplates() {
  const navigate = useNavigate();
  const { data: templates, isLoading, createTemplate } = usePolicyTemplates();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [previewTemplate, setPreviewTemplate] = useState<PolicyTemplate | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const categories = [...new Set(templates?.map(t => t.category).filter(Boolean))];

  const filtered = (templates || []).filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'todos' || t.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleUseTemplate = (template: PolicyTemplate) => {
    const params = new URLSearchParams();
    params.set('templateContent', encodeURIComponent(template.content));
    params.set('templateTitle', encodeURIComponent(template.title));
    if (template.category) params.set('templateCategory', encodeURIComponent(template.category));
    navigate(`/policies/central/nova?${params.toString()}`);
  };

  const handleDownload = async (template: PolicyTemplate) => {
    try {
      await downloadTemplateAsDocx(template.title, template.content);
      toast.success('Download iniciado!');
    } catch {
      toast.error('Erro ao gerar o arquivo DOCX');
    }
  };

  const handleImportSave = async (data: { title: string; description: string; category: string; content: string }) => {
    await createTemplate.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-space">Biblioteca de Modelos</h1>
          <p className="text-muted-foreground mt-1">Templates prontos para acelerar a criação de políticas</p>
        </div>
        <Button variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="w-4 h-4 mr-2" /> Importar DOCX
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar template..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas categorias</SelectItem>
            {categories.map(c => <SelectItem key={c!} value={c!}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookTemplate className="w-16 h-16 text-emerald-500/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground max-w-md">Tente ajustar os filtros de busca.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(template => (
            <Card key={template.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-emerald-500/30 transition-colors group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-base leading-tight">{template.title}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      {template.category && (
                        <Badge variant="outline" className={categoryColors[template.category] || 'text-muted-foreground'}>
                          {template.category}
                        </Badge>
                      )}
                      {template.framework_code && (
                        <Badge variant="secondary" className="text-xs">
                          {frameworkLabels[template.framework_code] || template.framework_code}
                        </Badge>
                      )}
                      {template.is_system && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Sistema</Badge>
                      )}
                    </div>
                  </div>
                  <BookTemplate className="w-5 h-5 text-emerald-500/50 shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{template.description || 'Sem descrição'}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewTemplate(template)}>
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(template)} title="Baixar DOCX">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUseTemplate(template)}>
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> Usar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTemplate?.title}
              {previewTemplate?.category && (
                <Badge variant="outline" className={categoryColors[previewTemplate.category] || ''}>
                  {previewTemplate.category}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div
              className="prose prose-invert max-w-none p-4"
              dangerouslySetInnerHTML={{ __html: previewTemplate?.content || '' }}
            />
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Fechar</Button>
            <Button variant="outline" onClick={() => { if (previewTemplate) handleDownload(previewTemplate); }}>
              <Download className="w-4 h-4 mr-2" /> Baixar DOCX
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
              if (previewTemplate) handleUseTemplate(previewTemplate);
            }}>
              <FileText className="w-4 h-4 mr-2" /> Usar Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <ImportTemplateDocxDialog open={importOpen} onOpenChange={setImportOpen} onSave={handleImportSave} />
    </div>
  );
}
