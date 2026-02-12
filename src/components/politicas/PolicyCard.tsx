import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, MoreVertical, Pencil, Trash2, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Policy } from '@/hooks/usePolicies';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  rascunho: { label: 'Rascunho', variant: 'secondary' },
  em_revisao: { label: 'Em Revisão', variant: 'outline' },
  aprovada: { label: 'Aprovada', variant: 'default' },
  publicada: { label: 'Publicada', variant: 'default' },
  expirada: { label: 'Expirada', variant: 'destructive' },
  arquivada: { label: 'Arquivada', variant: 'secondary' },
};

const categoryColors: Record<string, string> = {
  'Segurança': 'bg-blue-500/10 text-blue-400',
  'Privacidade': 'bg-purple-500/10 text-purple-400',
  'Acesso': 'bg-amber-500/10 text-amber-400',
  'Continuidade': 'bg-teal-500/10 text-teal-400',
  'Backup': 'bg-cyan-500/10 text-cyan-400',
  'Incidentes': 'bg-red-500/10 text-red-400',
  'BYOD': 'bg-orange-500/10 text-orange-400',
  'Senhas': 'bg-yellow-500/10 text-yellow-400',
  'Mudanças': 'bg-indigo-500/10 text-indigo-400',
};

interface Props {
  policy: Policy;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PolicyCard({ policy, onEdit, onDelete }: Props) {
  const status = statusConfig[policy.status] || { label: policy.status, variant: 'secondary' as const };
  const categoryClass = policy.category ? categoryColors[policy.category] || 'bg-muted text-muted-foreground' : '';

  return (
    <Card className="hover:border-emerald-500/40 transition-colors cursor-pointer" onClick={() => onEdit(policy.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
            <CardTitle className="text-base truncate">{policy.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(policy.id); }}>
                <Pencil className="w-4 h-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(policy.id); }}>
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {policy.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{policy.description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={status.variant}>{status.label}</Badge>
          {policy.category && <Badge className={categoryClass}>{policy.category}</Badge>}
          <Badge variant="outline" className="text-xs">v{policy.version}</Badge>
        </div>
        {policy.next_review_at && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Revisão: {format(new Date(policy.next_review_at), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
