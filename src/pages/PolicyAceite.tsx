import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Users, Plus, Loader2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAcceptanceCampaigns } from '@/hooks/useAcceptanceCampaigns';
import { usePolicies } from '@/hooks/usePolicies';

export default function PolicyAceite() {
  const { campaigns, isLoading, createCampaign, closeCampaign } = useAcceptanceCampaigns();
  const { policies } = usePolicies();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ policy_id: '', title: '', description: '', deadline: '' });

  const publishedPolicies = policies.filter(p => p.status === 'publicada');

  const handleCreate = async () => {
    if (!form.policy_id || !form.title.trim()) return;
    await createCampaign.mutateAsync({
      policy_id: form.policy_id,
      title: form.title,
      description: form.description || undefined,
      deadline: form.deadline || undefined,
    });
    setForm({ policy_id: '', title: '', description: '', deadline: '' });
    setOpen(false);
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'ativa');
  const closedCampaigns = campaigns.filter(c => c.status === 'encerrada');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-space">Campanhas de Aceite</h1>
          <p className="text-muted-foreground mt-1">Gerencie campanhas de aceite de políticas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Campanha de Aceite</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Política Vinculada</Label>
                <Select value={form.policy_id} onValueChange={(v) => setForm(f => ({ ...f, policy_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione uma política publicada" /></SelectTrigger>
                  <SelectContent>
                    {publishedPolicies.length === 0 ? (
                      <SelectItem value="none" disabled>Nenhuma política publicada</SelectItem>
                    ) : publishedPolicies.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Título da Campanha</Label>
                <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Aceite da Política de Segurança 2026" className="mt-1" />
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Instruções adicionais..." rows={2} className="mt-1" />
              </div>
              <div>
                <Label>Prazo (opcional)</Label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))} className="mt-1" />
              </div>
              <Button onClick={handleCreate} disabled={createCampaign.isPending || !form.policy_id || !form.title.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700">
                {createCampaign.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Criar Campanha
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : campaigns.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-16 h-16 text-emerald-500/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha criada</h3>
            <p className="text-muted-foreground max-w-md">
              Crie campanhas de aceite vinculadas a políticas publicadas para rastrear a aderência dos colaboradores.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeCampaigns.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" /> Ativas ({activeCampaigns.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCampaigns.map(c => <CampaignCard key={c.id} campaign={c} onClose={() => closeCampaign.mutate(c.id)} />)}
              </div>
            </div>
          )}
          {closedCampaigns.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                <XCircle className="w-5 h-5" /> Encerradas ({closedCampaigns.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {closedCampaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CampaignCard({ campaign, onClose }: { campaign: any; onClose?: () => void }) {
  const progress = campaign.total_users > 0 ? Math.round((campaign.accepted_count / campaign.total_users) * 100) : 0;

  return (
    <Card className="hover:border-emerald-500/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{campaign.title}</CardTitle>
          <Badge variant={campaign.status === 'ativa' ? 'default' : 'secondary'}>
            {campaign.status === 'ativa' ? 'Ativa' : 'Encerrada'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-muted-foreground">Política: {campaign.policy_title}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span>Aderência</span>
            <span className="font-medium">{campaign.accepted_count}/{campaign.total_users} ({progress}%)</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {campaign.deadline && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Prazo: {format(new Date(campaign.deadline), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        )}
        {onClose && campaign.status === 'ativa' && (
          <Button variant="outline" size="sm" onClick={onClose} className="w-full mt-2">
            Encerrar Campanha
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
