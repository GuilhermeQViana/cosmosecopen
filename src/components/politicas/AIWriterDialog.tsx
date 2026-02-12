import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  { value: 'moderado', label: 'Moderado - Equilíbrio' },
  { value: 'rigoroso', label: 'Rigoroso - Controles rígidos' },
];

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

const companySizes = [
  { value: 'startup', label: 'Startup / Pequena' },
  { value: 'media', label: 'Média empresa' },
  { value: 'grande', label: 'Grande / Corporação' },
  { value: 'multinacional', label: 'Multinacional' },
];

const audiences = [
  { value: 'todos', label: 'Todos os colaboradores' },
  { value: 'ti', label: 'Equipe de TI / Segurança' },
  { value: 'gestao', label: 'Alta gestão / Diretoria' },
  { value: 'terceiros', label: 'Terceiros / Fornecedores' },
];

const tones = [
  { value: 'formal', label: 'Formal / Jurídico' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'acessivel', label: 'Acessível / Didático' },
];

const lengths = [
  { value: 'resumido', label: 'Resumido (1-2 pág.)' },
  { value: 'padrao', label: 'Padrão (3-5 pág.)' },
  { value: 'detalhado', label: 'Detalhado (6+ pág.)' },
];

const frameworkOptions = [
  'ISO 27001',
  'NIST CSF',
  'SOC 2',
  'LGPD',
  'GDPR',
  'PCI DSS',
  'HIPAA',
  'CIS Controls',
];

export function AIWriterDialog({ open, onOpenChange, onGenerated, currentTitle, currentContent }: AIWriterDialogProps) {
  const [sector, setSector] = useState('');
  const [rigor, setRigor] = useState('moderado');
  const [language, setLanguage] = useState('pt-BR');
  const [companySize, setCompanySize] = useState('');
  const [audience, setAudience] = useState('todos');
  const [tone, setTone] = useState('formal');
  const [length, setLength] = useState('padrao');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleFramework = (fw: string) => {
    setSelectedFrameworks(prev =>
      prev.includes(fw) ? prev.filter(f => f !== fw) : [...prev, fw]
    );
  };

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
          language,
          companySize: companySize || null,
          audience,
          tone,
          length,
          frameworks: selectedFrameworks.length > 0 ? selectedFrameworks : null,
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
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Gerar com IA
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-4 pb-2">
            {currentContent && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                A IA vai reescrever o conteúdo atual da política com base nas suas instruções.
              </p>
            )}

            {/* Setor - full width */}
            <div className="space-y-2">
              <Label>Setor da Empresa</Label>
              <Select value={sector || 'none'} onValueChange={v => setSector(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum específico</SelectItem>
                  {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Grid 2 cols: Idioma + Porte */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {languages.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Porte da Empresa</Label>
                <Select value={companySize || 'none'} onValueChange={v => setCompanySize(v === 'none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não especificado</SelectItem>
                    {companySizes.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid 2 cols: Rigor + Tom */}
            <div className="grid grid-cols-2 gap-3">
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
                <Label>Tom da Escrita</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tones.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid 2 cols: Público + Extensão */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Público-alvo</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {audiences.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Extensão</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {lengths.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Frameworks - full width multi-select */}
            <div className="space-y-2">
              <Label>Frameworks de Referência</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-md border bg-muted/30">
                {frameworkOptions.map(fw => (
                  <label key={fw} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={selectedFrameworks.includes(fw)}
                      onCheckedChange={() => toggleFramework(fw)}
                    />
                    {fw}
                  </label>
                ))}
              </div>
            </div>

            {/* Instruções adicionais */}
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
        </ScrollArea>

        <DialogFooter className="pt-2">
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
