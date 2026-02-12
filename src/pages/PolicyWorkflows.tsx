import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { GitBranch, Plus, Trash2, Loader2, Users, ShieldCheck } from 'lucide-react';
import { usePolicyWorkflows, type PolicyWorkflow } from '@/hooks/usePolicyWorkflows';
import { useTeamMembers } from '@/hooks/useTeamMembers';

export default function PolicyWorkflows() {
  const { workflows, isLoading, createWorkflow, deleteWorkflow } = usePolicyWorkflows();
  const { data: members } = useTeamMembers();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    approval_levels: 1,
    level1_role: 'admin',
    level1_approver_id: null as string | null,
    level2_role: null as string | null,
    level2_approver_id: null as string | null,
  });

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    await createWorkflow.mutateAsync(form);
    setForm({ name: '', approval_levels: 1, level1_role: 'admin', level1_approver_id: null, level2_role: null, level2_approver_id: null });
    setOpen(false);
  };

  const admins = members?.filter(m => m.role === 'admin') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-space">Fluxos de Aprovação</h1>
          <p className="text-muted-foreground mt-1">Configure workflows de aprovação para suas políticas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Novo Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Workflow de Aprovação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do Workflow</Label>
                <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Aprovação padrão" className="mt-1" />
              </div>
              <div>
                <Label>Níveis de Aprovação</Label>
                <Select value={String(form.approval_levels)} onValueChange={(v) => setForm(f => ({ ...f, approval_levels: Number(v) }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Nível</SelectItem>
                    <SelectItem value="2">2 Níveis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Aprovador Nível 1 (opcional)</Label>
                <Select value={form.level1_approver_id || 'auto'} onValueChange={(v) => setForm(f => ({ ...f, level1_approver_id: v === 'auto' ? null : v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Qualquer admin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Qualquer Admin</SelectItem>
                    {admins.map(m => (
                      <SelectItem key={m.user_id} value={m.user_id}>{m.profile?.full_name || 'Sem nome'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.approval_levels === 2 && (
                <div>
                  <Label>Aprovador Nível 2 (opcional)</Label>
                  <Select value={form.level2_approver_id || 'auto'} onValueChange={(v) => setForm(f => ({ ...f, level2_approver_id: v === 'auto' ? null : v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Qualquer admin" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Qualquer Admin</SelectItem>
                      {admins.map(m => (
                        <SelectItem key={m.user_id} value={m.user_id}>{m.profile?.full_name || 'Sem nome'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleCreate} disabled={createWorkflow.isPending || !form.name.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {createWorkflow.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Criar Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : workflows.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GitBranch className="w-16 h-16 text-emerald-500/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum workflow configurado</h3>
            <p className="text-muted-foreground max-w-md">
              Configure fluxos de aprovação com 1 ou 2 níveis para controlar o ciclo de vida das políticas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workflows.map((wf) => (
            <Card key={wf.id} className="hover:border-emerald-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-emerald-500" />
                    <CardTitle className="text-base">{wf.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(wf.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{wf.approval_levels} {wf.approval_levels === 1 ? 'nível' : 'níveis'}</Badge>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Nível 1: {wf.level1_role || 'Admin'}</span>
                  </div>
                  {wf.approval_levels === 2 && (
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Nível 2: {wf.level2_role || 'Admin'}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir workflow?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação é irreversível.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={() => { if (deleteId) { deleteWorkflow.mutate(deleteId); setDeleteId(null); } }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
