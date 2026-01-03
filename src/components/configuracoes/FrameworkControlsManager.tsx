import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Loader2,
  Save,
  FileCode2,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  CustomFramework,
  useFrameworkControls, 
  useCreateControl, 
  useUpdateControl,
  useDeleteControl,
  ControlInput
} from '@/hooks/useCustomFrameworks';
import { ImportControlsCSV } from './ImportControlsCSV';

interface FrameworkControlsManagerProps {
  framework: CustomFramework;
  onBack: () => void;
}

interface ControlFormData {
  code: string;
  name: string;
  category: string;
  description: string;
  weight: number;
  criticality: string;
  weight_reason: string;
  implementation_example: string;
  evidence_example: string;
}

const defaultFormData: ControlFormData = {
  code: '',
  name: '',
  category: '',
  description: '',
  weight: 1,
  criticality: '',
  weight_reason: '',
  implementation_example: '',
  evidence_example: '',
};

export function FrameworkControlsManager({ framework, onBack }: FrameworkControlsManagerProps) {
  const { data: controls, isLoading, refetch } = useFrameworkControls(framework.id);
  const createControl = useCreateControl();
  const updateControl = useUpdateControl();
  const deleteControl = useDeleteControl();

  const [showImport, setShowImport] = useState(false);
  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [editingControlId, setEditingControlId] = useState<string | null>(null);
  const [deleteControlId, setDeleteControlId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ControlFormData>(defaultFormData);
  const [searchQuery, setSearchQuery] = useState('');

  const isFormLoading = createControl.isPending || updateControl.isPending;

  const filteredControls = controls?.filter((control) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      control.code.toLowerCase().includes(query) ||
      control.name.toLowerCase().includes(query) ||
      control.category?.toLowerCase().includes(query)
    );
  });

  const handleOpenCreate = () => {
    setFormData(defaultFormData);
    setEditingControlId(null);
    setControlDialogOpen(true);
  };

  const handleOpenEdit = (control: any) => {
    setFormData({
      code: control.code,
      name: control.name,
      category: control.category || '',
      description: control.description || '',
      weight: control.weight || 1,
      criticality: control.criticality || '',
      weight_reason: control.weight_reason || '',
      implementation_example: control.implementation_example || '',
      evidence_example: control.evidence_example || '',
    });
    setEditingControlId(control.id);
    setControlDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Código e nome são obrigatórios');
      return;
    }

    try {
      const controlData: ControlInput = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category.trim() || undefined,
        description: formData.description.trim() || undefined,
        weight: formData.weight,
        criticality: formData.criticality || undefined,
        weight_reason: formData.weight_reason.trim() || undefined,
        implementation_example: formData.implementation_example.trim() || undefined,
        evidence_example: formData.evidence_example.trim() || undefined,
      };

      if (editingControlId) {
        await updateControl.mutateAsync({
          id: editingControlId,
          frameworkId: framework.id,
          ...controlData,
        });
        toast.success('Controle atualizado com sucesso');
      } else {
        await createControl.mutateAsync({
          frameworkId: framework.id,
          ...controlData,
          order_index: (controls?.length || 0) + 1,
        });
        toast.success('Controle criado com sucesso');
      }

      setControlDialogOpen(false);
      setFormData(defaultFormData);
      setEditingControlId(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar controle');
    }
  };

  const handleDelete = async () => {
    if (!deleteControlId) return;

    try {
      await deleteControl.mutateAsync({ id: deleteControlId, frameworkId: framework.id });
      toast.success('Controle excluído com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir controle');
    } finally {
      setDeleteControlId(null);
    }
  };

  const handleImportSuccess = () => {
    setShowImport(false);
    refetch();
  };

  if (showImport) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setShowImport(false)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <ImportControlsCSV
          frameworkId={framework.id}
          onSuccess={handleImportSuccess}
          onCancel={() => setShowImport(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileCode2 className="h-5 w-5" />
            {framework.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="font-mono text-xs">
              {framework.code}
            </Badge>
            {framework.version && (
              <Badge variant="outline" className="text-xs">v{framework.version}</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {controls?.length || 0} controles
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Gerenciar Controles</CardTitle>
              <CardDescription>
                Adicione, edite ou remova controles deste framework
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowImport(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
              <Button onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Controle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar controles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Controls Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !filteredControls || filteredControls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileCode2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'Nenhum controle encontrado' : 'Nenhum controle cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Tente ajustar sua busca'
                  : 'Adicione controles manualmente ou importe de um arquivo CSV'
                }
              </p>
              {!searchQuery && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowImport(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar CSV
                  </Button>
                  <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Controle
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-32">Categoria</TableHead>
                    <TableHead className="w-20">Peso</TableHead>
                    <TableHead className="w-24">Criticidade</TableHead>
                    <TableHead className="w-20 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredControls.map((control) => (
                    <TableRow key={control.id}>
                      <TableCell className="font-mono text-sm">
                        {control.code}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <span className="line-clamp-1">{control.name}</span>
                      </TableCell>
                      <TableCell>
                        {control.category && (
                          <Badge variant="outline" className="text-xs">
                            {control.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{control.weight || 1}</TableCell>
                      <TableCell>
                        {control.criticality && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              control.criticality === 'alta' 
                                ? 'bg-red-500/10 text-red-600'
                                : control.criticality === 'media'
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-green-500/10 text-green-600'
                            }`}
                          >
                            {control.criticality}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(control)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteControlId(control.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Control Form Dialog */}
      <Dialog open={controlDialogOpen} onOpenChange={setControlDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingControlId ? 'Editar Controle' : 'Novo Controle'}
            </DialogTitle>
            <DialogDescription>
              {editingControlId 
                ? 'Atualize as informações do controle.'
                : 'Preencha as informações do novo controle.'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctrl-code">Código *</Label>
                <Input
                  id="ctrl-code"
                  placeholder="Ex: CTRL-001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="font-mono uppercase"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctrl-category">Categoria</Label>
                <Input
                  id="ctrl-category"
                  placeholder="Ex: Governança"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctrl-name">Nome *</Label>
              <Input
                id="ctrl-name"
                placeholder="Nome do controle"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctrl-description">Descrição</Label>
              <Textarea
                id="ctrl-description"
                placeholder="Descreva o objetivo e escopo do controle..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctrl-weight">Peso (1-5)</Label>
                <Select
                  value={String(formData.weight)}
                  onValueChange={(v) => setFormData({ ...formData, weight: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Baixo</SelectItem>
                    <SelectItem value="2">2 - Médio-Baixo</SelectItem>
                    <SelectItem value="3">3 - Médio</SelectItem>
                    <SelectItem value="4">4 - Médio-Alto</SelectItem>
                    <SelectItem value="5">5 - Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctrl-criticality">Criticidade</Label>
                <Select
                  value={formData.criticality || 'none'}
                  onValueChange={(v) => setFormData({ ...formData, criticality: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não definida</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctrl-weight-reason">Justificativa do Peso</Label>
              <Textarea
                id="ctrl-weight-reason"
                placeholder="Explique por que este controle tem este peso..."
                value={formData.weight_reason}
                onChange={(e) => setFormData({ ...formData, weight_reason: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctrl-impl">Exemplo de Implementação</Label>
              <Textarea
                id="ctrl-impl"
                placeholder="Descreva como implementar este controle..."
                value={formData.implementation_example}
                onChange={(e) => setFormData({ ...formData, implementation_example: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctrl-evidence">Exemplo de Evidência</Label>
              <Textarea
                id="ctrl-evidence"
                placeholder="Descreva que tipo de evidência comprova a implementação..."
                value={formData.evidence_example}
                onChange={(e) => setFormData({ ...formData, evidence_example: e.target.value })}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setControlDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isFormLoading}>
                {isFormLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {editingControlId ? 'Salvar Alterações' : 'Criar Controle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteControlId} onOpenChange={(open) => !open && setDeleteControlId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Controle</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este controle? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteControl.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
