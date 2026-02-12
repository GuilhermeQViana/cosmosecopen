import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GitBranch, Plus, Trash2, Loader2, Pencil, Copy, Star, MoreVertical, Clock, CheckCircle2, XCircle, AlertTriangle, FileText, X } from 'lucide-react';
import { usePolicyWorkflows, type PolicyWorkflow, type PendingApprovalWithPolicy, type WorkflowApprover } from '@/hooks/usePolicyWorkflows';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { WorkflowStepsPreview } from '@/components/politicas/WorkflowStepsPreview';
import { ApprovalActionDialog } from '@/components/politicas/ApprovalActionDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SUGGESTED_DEPARTMENTS = ['TI', 'Jurídico', 'Compliance', 'RH', 'Financeiro', 'Diretoria', 'Operações', 'Segurança'];

type WorkflowForm = {
  name: string;
  description: string | null;
  approvers: WorkflowApprover[];
  is_default: boolean;
  sla_days: number | null;
  notify_approver: boolean;
};

const emptyForm: WorkflowForm = {
  name: '',
  description: null,
  approvers: [{ level: 1, approver_id: null, department: '' }],
  is_default: false,
  sla_days: null,
  notify_approver: true,
};

export default function PolicyWorkflows() {
  const { workflows, isLoading, pendingApprovals, approvalHistory, createWorkflow, updateWorkflow, deleteWorkflow, duplicateWorkflow, setDefaultWorkflow, handleApproval } = usePolicyWorkflows();
  const { data: members } = useTeamMembers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [approvalAction, setApprovalAction] = useState<{ approval: PendingApprovalWithPolicy; action: 'aprovada' | 'rejeitada' } | null>(null);
  const [historyFilter, setHistoryFilter] = useState<string>('todas');

  const admins = members?.filter(m => m.role === 'admin') || [];
  const memberNames = useMemo(() => {
    const map: Record<string, string> = {};
    members?.forEach(m => { if (m.user_id && m.profile?.full_name) map[m.user_id] = m.profile.full_name; });
    return map;
  }, [members]);

  // Metrics
  const completedThisMonth = useMemo(() => {
    const now = new Date();
    return approvalHistory.filter(a => {
      if (!a.approved_at) return false;
      const d = new Date(a.approved_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [approvalHistory]);

  const avgDays = useMemo(() => {
    const approved = approvalHistory.filter(a => a.status === 'aprovada' && a.approved_at);
    if (!approved.length) return null;
    const total = approved.reduce((sum, a) => {
      const diff = new Date(a.approved_at!).getTime() - new Date(a.created_at).getTime();
      return sum + diff / (1000 * 60 * 60 * 24);
    }, 0);
    return (total / approved.length).toFixed(1);
  }, [approvalHistory]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'todas') return approvalHistory;
    return approvalHistory.filter(a => a.status === historyFilter);
  }, [approvalHistory, historyFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (wf: PolicyWorkflow) => {
    setEditingId(wf.id);
    setForm({
      name: wf.name,
      description: wf.description,
      approvers: wf.approvers.length > 0 ? wf.approvers : [{ level: 1, approver_id: wf.level1_approver_id, department: '' }],
      is_default: wf.is_default,
      sla_days: wf.sla_days,
      notify_approver: wf.notify_approver,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      approval_levels: form.approvers.length,
      level1_role: 'admin' as string | null,
      level1_approver_id: form.approvers[0]?.approver_id ?? null,
      level2_role: form.approvers.length >= 2 ? 'admin' : null,
      level2_approver_id: form.approvers[1]?.approver_id ?? null,
    };
    if (editingId) {
      await updateWorkflow.mutateAsync({ id: editingId, ...payload });
    } else {
      await createWorkflow.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const isSaving = createWorkflow.isPending || updateWorkflow.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-space">Fluxos de Aprovação</h1>
          <p className="text-muted-foreground mt-1">Gerencie workflows e acompanhe aprovações de políticas</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Novo Workflow
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><GitBranch className="w-4 h-4 text-emerald-500" /></div>
              <div>
                <p className="text-2xl font-bold">{workflows.length}</p>
                <p className="text-xs text-muted-foreground">Workflows ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><AlertTriangle className="w-4 h-4 text-amber-500" /></div>
              <div>
                <p className="text-2xl font-bold">{pendingApprovals.length}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><CheckCircle2 className="w-4 h-4 text-blue-500" /></div>
              <div>
                <p className="text-2xl font-bold">{completedThisMonth}</p>
                <p className="text-xs text-muted-foreground">Concluídas (mês)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><Clock className="w-4 h-4 text-purple-500" /></div>
              <div>
                <p className="text-2xl font-bold">{avgDays ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Dias (média)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workflows">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="pendentes">
            Pendentes {pendingApprovals.length > 0 && <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5 py-0">{pendingApprovals.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* Tab: Workflows */}
        <TabsContent value="workflows">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          ) : workflows.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <GitBranch className="w-16 h-16 text-emerald-500/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum workflow configurado</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Configure fluxos de aprovação com 1 ou 2 níveis para controlar o ciclo de vida das políticas.
                </p>
                <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" /> Criar primeiro workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {workflows.map((wf) => (
                <Card key={wf.id} className="hover:border-emerald-500/40 transition-colors group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <GitBranch className="w-4 h-4 text-emerald-500 shrink-0" />
                        <CardTitle className="text-base truncate">{wf.name}</CardTitle>
                        {wf.is_default && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] shrink-0">Padrão</Badge>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(wf)}>
                            <Pencil className="w-3.5 h-3.5 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateWorkflow.mutate(wf)}>
                            <Copy className="w-3.5 h-3.5 mr-2" /> Duplicar
                          </DropdownMenuItem>
                          {!wf.is_default && (
                            <DropdownMenuItem onClick={() => setDefaultWorkflow.mutate(wf.id)}>
                              <Star className="w-3.5 h-3.5 mr-2" /> Definir como padrão
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(wf.id)}>
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {wf.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{wf.description}</p>}
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <WorkflowStepsPreview 
                      levels={wf.approval_levels} 
                      approvers={wf.approvers} 
                      compact 
                      memberNames={memberNames}
                    />
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{wf.approval_levels} {wf.approval_levels === 1 ? 'nível' : 'níveis'}</Badge>
                      {wf.sla_days && <Badge variant="outline" className="text-xs"><Clock className="w-3 h-3 mr-1" />SLA: {wf.sla_days}d</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground/60">
                      Criado em {format(new Date(wf.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Pendentes */}
        <TabsContent value="pendentes">
          {pendingApprovals.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/30 mb-3" />
                <h3 className="font-semibold">Nenhuma aprovação pendente</h3>
                <p className="text-sm text-muted-foreground">Todas as políticas estão em dia.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Política</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Enviada em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {a.policy_title}
                        </div>
                      </TableCell>
                      <TableCell>v{a.version_number}</TableCell>
                      <TableCell><Badge variant="outline">Nível {a.approval_level}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{format(new Date(a.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => setApprovalAction({ approval: a, action: 'aprovada' })}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aprovar
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setApprovalAction({ approval: a, action: 'rejeitada' })}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Rejeitar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="historico">
          <div className="flex items-center gap-2 mb-4">
            <Select value={historyFilter} onValueChange={setHistoryFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="aprovada">Aprovadas</SelectItem>
                <SelectItem value="rejeitada">Rejeitadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredHistory.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <h3 className="font-semibold">Nenhum registro encontrado</h3>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Política</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Comentários</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.policy_title}</TableCell>
                      <TableCell>
                        <Badge className={a.status === 'aprovada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-destructive/20 text-destructive'}>
                          {a.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}
                        </Badge>
                      </TableCell>
                      <TableCell>Nível {a.approval_level}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.approved_at ? format(new Date(a.approved_at), "dd/MM/yyyy", { locale: ptBR }) : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{a.comments || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Workflow' : 'Criar Workflow de Aprovação'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <Label>Nome do Workflow</Label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Aprovação padrão" className="mt-1" />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea value={form.description || ''} onChange={(e) => setForm(f => ({ ...f, description: e.target.value || null }))} placeholder="Descreva o propósito deste workflow..." className="mt-1" rows={2} />
            </div>
            <div>
              <Label>SLA (dias)</Label>
              <Input type="number" min={1} value={form.sla_days ?? ''} onChange={(e) => setForm(f => ({ ...f, sla_days: e.target.value ? Number(e.target.value) : null }))} placeholder="Ex: 5" className="mt-1" />
            </div>

            {/* Dynamic Approvers */}
            <div>
              <Label>Aprovadores</Label>
              <div className="space-y-3 mt-2">
                {form.approvers.map((approver, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Nível {idx + 1}</span>
                      {form.approvers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setForm(f => ({
                            ...f,
                            approvers: f.approvers.filter((_, i) => i !== idx).map((a, i) => ({ ...a, level: i + 1 })),
                          }))}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Aprovador</Label>
                      <Select
                        value={approver.approver_id || 'auto'}
                        onValueChange={(v) => setForm(f => ({
                          ...f,
                          approvers: f.approvers.map((a, i) => i === idx ? { ...a, approver_id: v === 'auto' ? null : v } : a),
                        }))}
                      >
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Qualquer admin" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Qualquer Admin</SelectItem>
                          {admins.map(m => (
                            <SelectItem key={m.user_id} value={m.user_id}>{m.profile?.full_name || 'Sem nome'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Área / Departamento</Label>
                      <Input
                        value={approver.department}
                        onChange={(e) => setForm(f => ({
                          ...f,
                          approvers: f.approvers.map((a, i) => i === idx ? { ...a, department: e.target.value } : a),
                        }))}
                        placeholder="Ex: Jurídico, TI, Compliance..."
                        list="dept-suggestions"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {form.approvers.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => setForm(f => ({
                    ...f,
                    approvers: [...f.approvers, { level: f.approvers.length + 1, approver_id: null, department: '' }],
                  }))}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar Aprovador
                </Button>
              )}
              <datalist id="dept-suggestions">
                {SUGGESTED_DEPARTMENTS.map(d => <option key={d} value={d} />)}
              </datalist>
            </div>
            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="text-sm font-medium">Workflow padrão</p>
                <p className="text-xs text-muted-foreground">Usar automaticamente para novas políticas</p>
              </div>
              <Switch checked={form.is_default} onCheckedChange={(v) => setForm(f => ({ ...f, is_default: v }))} />
            </div>
            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="text-sm font-medium">Notificar aprovador</p>
                <p className="text-xs text-muted-foreground">Enviar email quando houver pendência</p>
              </div>
              <Switch checked={form.notify_approver} onCheckedChange={(v) => setForm(f => ({ ...f, notify_approver: v }))} />
            </div>
            <Button onClick={handleSave} disabled={isSaving || !form.name.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingId ? 'Salvar Alterações' : 'Criar Workflow'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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

      {/* Approval Action Dialog */}
      {approvalAction && (
        <ApprovalActionDialog
          open={!!approvalAction}
          onOpenChange={() => setApprovalAction(null)}
          action={approvalAction.action}
          policyTitle={approvalAction.approval.policy_title}
          onConfirm={async (comments) => {
            await handleApproval.mutateAsync({
              approvalId: approvalAction.approval.id,
              status: approvalAction.action,
              comments,
            });
          }}
        />
      )}
    </div>
  );
}
