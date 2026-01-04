import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  CheckSquare,
  Square,
  Edit3,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type MaturityLevel = Database['public']['Enums']['maturity_level'];

interface BulkEditToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkEdit: () => void;
  isAllSelected: boolean;
}

export function BulkEditToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkEdit,
  isAllSelected,
}: BulkEditToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-3 bg-card border shadow-lg rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selecionado(s)
          </Badge>
          <span className="text-xs text-muted-foreground">
            de {totalCount}
          </span>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="h-8"
          >
            {isAllSelected ? (
              <>
                <Square className="h-4 w-4 mr-1" />
                Desmarcar
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-1" />
                Todos
              </>
            )}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onBulkEdit}
            className="h-8 gap-1"
          >
            <Edit3 className="h-4 w-4" />
            Editar em Lote
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onApply: (data: {
    maturityLevel?: MaturityLevel;
    observations?: string;
    appendObservations?: boolean;
  }) => Promise<void>;
  isApplying?: boolean;
}

export function BulkEditDialog({
  open,
  onOpenChange,
  selectedCount,
  onApply,
  isApplying,
}: BulkEditDialogProps) {
  const [maturityLevel, setMaturityLevel] = useState<MaturityLevel | ''>('');
  const [observations, setObservations] = useState('');
  const [appendObservations, setAppendObservations] = useState(true);

  const handleApply = async () => {
    await onApply({
      maturityLevel: maturityLevel || undefined,
      observations: observations || undefined,
      appendObservations,
    });
    // Reset form
    setMaturityLevel('');
    setObservations('');
    setAppendObservations(true);
  };

  const hasChanges = maturityLevel || observations;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edição em Lote
          </DialogTitle>
          <DialogDescription>
            As alterações serão aplicadas a{' '}
            <strong>{selectedCount} controle(s)</strong> selecionado(s).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Maturity Level */}
          <div className="space-y-2">
            <Label>Nível de Maturidade</Label>
            <Select
              value={maturityLevel}
              onValueChange={(value) => setMaturityLevel(value as MaturityLevel)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 - Inexistente</SelectItem>
                <SelectItem value="1">1 - Inicial</SelectItem>
                <SelectItem value="2">2 - Repetível</SelectItem>
                <SelectItem value="3">3 - Definido</SelectItem>
                <SelectItem value="4">4 - Gerenciado</SelectItem>
                <SelectItem value="5">5 - Otimizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Adicionar observação (opcional)"
              rows={3}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="appendObs"
                checked={appendObservations}
                onCheckedChange={(checked) => setAppendObservations(!!checked)}
              />
              <Label htmlFor="appendObs" className="text-sm text-muted-foreground cursor-pointer">
                Anexar às observações existentes
              </Label>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Esta ação não pode ser desfeita. As alterações serão aplicadas imediatamente a todos os controles selecionados.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApply} disabled={!hasChanges || isApplying}>
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Aplicando...
              </>
            ) : (
              <>Aplicar a {selectedCount} controle(s)</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Checkbox component for control selection
interface ControlSelectCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function ControlSelectCheckbox({
  checked,
  onCheckedChange,
  className,
}: ControlSelectCheckboxProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="h-4 w-4"
      />
    </div>
  );
}
