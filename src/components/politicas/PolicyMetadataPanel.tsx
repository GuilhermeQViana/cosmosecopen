import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, FileText, AlignLeft, Tag, Shield, Clock, Timer, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Policy } from '@/hooks/usePolicies';

const categories = [
  'Segurança', 'Privacidade', 'Acesso', 'Continuidade', 'Backup',
  'Incidentes', 'BYOD', 'Senhas', 'Mudanças', 'Outro',
];

const statuses = [
  { value: 'rascunho', label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  { value: 'em_revisao', label: 'Em Revisão', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'aprovada', label: 'Aprovada', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'publicada', label: 'Publicada', color: 'bg-primary/20 text-primary' },
  { value: 'expirada', label: 'Expirada', color: 'bg-destructive/20 text-destructive' },
  { value: 'arquivada', label: 'Arquivada', color: 'bg-muted text-muted-foreground' },
];

interface Props {
  policy: Partial<Policy>;
  onChange: (updates: Partial<Policy>) => void;
}

function LabelWithTooltip({ icon: Icon, label, tooltip }: { icon: React.ElementType; label: string; tooltip: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground cursor-help">
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Label>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function DatePickerField({ value, onChange, placeholder }: { value: string | null | undefined; onChange: (val: string | null) => void; placeholder: string }) {
  const date = value ? new Date(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-9 text-sm",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
          {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onChange(d ? d.toISOString() : null)}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

function TagsInput({ tags, onChange }: { tags: string[] | null; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');
  const currentTags = tags || [];

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !currentTags.includes(trimmed)) {
      onChange([...currentTags, trimmed]);
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(currentTags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 flex-wrap">
        {currentTags.map(tag => (
          <Badge key={tag} variant="secondary" className="gap-1 text-xs">
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
        placeholder="Adicionar tag..."
        className="h-8 text-sm"
      />
    </div>
  );
}

export function PolicyMetadataPanel({ policy, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <LabelWithTooltip icon={FileText} label="Título" tooltip="Nome identificador da política" />
        <Input value={policy.title || ''} onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Nome da política" className="mt-1.5 h-9" />
      </div>

      <div>
        <LabelWithTooltip icon={AlignLeft} label="Descrição" tooltip="Breve resumo do propósito da política" />
        <Textarea value={policy.description || ''} onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Breve descrição..." rows={2} className="mt-1.5 text-sm" />
      </div>

      <div>
        <LabelWithTooltip icon={Shield} label="Status" tooltip="Estado atual no ciclo de vida da política" />
        <Select value={policy.status || 'rascunho'} onValueChange={(v) => onChange({ status: v })}>
          <SelectTrigger className="mt-1.5 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                <span className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", s.color.split(' ')[0])} />
                  {s.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <LabelWithTooltip icon={Tag} label="Categoria" tooltip="Classificação temática da política" />
        <Select value={policy.category || ''} onValueChange={(v) => onChange({ category: v })}>
          <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <LabelWithTooltip icon={Clock} label="Próxima Revisão" tooltip="Data em que a política deve ser revisada" />
        <div className="mt-1.5">
          <DatePickerField
            value={policy.next_review_at}
            onChange={(val) => onChange({ next_review_at: val })}
            placeholder="Selecionar data..."
          />
        </div>
      </div>

      <div>
        <LabelWithTooltip icon={Timer} label="Data de Expiração" tooltip="Data em que a política perde validade" />
        <div className="mt-1.5">
          <DatePickerField
            value={policy.expires_at}
            onChange={(val) => onChange({ expires_at: val })}
            placeholder="Selecionar data..."
          />
        </div>
      </div>

      <div>
        <LabelWithTooltip icon={Tag} label="Tags" tooltip="Palavras-chave para organização e busca" />
        <div className="mt-1.5">
          <TagsInput tags={policy.tags || null} onChange={(tags) => onChange({ tags })} />
        </div>
      </div>

      {policy.version !== undefined && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Label className="text-xs text-muted-foreground">Versão:</Label>
          <Badge variant="outline" className="text-xs">v{policy.version}</Badge>
        </div>
      )}
    </div>
  );
}
