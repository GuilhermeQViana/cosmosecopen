import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Plus, 
  FileCode2, 
  Trash2, 
  Edit, 
  Settings2,
  Loader2,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useCustomFrameworks, 
  useDeleteCustomFramework,
  CustomFramework 
} from '@/hooks/useCustomFrameworks';
import { downloadTemplate } from '@/hooks/useImportControls';
import { CreateFrameworkDialog } from './CreateFrameworkDialog';
import { FrameworkControlsManager } from './FrameworkControlsManager';

export function CustomFrameworksTab() {
  const { data: frameworks, isLoading } = useCustomFrameworks();
  const deleteFramework = useDeleteCustomFramework();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingFramework, setEditingFramework] = useState<CustomFramework | null>(null);
  const [managingFramework, setManagingFramework] = useState<CustomFramework | null>(null);
  const [deleteFrameworkId, setDeleteFrameworkId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteFrameworkId) return;
    
    try {
      await deleteFramework.mutateAsync(deleteFrameworkId);
      toast.success('Framework excluído com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir framework');
    } finally {
      setDeleteFrameworkId(null);
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate();
    toast.success('Template baixado');
  };

  if (managingFramework) {
    return (
      <FrameworkControlsManager 
        framework={managingFramework} 
        onBack={() => setManagingFramework(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCode2 className="h-5 w-5" />
                Frameworks Customizados
              </CardTitle>
              <CardDescription>
                Crie e gerencie seus próprios frameworks de conformidade
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Template CSV
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Framework
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !frameworks || frameworks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileCode2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum framework customizado</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Crie seu próprio framework de conformidade adicionando controles 
                manualmente ou importando de um arquivo CSV.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Framework
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {frameworks.map((framework) => (
                <Card key={framework.id} className="relative group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{framework.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {framework.code}
                          </Badge>
                          {framework.version && (
                            <Badge variant="outline" className="text-xs">
                              v{framework.version}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {framework.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {framework.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {framework.controls_count || 0} controles
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setManagingFramework(framework)}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingFramework(framework)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteFrameworkId(framework.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateFrameworkDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {editingFramework && (
        <CreateFrameworkDialog
          open={!!editingFramework}
          onOpenChange={(open) => !open && setEditingFramework(null)}
          editingFramework={editingFramework}
        />
      )}

      <AlertDialog open={!!deleteFrameworkId} onOpenChange={(open) => !open && setDeleteFrameworkId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Framework</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este framework? Esta ação não pode ser desfeita 
              e todos os controles associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteFramework.isPending ? (
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
