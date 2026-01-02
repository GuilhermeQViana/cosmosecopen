import { useState } from 'react';
import { 
  useEvidenceFolders, 
  useCreateEvidenceFolder, 
  useUpdateEvidenceFolder, 
  useDeleteEvidenceFolder,
  useMoveEvidenceToFolder,
  EvidenceFolder 
} from '@/hooks/useEvidenceFolders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Folder, 
  FolderOpen, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronRight,
  FolderPlus,
  Home,
  Loader2
} from 'lucide-react';

interface EvidenceFolderTreeProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  evidenceCountByFolder: Record<string, number>;
}

export function EvidenceFolderTree({ 
  selectedFolderId, 
  onSelectFolder,
  evidenceCountByFolder 
}: EvidenceFolderTreeProps) {
  const { data: folders = [], isLoading } = useEvidenceFolders();
  const createFolder = useCreateEvidenceFolder();
  const updateFolder = useUpdateEvidenceFolder();
  const deleteFolder = useDeleteEvidenceFolder();
  const moveEvidence = useMoveEvidenceToFolder();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [editFolderDialogOpen, setEditFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<EvidenceFolder | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDrop = async (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.evidenceId) {
        await moveEvidence.mutateAsync({ evidenceId: data.evidenceId, folderId });
        toast.success('Evidência movida com sucesso');
      }
    } catch (error) {
      toast.error('Erro ao mover evidência');
    }
  };

  // Build folder tree
  const buildTree = (parentId: string | null): EvidenceFolder[] => {
    return folders.filter(f => f.parent_id === parentId);
  };

  const toggleExpand = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await createFolder.mutateAsync({
        name: newFolderName.trim(),
        parent_id: newFolderParentId,
      });
      toast.success('Pasta criada com sucesso');
      setNewFolderDialogOpen(false);
      setNewFolderName('');
      setNewFolderParentId(null);
    } catch (error) {
      toast.error('Erro ao criar pasta');
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;
    
    try {
      await updateFolder.mutateAsync({
        id: editingFolder.id,
        name: newFolderName.trim(),
      });
      toast.success('Pasta renomeada com sucesso');
      setEditFolderDialogOpen(false);
      setEditingFolder(null);
      setNewFolderName('');
    } catch (error) {
      toast.error('Erro ao renomear pasta');
    }
  };

  const handleDeleteFolder = async (folder: EvidenceFolder) => {
    try {
      await deleteFolder.mutateAsync(folder.id);
      toast.success('Pasta excluída com sucesso');
      if (selectedFolderId === folder.id) {
        onSelectFolder(null);
      }
    } catch (error) {
      toast.error('Erro ao excluir pasta');
    }
  };

  const openEditDialog = (folder: EvidenceFolder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setEditFolderDialogOpen(true);
  };

  const openNewFolderDialog = (parentId: string | null = null) => {
    setNewFolderParentId(parentId);
    setNewFolderName('');
    setNewFolderDialogOpen(true);
  };

  const renderFolder = (folder: EvidenceFolder, depth: number = 0) => {
    const children = buildTree(folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isDragOver = dragOverFolderId === folder.id;
    const count = evidenceCountByFolder[folder.id] || 0;

    return (
      <div key={folder.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all',
                isSelected 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-muted text-foreground',
                isDragOver && 'bg-primary/20 ring-2 ring-primary ring-inset'
              )}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => onSelectFolder(folder.id)}
              onDragOver={(e) => handleDragOver(e, folder.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, folder.id)}
            >
              {children.length > 0 && (
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform shrink-0',
                    isExpanded && 'rotate-90'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(folder.id);
                  }}
                />
              )}
              {children.length === 0 && <div className="w-4" />}
              {isSelected ? (
                <FolderOpen className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="truncate flex-1 text-sm">{folder.name}</span>
              {count > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {count}
                </span>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => openNewFolderDialog(folder.id)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Nova subpasta
            </ContextMenuItem>
            <ContextMenuItem onClick={() => openEditDialog(folder)}>
              <Pencil className="h-4 w-4 mr-2" />
              Renomear
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => handleDeleteFolder(folder)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        
        {isExpanded && children.map(child => renderFolder(child, depth + 1))}
      </div>
    );
  };

  const rootCount = evidenceCountByFolder['root'] || 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Pastas</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => openNewFolderDialog(null)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Root folder */}
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all',
              selectedFolderId === null 
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-muted text-foreground',
              dragOverFolderId === 'root' && 'bg-primary/20 ring-2 ring-primary ring-inset'
            )}
            onClick={() => onSelectFolder(null)}
            onDragOver={(e) => handleDragOver(e, 'root')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
          >
            <div className="w-4" />
            <Home className="h-4 w-4 shrink-0" />
            <span className="truncate flex-1 text-sm font-medium">Todas as evidências</span>
            {rootCount > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {rootCount}
              </span>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            buildTree(null).map(folder => renderFolder(folder))
          )}
        </div>
      </ScrollArea>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Pasta</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nome da pasta"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFolder} disabled={createFolder.isPending}>
              {createFolder.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={editFolderDialogOpen} onOpenChange={setEditFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Pasta</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nome da pasta"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdateFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFolderDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateFolder} disabled={updateFolder.isPending}>
              {updateFolder.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
