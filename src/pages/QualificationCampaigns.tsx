import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQualificationCampaigns, useUpdateQualificationCampaign } from '@/hooks/useQualificationCampaigns';
import { useCalculateQualificationScore, useQualificationResponses } from '@/hooks/useQualificationResponses';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { AnimatedItem, StaggeredGrid } from '@/components/ui/staggered-list';
import { SkeletonCard } from '@/components/ui/skeleton';
import { QualificationComparison } from '@/components/fornecedores/QualificationComparison';
import { StartQualificationCampaignDialog } from '@/components/fornecedores/StartQualificationCampaignDialog';
import { supabase } from '@/integrations/supabase/client';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ClipboardList, Search, Clock, CheckCircle2, XCircle, AlertTriangle,
  BarChart3, Eye, RotateCcw, ThumbsUp, ThumbsDown, Copy, ExternalLink,
  Send, FileText, Calculator, Filter, Users, Download, Upload
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock },
  em_preenchimento: { label: 'Em Preenchimento', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: FileText },
  respondido: { label: 'Respondido', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: Send },
  em_analise: { label: 'Em Análise', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: BarChart3 },
  aprovado: { label: 'Aprovado', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2 },
  reprovado: { label: 'Reprovado', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
  devolvido: { label: 'Devolvido', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: RotateCcw },
};

