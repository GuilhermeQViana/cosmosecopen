import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIWriterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (content: string) => void;
  currentTitle?: string;
  currentContent?: string;
}

const sectors = [
  'Financeiro / Bancário',
  'Saúde',
  'Tecnologia',
  'Varejo',
  'Governo',
  'Educação',
  'Industrial',
  'Outro',
];

const rigorLevels = [
  { value: 'brando', label: 'Brando - Diretrizes flexíveis' },
  { value: 'moderado', label: 'Moderado - Equilíbrio entre flexibilidade e controle' },
  { value: 'rigoroso', label: 'Rigoroso - Controles rígidos e detalhados' },
];

export function AIWriterDialog({ open, onOpenChange, onGenerated, currentTitle, currentContent }: AIWriterDialogProps) {
  const [sector, setSector] = useState('');
  const [rigor, setRigor] = useState('moderado');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const response = await supabase.functions.invoke('generate-policy', {
        body: {
          templateContent: currentContent || null,
          templateTitle: currentTitle || 'Nova Política',
          sector: sector || null,
          rigor,
          customInstructions: customInstructions || null,
        },
      });

      if (response.error) throw response.error;

      const content = response.data?.content;
      if (!content) throw new Error('Conteúdo vazio');

      onGenerated(content);
      onOpenChange(false);
      toast.success('Política gerada com sucesso');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Erro ao gerar política. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Gerar com IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {currentContent && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              A IA vai reescrever o conteúdo atual da política com base nas suas instruções.
            </p>
          )}

          <div className="space-y-2">
            <Label>Setor da Empresa</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
              <SelectContent>
                {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nível de Rigor</Label>
            <Select value={rigor} onValueChange={setRigor}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {rigorLevels.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Instruções Adicionais (opcional)</Label>
            <Textarea
              placeholder="Ex: Incluir cláusulas sobre trabalho remoto, mencionar LGPD..."
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>Cancelar</Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'Gerando...' : 'Gerar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
