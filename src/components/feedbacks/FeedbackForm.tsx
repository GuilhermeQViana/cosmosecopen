import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from './StarRating';
import { useSubmitFeedback } from '@/hooks/useFeedbacks';
import { Send, MessageSquareHeart } from 'lucide-react';

const MODULES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'diagnostico', label: 'Diagnóstico' },
  { value: 'riscos', label: 'Riscos' },
  { value: 'evidencias', label: 'Evidências' },
  { value: 'plano-acao', label: 'Plano de Ação' },
  { value: 'relatorios', label: 'Relatórios' },
  { value: 'mapeamento', label: 'Mapeamento' },
  { value: 'equipe', label: 'Equipe' },
  { value: 'auditoria', label: 'Auditoria' },
  { value: 'configuracoes', label: 'Configurações' },
  { value: 'vrm', label: 'VRM - Fornecedores' },
  { value: 'geral', label: 'Plataforma em Geral' },
];

export function FeedbackForm() {
  const [module, setModule] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [liked, setLiked] = useState('');
  const [suggestions, setSuggestions] = useState('');

  const { mutate: submitFeedback, isPending } = useSubmitFeedback();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!module || rating === 0) {
      return;
    }

    submitFeedback(
      {
        module,
        rating,
        liked: liked.trim() || undefined,
        suggestions: suggestions.trim() || undefined,
      },
      {
        onSuccess: () => {
          setModule('');
          setRating(0);
          setLiked('');
          setSuggestions('');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquareHeart className="w-5 h-5 text-primary" />
          <CardTitle>Ajude-nos a melhorar!</CardTitle>
        </div>
        <CardDescription>
          Sua opinião é muito importante para nós. Conte-nos o que você acha de cada módulo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="module">Módulo</Label>
            <Select value={module} onValueChange={setModule}>
              <SelectTrigger id="module">
                <SelectValue placeholder="Selecione um módulo" />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map((mod) => (
                  <SelectItem key={mod.value} value={mod.value}>
                    {mod.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Avaliação</Label>
            <div className="pt-1">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="liked">O que você gostou neste módulo?</Label>
            <Textarea
              id="liked"
              placeholder="Conte-nos o que funciona bem para você..."
              value={liked}
              onChange={(e) => setLiked(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestions">Sugestões de melhoria</Label>
            <Textarea
              id="suggestions"
              placeholder="O que podemos fazer para melhorar sua experiência?"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={!module || rating === 0 || isPending}
            className="w-full gap-2"
          >
            <Send className="w-4 h-4" />
            {isPending ? 'Enviando...' : 'Enviar Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
