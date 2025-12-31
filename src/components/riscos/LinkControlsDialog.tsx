import { useState, useEffect } from 'react';
import { Risk, useRiskControls, useLinkRiskControl, useUnlinkRiskControl } from '@/hooks/useRisks';
import { useFrameworks } from '@/hooks/useFrameworks';
import { useControls, Control } from '@/hooks/useControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, X } from 'lucide-react';

interface LinkControlsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk: Risk | null;
}

export function LinkControlsDialog({ open, onOpenChange, risk }: LinkControlsDialogProps) {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { data: frameworks } = useFrameworks();
  const { data: controls, isLoading: loadingControls } = useControls(selectedFramework);
  const { data: linkedControls, isLoading: loadingLinked } = useRiskControls(risk?.id ?? null);
  const linkControl = useLinkRiskControl();
  const unlinkControl = useUnlinkRiskControl();

  useEffect(() => {
    if (frameworks?.length && !selectedFramework) {
      setSelectedFramework(frameworks[0].id);
    }
  }, [frameworks, selectedFramework]);

  const linkedControlIds = new Set(linkedControls?.map((lc) => lc.control_id) || []);

  const filteredControls = controls?.filter((control) => {
    const query = searchQuery.toLowerCase();
    return (
      control.code.toLowerCase().includes(query) ||
      control.name.toLowerCase().includes(query)
    );
  }) || [];

  const handleToggleControl = async (control: Control) => {
    if (!risk) return;

    try {
      if (linkedControlIds.has(control.id)) {
        await unlinkControl.mutateAsync({ riskId: risk.id, controlId: control.id });
        toast({ title: 'Controle desvinculado' });
      } else {
        await linkControl.mutateAsync({ riskId: risk.id, controlId: control.id });
        toast({ title: 'Controle vinculado' });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a vinculação',
        variant: 'destructive',
      });
    }
  };

  const isLoading = linkControl.isPending || unlinkControl.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Vincular Controles ao Risco
            {risk && (
              <Badge variant="outline" className="ml-2 font-mono">
                {risk.code}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* Linked Controls */}
          {linkedControls && linkedControls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Controles Vinculados ({linkedControls.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {linkedControls.map((lc: any) => (
                  <Badge
                    key={lc.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {lc.controls?.code}: {lc.controls?.name?.slice(0, 30)}
                    {lc.controls?.name?.length > 30 && '...'}
                    <button
                      onClick={() => handleToggleControl(lc.controls)}
                      className="ml-1 hover:text-destructive"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Framework selector and search */}
          <div className="flex gap-2">
            <Select
              value={selectedFramework || ''}
              onValueChange={setSelectedFramework}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworks?.map((fw) => (
                  <SelectItem key={fw.id} value={fw.id}>
                    {fw.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar controle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Controls list */}
          <ScrollArea className="flex-1 border rounded-md">
            {loadingControls || loadingLinked ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredControls.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum controle encontrado
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredControls.map((control) => (
                  <div
                    key={control.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleToggleControl(control)}
                  >
                    <Checkbox
                      checked={linkedControlIds.has(control.id)}
                      disabled={isLoading}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {control.code}
                        </span>
                        {control.category && (
                          <Badge variant="outline" className="text-xs">
                            {control.category.split(' - ')[0]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm truncate">{control.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
