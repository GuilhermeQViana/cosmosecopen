import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Search, Loader2 } from 'lucide-react';
import { usePolicies } from '@/hooks/usePolicies';
import { PolicyCard } from '@/components/politicas/PolicyCard';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusOptions = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_revisao', label: 'Em Revisão' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'publicada', label: 'Publicada' },
  { value: 'expirada', label: 'Expirada' },
  { value: 'arquivada', label: 'Arquivada' },
];

const categoryOptions = [
  { value: 'todos', label: 'Todas categorias' },
  'Segurança', 'Privacidade', 'Acesso', 'Continuidade', 'Backup',
  'Incidentes', 'BYOD', 'Senhas', 'Mudanças', 'Outro',
];

export default function Politicas() {
  const navigate = useNavigate();
  const { policies, isLoading, deletePolicy } = usePolicies();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = policies.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || p.status === statusFilter;
    const matchCategory = categoryFilter === 'todos' || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-space">Central de Políticas</h1>
          <p className="text-muted-foreground mt-1">Repositório unificado de políticas corporativas</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('/policies/central/nova')}>
          <Plus className="w-4 h-4 mr-2" /> Nova Política
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar políticas..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
                {typeof o === 'string' ? o : o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categoryOptions.map((o) => (
              <SelectItem key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
                {typeof o === 'string' ? o : o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-16 h-16 text-emerald-500/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {policies.length === 0 ? 'Nenhuma política criada' : 'Nenhuma política encontrada'}
            </h3>
            <p className="text-muted-foreground max-w-md mb-4">
              {policies.length === 0
                ? 'Comece criando sua primeira política ou use um modelo da biblioteca de templates.'
                : 'Tente ajustar os filtros de busca.'}
            </p>
            {policies.length === 0 && (
              <Button variant="outline" onClick={() => navigate('/policies/central/nova')}>
                <Plus className="w-4 h-4 mr-2" /> Criar Política
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onEdit={(id) => navigate(`/policies/central/${id}`)}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir política?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. A política e todo seu histórico serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deleteId) { deletePolicy.mutate(deleteId); setDeleteId(null); } }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