const RISK_CONFIG: Record<string, { label: string; color: string }> = {
  baixo: { label: 'Baixo Risco', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  medio: { label: 'Médio Risco', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  alto: { label: 'Alto Risco', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export default function QualificationCampaigns() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [reviewCampaign, setReviewCampaign] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'return' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [detailCampaignId, setDetailCampaignId] = useState<string | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [importCampaignId, setImportCampaignId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: campaigns, isLoading } = useQualificationCampaigns(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );
  const updateCampaign = useUpdateQualificationCampaign();
  const calculateScore = useCalculateQualificationScore();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: detailResponses, isLoading: isLoadingResponses } = useQualificationResponses(detailCampaignId || undefined);
  const detailCampaign = campaigns?.find(c => c.id === detailCampaignId);

  const filtered = campaigns?.filter(c => {
    if (!search) return true;
    const vendorName = c.vendors?.name?.toLowerCase() || '';
    const templateName = c.qualification_templates?.name?.toLowerCase() || '';
    return vendorName.includes(search.toLowerCase()) || templateName.includes(search.toLowerCase());
  }) || [];

  // Stats
  const stats = {
    total: campaigns?.length || 0,
    pendentes: campaigns?.filter(c => ['pendente', 'em_preenchimento'].includes(c.status)).length || 0,
    respondidas: campaigns?.filter(c => c.status === 'respondido').length || 0,
    emAnalise: campaigns?.filter(c => c.status === 'em_analise').length || 0,
    finalizadas: campaigns?.filter(c => ['aprovado', 'reprovado'].includes(c.status)).length || 0,
  };

  const handleCalculateScore = async (campaignId: string) => {
    try {
      const result = await calculateScore.mutateAsync(campaignId);
      toast({
        title: 'Score calculado',
        description: `Score: ${result.score}% | Classificação: ${RISK_CONFIG[result.classification]?.label || result.classification}${result.koTriggered ? ' | KO acionado!' : ''}`,
      });
    } catch {
      toast({ title: 'Erro ao calcular score', variant: 'destructive' });
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewCampaign || !reviewAction) return;
    try {
      const updates: any = { id: reviewCampaign.id, reviewer_notes: reviewNotes };
      if (reviewAction === 'approve') {
        updates.status = 'aprovado';
        updates.approved_by = user!.id;
        updates.approved_at = new Date().toISOString();
      } else if (reviewAction === 'reject') {
        updates.status = 'reprovado';
        updates.approved_by = user!.id;
        updates.approved_at = new Date().toISOString();
      } else if (reviewAction === 'return') {
        updates.status = 'devolvido';
      }
      await updateCampaign.mutateAsync(updates);
      toast({ title: reviewAction === 'approve' ? 'Campanha aprovada' : reviewAction === 'reject' ? 'Campanha reprovada' : 'Campanha devolvida ao fornecedor' });
      setReviewCampaign(null);
      setReviewAction(null);
      setReviewNotes('');
    } catch {
      toast({ title: 'Erro ao atualizar campanha', variant: 'destructive' });
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/qualification/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado!' });
  };

  const openPortal = (token: string) => {
    window.open(`/qualification/${token}`, '_blank');
  };

  const handleExportCSV = async (campaignId: string) => {
    setExportingId(campaignId);
    try {
      const { data, error } = await supabase.functions.invoke('export-qualification-template', {
        body: { campaignId },
      });
      if (error) throw error;
      // data is the CSV string
      const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qualificacao-${campaignId.slice(0, 8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'CSV exportado com sucesso!' });
    } catch {
      toast({ title: 'Erro ao exportar CSV', variant: 'destructive' });
    } finally {
      setExportingId(null);
    }
  };

  const handleImportCSV = (campaignId: string) => {
    setImportCampaignId(campaignId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importCampaignId) return;
    setImporting(true);
    try {
      const csvContent = await file.text();
      const { data, error } = await supabase.functions.invoke('import-qualification-responses', {
        body: { campaignId: importCampaignId, csvContent },
      });
      if (error) throw error;
      const result = data as any;
      if (result.success) {
        toast({
          title: `${result.imported} respostas importadas`,
          description: result.errors?.length ? `${result.errors.length} avisos encontrados` : undefined,
        });
      } else {
        toast({
          title: 'Erro na importação',
          description: result.errors?.slice(0, 3).join('\n'),
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Erro ao importar CSV', variant: 'destructive' });
    } finally {
      setImporting(false);
      setImportCampaignId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <AnimatedItem animation="fade-up" delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 font-space">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              Campanhas de Qualificação
            </h1>
            <p className="text-muted-foreground mt-1">Acompanhe e gerencie as campanhas enviadas aos fornecedores</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setComparisonOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            Comparar
          </Button>
        </div>
      </AnimatedItem>

      {/* Stats */}
      <AnimatedItem animation="fade-up" delay={50}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: ClipboardList, color: 'text-primary' },
            { label: 'Pendentes', value: stats.pendentes, icon: Clock, color: 'text-yellow-500' },
            { label: 'Respondidas', value: stats.respondidas, icon: Send, color: 'text-purple-500' },
            { label: 'Em Análise', value: stats.emAnalise, icon: BarChart3, color: 'text-orange-500' },
            { label: 'Finalizadas', value: stats.finalizadas, icon: CheckCircle2, color: 'text-green-500' },
          ].map(s => (
            <Card key={s.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted/50 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-space">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedItem>

      {/* Filters */}
      <AnimatedItem animation="fade-up" delay={100}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar fornecedor ou template..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-[250px] bg-background/50 focus:bg-background"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-background/50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AnimatedItem>

      {/* Campaign Cards */}
      <AnimatedItem animation="fade-up" delay={150}>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2 font-space">Nenhuma campanha encontrada</h3>
              <p className="text-muted-foreground">
                {search || statusFilter !== 'all' ? 'Tente ajustar os filtros' : 'Inicie uma campanha na página de Fornecedores'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(campaign => {
              const sc = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.pendente;
              const StatusIcon = sc.icon;
              const expired = isPast(new Date(campaign.expires_at));
              const rc = campaign.risk_classification ? RISK_CONFIG[campaign.risk_classification] : null;

              return (
                <Card key={campaign.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-space truncate">{campaign.vendors?.name || 'Fornecedor'}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {campaign.qualification_templates?.name || 'Template'}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-xs shrink-0 ${sc.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {sc.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Score & Risk */}
                    {campaign.score !== null && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted/50 rounded-full h-2.5">
                          <div
                            className={`h-full rounded-full transition-all ${
                              campaign.score >= 81 ? 'bg-green-500' : campaign.score >= 51 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${campaign.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold font-space">{campaign.score}%</span>
                        {rc && (
                          <Badge variant="outline" className={`text-[10px] ${rc.color}`}>{rc.label}</Badge>
                        )}
                      </div>
                    )}

                    {campaign.ko_triggered && (
                      <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 rounded-md px-2 py-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="font-medium">Critério KO acionado</span>
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Criada {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true, locale: ptBR })}</span>
                      <span className={expired && !['aprovado', 'reprovado'].includes(campaign.status) ? 'text-red-500' : ''}>
                        {expired ? 'Expirada' : `Expira ${format(new Date(campaign.expires_at), 'dd/MM/yy')}`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(campaign.token)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copiar link</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailCampaignId(campaign.id)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver respostas</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExportCSV(campaign.id)} disabled={exportingId === campaign.id}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Exportar CSV</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleImportCSV(campaign.id)} disabled={importing}>
                            <Upload className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Importar respostas CSV</TooltipContent>
                      </Tooltip>

                      {campaign.status === 'respondido' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto text-xs h-8"
                          onClick={() => handleCalculateScore(campaign.id)}
                          disabled={calculateScore.isPending}
                        >
                          <Calculator className="h-3.5 w-3.5 mr-1" />
                          Calcular Score
                        </Button>
                      )}

                      {campaign.status === 'em_analise' && (
                        <div className="flex gap-1 ml-auto">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-green-500 hover:bg-green-500/10 hover:border-green-500/30"
                                onClick={() => { setReviewCampaign(campaign); setReviewAction('approve'); }}
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Aprovar</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30"
                                onClick={() => { setReviewCampaign(campaign); setReviewAction('return'); }}
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Devolver</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:border-red-500/30"
                                onClick={() => { setReviewCampaign(campaign); setReviewAction('reject'); }}
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reprovar</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </AnimatedItem>

      {/* Review Dialog */}
      <Dialog open={!!reviewAction && !!reviewCampaign} onOpenChange={open => { if (!open) { setReviewAction(null); setReviewCampaign(null); setReviewNotes(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-space">
              {reviewAction === 'approve' ? 'Aprovar Qualificação' : reviewAction === 'reject' ? 'Reprovar Qualificação' : 'Devolver ao Fornecedor'}
            </DialogTitle>
            <DialogDescription>
              {reviewCampaign?.vendors?.name} — Score: {reviewCampaign?.score ?? 'N/A'}%
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewCampaign?.ko_triggered && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-md px-3 py-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Critério KO foi acionado nesta campanha</span>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Observações {reviewAction === 'reject' || reviewAction === 'return' ? '(obrigatório)' : '(opcional)'}
              </label>
              <Textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder={
                  reviewAction === 'return'
                    ? 'Descreva o que o fornecedor precisa corrigir...'
                    : 'Adicione observações sobre a decisão...'
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewAction(null); setReviewCampaign(null); }}>Cancelar</Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={updateCampaign.isPending || ((reviewAction === 'reject' || reviewAction === 'return') && !reviewNotes.trim())}
              className={
                reviewAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : reviewAction === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
              }
            >
              {reviewAction === 'approve' ? 'Confirmar Aprovação' : reviewAction === 'reject' ? 'Confirmar Reprovação' : 'Devolver ao Fornecedor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Detail Dialog */}
      <Dialog open={!!detailCampaignId} onOpenChange={open => { if (!open) setDetailCampaignId(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-space flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Respostas — {detailCampaign?.vendors?.name || 'Fornecedor'}
            </DialogTitle>
            <DialogDescription>
              {detailCampaign?.qualification_templates?.name} • Score: {detailCampaign?.score ?? '—'}%
              {detailCampaign?.ko_triggered && ' • KO acionado'}
            </DialogDescription>
          </DialogHeader>

          {isLoadingResponses ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : !detailResponses?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Nenhuma resposta registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {detailResponses
                .sort((a, b) => (a.qualification_questions?.order_index ?? 0) - (b.qualification_questions?.order_index ?? 0))
                .map((resp, idx) => {
                  const q = resp.qualification_questions;
                  if (!q) return null;
                  const maxWeight = q.weight;
                  const scored = resp.score_awarded ?? 0;
                  const pct = maxWeight > 0 ? Math.round((scored / maxWeight) * 100) : 0;
                  const isKo = q.is_ko && q.ko_value;
                  const answerValue = resp.answer_text || (resp.answer_option as any)?.label || (resp.answer_option as any)?.value || '';
                  const koMatch = isKo && answerValue?.toString().toLowerCase() === q.ko_value?.toLowerCase();

                  return (
                    <Card key={resp.id} className={`border-border/50 ${koMatch ? 'border-red-500/40 bg-red-500/5' : 'bg-card/50'}`}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-mono">Q{idx + 1}</span>
                              {q.label}
                              {isKo && (
                                <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">KO</Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Tipo: {q.type === 'multiple_choice' ? 'Múltipla escolha' : q.type === 'text' ? 'Texto' : q.type === 'upload' ? 'Anexo' : q.type === 'date' ? 'Data' : q.type === 'currency' ? 'Moeda' : q.type === 'number' ? 'Número' : q.type} • Peso: {q.weight}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-sm font-bold font-space ${pct >= 80 ? 'text-green-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {scored.toFixed(1)}/{maxWeight}
                            </span>
                            <div className="w-16 bg-muted/50 rounded-full h-1.5 mt-1">
                              <div
                                className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/30 rounded-md px-3 py-2">
                          {resp.answer_file_url ? (
                            <a href={resp.answer_file_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" /> Ver anexo
                            </a>
                          ) : answerValue ? (
                            <p className="text-sm">{answerValue}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Sem resposta</p>
                          )}
                        </div>

                        {koMatch && (
                          <div className="flex items-center gap-1.5 text-red-500 text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Resposta acionou critério eliminatório (KO)</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <QualificationComparison open={comparisonOpen} onOpenChange={setComparisonOpen} />

      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileSelected}
      />
    </div>
  );
}
