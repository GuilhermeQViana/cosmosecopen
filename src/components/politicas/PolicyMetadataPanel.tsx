import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import type { Policy } from '@/hooks/usePolicies';

const categories = [
  'Segurança', 'Privacidade', 'Acesso', 'Continuidade', 'Backup',
  'Incidentes', 'BYOD', 'Senhas', 'Mudanças', 'Outro',
];

const statuses = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_revisao', label: 'Em Revisão' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'publicada', label: 'Publicada' },
  { value: 'expirada', label: 'Expirada' },
  { value: 'arquivada', label: 'Arquivada' },
];

interface Props {
  policy: Partial<Policy>;
  onChange: (updates: Partial<Policy>) => void;
}

export function PolicyMetadataPanel({ policy, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" value={policy.title || ''} onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Nome da política" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" value={policy.description || ''} onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Breve descrição..." rows={2} className="mt-1" />
      </div>
      <div>
        <Label>Status</Label>
        <Select value={policy.status || 'rascunho'} onValueChange={(v) => onChange({ status: v })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Categoria</Label>
        <Select value={policy.category || ''} onValueChange={(v) => onChange({ category: v })}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="next_review_at">Próxima Revisão</Label>
        <Input id="next_review_at" type="date" value={policy.next_review_at?.split('T')[0] || ''}
          onChange={(e) => onChange({ next_review_at: e.target.value || null })} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="expires_at">Data de Expiração</Label>
        <Input id="expires_at" type="date" value={policy.expires_at?.split('T')[0] || ''}
          onChange={(e) => onChange({ expires_at: e.target.value || null })} className="mt-1" />
      </div>
      {policy.version !== undefined && (
        <div className="flex items-center gap-2">
          <Label>Versão:</Label>
          <Badge variant="outline">v{policy.version}</Badge>
        </div>
      )}
    </div>
  );
}
