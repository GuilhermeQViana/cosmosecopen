import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  useQualificationTemplates,
  useCreateQualificationTemplate,
  useUpdateQualificationTemplate,
  useDeleteQualificationTemplate,
} from '@/hooks/useQualificationTemplates';
import {
  Plus,
  FileText,
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Trash2,
  Loader2,
  ClipboardList,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  rascunho: { label: 'Rascunho', variant: 'secondary' },
  publicado: { label: 'Publicado', variant: 'default' },
  arquivado: { label: 'Arquivado', variant: 'outline' },
};

export default function QualificationTemplates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: templates = [], isLoading } = useQualificationTemplates();
  const createTemplate = useCreateQualificationTemplate();
  const updateTemplate = useUpdateQualificationTemplate();
  const deleteTemplate = useDeleteQualificationTemplate();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [search, setSearch] = useState('');

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const template = await createTemplate.mutateAsync({ name: newName.trim(), description: newDescription.trim() || undefined });
      setShowCreate(false);
      setNewName('');
      setNewDescription('');
      toast({ title: 'Template criado' });
      navigate(`/vrm/qualificacao/templates/${template.id}`);
    } catch {
      toast({ title: 'Erro ao criar template', variant: 'destructive' });
    }
  };

  const handleDuplicate = async (t: typeof templates[0]) => {
    try {
      await createTemplate.mutateAsync({ name: `${t.name} (cópia)`, description: t.description || undefined });
      toast({ title: 'Template duplicado' });
    } catch {
      toast({ title: 'Erro ao duplicar', variant: 'destructive' });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await updateTemplate.mutateAsync({ id, status: 'arquivado' });
      toast({ title: 'Template arquivado' });
    } catch {
      toast({ title: 'Erro ao arquivar', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate.mutateAsync(id);
      toast({ title: 'Template excluído' });
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-space">Templates de Qualificação</h1>
          <p className="text-muted-foreground text-sm">Crie e gerencie seus questionários de qualificação de fornecedores.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">Nenhum template encontrado</h3>
            <p className="text-muted-foreground text-sm mb-4">Crie seu primeiro template de qualificação para começar.</p>
            <Button onClick={() => setShowCreate(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Criar Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const status = STATUS_CONFIG[t.status] || STATUS_CONFIG.rascunho;
            return (
              <Card
                key={t.id}
                className="cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => navigate(`/vrm/qualificacao/templates/${t.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <CardTitle className="text-base truncate">{t.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/vrm/qualificacao/templates/${t.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(t)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(t.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Arquivar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(t.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {t.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{t.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      v{t.version} · {format(new Date(t.updated_at), "dd/MM/yy", { locale: ptBR })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Template de Qualificação</DialogTitle>
            <DialogDescription>Defina o nome e descrição do questionário.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome *</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Homologação de TI"
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Descrição</label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Descreva o objetivo deste questionário..."
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!newName.trim() || createTemplate.isPending}>
                {createTemplate.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Criar Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
