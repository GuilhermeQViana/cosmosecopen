import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useCreateCustomFramework, 
  useUpdateCustomFramework,
  CustomFramework 
} from '@/hooks/useCustomFrameworks';
import { frameworkIconOptions, getFrameworkIcon } from '@/lib/framework-icons';

interface CreateFrameworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFramework?: CustomFramework | null;
}

export function CreateFrameworkDialog({ 
  open, 
  onOpenChange,
  editingFramework 
}: CreateFrameworkDialogProps) {
  const createFramework = useCreateCustomFramework();
  const updateFramework = useUpdateCustomFramework();
  
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('shield');

  const isEditing = !!editingFramework;
  const isLoading = createFramework.isPending || updateFramework.isPending;

  useEffect(() => {
    if (editingFramework) {
      setName(editingFramework.name);
      setCode(editingFramework.code);
      setVersion(editingFramework.version || '');
      setDescription(editingFramework.description || '');
      setSelectedIcon(editingFramework.icon || 'shield');
    } else {
      setName('');
      setCode('');
      setVersion('');
      setDescription('');
      setSelectedIcon('shield');
    }
  }, [editingFramework, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !code.trim()) {
      toast.error('Nome e código são obrigatórios');
      return;
    }

    try {
      if (isEditing && editingFramework) {
        await updateFramework.mutateAsync({
          id: editingFramework.id,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          version: version.trim() || undefined,
          description: description.trim() || undefined,
          icon: selectedIcon,
        });
        toast.success('Framework atualizado com sucesso');
      } else {
        await createFramework.mutateAsync({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          version: version.trim() || undefined,
          description: description.trim() || undefined,
          icon: selectedIcon,
        });
        toast.success('Framework criado com sucesso');
      }
      onOpenChange(false);
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast.error('Já existe um framework com este código');
      } else {
        toast.error(error.message || 'Erro ao salvar framework');
      }
    }
  };

  const SelectedIconComponent = getFrameworkIcon(selectedIcon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SelectedIconComponent className="h-5 w-5 text-primary" />
            {isEditing ? 'Editar Framework' : 'Novo Framework'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações do framework customizado.'
              : 'Crie um novo framework de conformidade personalizado para sua organização.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Framework *</Label>
            <Input
              id="name"
              placeholder="Ex: Política Interna de Segurança"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                placeholder="Ex: POL_SEG_01"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono uppercase"
                required
              />
              <p className="text-xs text-muted-foreground">
                Identificador único do framework
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Versão</Label>
              <Input
                id="version"
                placeholder="Ex: 1.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <ScrollArea className="h-32 rounded-md border p-2">
              <div className="grid grid-cols-9 gap-1">
                {frameworkIconOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setSelectedIcon(option.name)}
                      className={cn(
                        "flex items-center justify-center p-2 rounded-md transition-colors",
                        selectedIcon === option.name
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                      title={option.label}
                    >
                      <IconComponent className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              Ícone selecionado: {frameworkIconOptions.find(i => i.name === selectedIcon)?.label}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o objetivo e escopo deste framework..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditing ? 'Salvar Alterações' : 'Criar Framework'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}