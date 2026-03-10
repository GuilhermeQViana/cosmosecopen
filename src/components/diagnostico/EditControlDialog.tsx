import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Control } from '@/hooks/useControls';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

interface EditControlDialogProps {
  control: Control;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditControlDialog({ control, open, onOpenChange }: EditControlDialogProps) {
  const queryClient = useQueryClient();

  const [code, setCode] = useState(control.code);
  const [name, setName] = useState(control.name);
  const [description, setDescription] = useState(control.description || '');
  const [category, setCategory] = useState(control.category || '');
  const [weight, setWeight] = useState(control.weight || 1);
  const [criticality, setCriticality] = useState(control.criticality || '');
  const [evidenceExample, setEvidenceExample] = useState(control.evidence_example || '');
  const [implementationExample, setImplementationExample] = useState(control.implementation_example || '');
  const [weightReason, setWeightReason] = useState(control.weight_reason || '');

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('controls')
        .update({
          code,
          name,
          description: description || null,
          category: category || null,
          weight,
          criticality: criticality || null,
          evidence_example: evidenceExample || null,
          implementation_example: implementationExample || null,
          weight_reason: weightReason || null,
        })
        .eq('id', control.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      toast.success('Requisito atualizado com sucesso');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar: ' + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Requisito</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Peso ({weight})</Label>
              <Slider
                value={[weight]}
                onValueChange={([v]) => setWeight(v)}
                min={1}
                max={3}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 — Normal</span>
                <span>2 — Importante</span>
                <span>3 — Crítico</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Criticidade</Label>
              <Select value={criticality} onValueChange={setCriticality}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weightReason">Motivo do Peso</Label>
            <Textarea id="weightReason" value={weightReason} onChange={(e) => setWeightReason(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementationExample">Exemplo de Implementação</Label>
            <Textarea id="implementationExample" value={implementationExample} onChange={(e) => setImplementationExample(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidenceExample">Exemplo de Evidência</Label>
            <Textarea id="evidenceExample" value={evidenceExample} onChange={(e) => setEvidenceExample(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !name.trim() || !code.trim()}>
            {mutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Salvando...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Salvar</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
