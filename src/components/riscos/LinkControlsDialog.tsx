import { useState, useEffect, useMemo } from 'react';
import { Risk, useRiskControls, useLinkRiskControl, useUnlinkRiskControl } from '@/hooks/useRisks';
import { useFrameworks } from '@/hooks/useFrameworks';
import { useControls, Control, useControlsByCategory } from '@/hooks/useControls';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, X, ChevronRight, ChevronDown, Layers } from 'lucide-react';

interface LinkControlsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk: Risk | null;
}

export function LinkControlsDialog({ open, onOpenChange, risk }: LinkControlsDialogProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: frameworks } = useFrameworks();
  const { data: controls, isLoading: loadingControls } = useControls(
    selectedFramework === 'all' ? null : selectedFramework
  );
  const { data: linkedControls, isLoading: loadingLinked } = useRiskControls(risk?.id ?? null);
  const linkControl = useLinkRiskControl();
  const unlinkControl = useUnlinkRiskControl();

  // For "all frameworks" mode, fetch all controls from all frameworks
  const { data: allFrameworksControls, isLoading: loadingAllControls } = useAllFrameworksControls(
    selectedFramework === 'all' ? frameworks : null
  );

  const activeControls = selectedFramework === 'all' ? allFrameworksControls : controls;
  const isLoadingControls = selectedFramework === 'all' ? loadingAllControls : loadingControls;

  useEffect(() => {
    if (frameworks?.length && selectedFramework === 'all') {
      // Keep "all" as default
    }
  }, [frameworks, selectedFramework]);

  const linkedControlIds = new Set(linkedControls?.map((lc) => lc.control_id) || []);

  const filteredControls = useMemo(() => {
    if (!activeControls) return [];
    
    const query = searchQuery.toLowerCase();
    return activeControls.filter((control) => 
      control.code.toLowerCase().includes(query) ||
      control.name.toLowerCase().includes(query) ||
      (control.category?.toLowerCase().includes(query) ?? false)
    );
  }, [activeControls, searchQuery]);

  // Group controls by category
  const groupedControls = useMemo(() => {
    const groups = new Map<string, (Control & { frameworkName?: string })[]>();
    
    filteredControls.forEach((control) => {
      const category = control.category || 'Sem categoria';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(control);
    });
    
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredControls]);

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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(groupedControls.map(([cat]) => cat)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const isLoading = linkControl.isPending || unlinkControl.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Vincular Controles ao Risco
            {risk && (
              <Badge variant="outline" className="font-mono">
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
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {linkedControls.map((lc: any) => (
                  <Badge
                    key={lc.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {lc.controls?.code}: {lc.controls?.name?.slice(0, 25)}
                    {lc.controls?.name?.length > 25 && '...'}
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
              value={selectedFramework}
              onValueChange={setSelectedFramework}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Todos os Frameworks
                  </div>
                </SelectItem>
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

          {/* Expand/Collapse controls */}
          {groupedControls.length > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {filteredControls.length} controles em {groupedControls.length} categorias
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={expandAll} className="h-6 text-xs">
                  Expandir tudo
                </Button>
                <Button variant="ghost" size="sm" onClick={collapseAll} className="h-6 text-xs">
                  Recolher tudo
                </Button>
              </div>
            </div>
          )}

          {/* Controls list grouped by category */}
          <ScrollArea className="flex-1 border rounded-md">
            {isLoadingControls || loadingLinked ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : groupedControls.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum controle encontrado
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {groupedControls.map(([category, categoryControls]) => (
                  <Collapsible
                    key={category}
                    open={expandedCategories.has(category)}
                    onOpenChange={() => toggleCategory(category)}
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted/50 rounded-md text-left">
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-sm flex-1">{category}</span>
                      <Badge variant="outline" className="text-xs">
                        {categoryControls.length}
                      </Badge>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 space-y-1 border-l pl-2">
                        {categoryControls.map((control) => (
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
                                {linkedControlIds.has(control.id) && (
                                  <Badge variant="secondary" className="text-xs">
                                    Vinculado
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm truncate">{control.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
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

// Hook to fetch controls from all frameworks
function useAllFrameworksControls(frameworks: { id: string }[] | null | undefined) {
  const [allControls, setAllControls] = useState<Control[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!frameworks || frameworks.length === 0) {
      setAllControls([]);
      return;
    }

    const fetchAllControls = async () => {
      setIsLoading(true);
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const frameworkIds = frameworks.map(f => f.id);
        
        const { data, error } = await supabase
          .from('controls')
          .select('*')
          .in('framework_id', frameworkIds)
          .order('order_index');

        if (error) throw error;
        setAllControls(data as Control[]);
      } catch (error) {
        console.error('Error fetching all controls:', error);
        setAllControls([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllControls();
  }, [frameworks]);

  return { data: allControls, isLoading };
}