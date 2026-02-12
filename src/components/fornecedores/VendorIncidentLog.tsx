import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useVendorIncidents,
  useCreateVendorIncident,
  useUpdateVendorIncident,
  useDeleteVendorIncident,
  INCIDENT_SEVERITIES,
  INCIDENT_CATEGORIES,
  INCIDENT_STATUS,
  VendorIncident,
} from '@/hooks/useVendorIncidents';
import { Vendor } from '@/hooks/useVendors';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  AlertTriangle,
  Calendar,
  Trash2,
  CheckCircle,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AIAnalysis {
  root_cause: string;
  corrective_actions: string[];
  itil_classification: string;
  risk_assessment?: string;
}

interface VendorIncidentLogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

export function VendorIncidentLog({ open, onOpenChange, vendor }: VendorIncidentLogProps) {
  const [showForm, setShowForm] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, AIAnalysis>>({});
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  const { data: incidents, isLoading } = useVendorIncidents(vendor?.id);
  const createIncident = useCreateVendorIncident();
  const updateIncident = useUpdateVendorIncident();
  const deleteIncident = useDeleteVendorIncident();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: '',
    incident_date: new Date().toISOString().split('T')[0],
    severity: 'media',
    category: 'outro',
    description: '',
    impact_description: '',
  });

  if (!vendor) return null;

  const resetForm = () => {
    setForm({ title: '', incident_date: new Date().toISOString().split('T')[0], severity: 'media', category: 'outro', description: '', impact_description: '' });
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.title) return;
    try {
      await createIncident.mutateAsync({
        vendor_id: vendor.id,
        title: form.title,
        incident_date: form.incident_date,
        reported_date: new Date().toISOString().split('T')[0],
        resolved_date: null,
        severity: form.severity,
        category: form.category,
        description: form.description || null,
        impact_description: form.impact_description || null,
        root_cause: null,
        corrective_actions: null,
        status: 'aberto',
      });
      toast({ title: 'Incidente registrado' });
      resetForm();
    } catch {
      toast({ title: 'Erro ao registrar incidente', variant: 'destructive' });
    }
  };

  const handleResolve = async (incident: VendorIncident) => {
    try {
      await updateIncident.mutateAsync({
        id: incident.id,
        status: 'resolvido',
        resolved_date: new Date().toISOString().split('T')[0],
      });
      toast({ title: 'Incidente marcado como resolvido' });
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const handleDelete = async (incident: VendorIncident) => {
    try {
      await deleteIncident.mutateAsync({ id: incident.id, vendorId: vendor.id });
      toast({ title: 'Incidente excluído' });
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const handleAnalyzeWithAI = async (incident: VendorIncident) => {
    setAnalyzingId(incident.id);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-vendor-incident', {
        body: {
          title: incident.title,
          description: incident.description,
          impact_description: incident.impact_description,
          severity: incident.severity,
          category: incident.category,
          vendor_name: vendor.name,
          vendor_category: vendor.category,
        },
      });

      if (error) throw error;
      setAnalyses((prev) => ({ ...prev, [incident.id]: data }));
      setExpandedAnalysis(incident.id);
      toast({ title: 'Análise concluída' });
    } catch (err: any) {
      const msg = err?.message || 'Erro ao analisar incidente';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleApplyAnalysis = async (incident: VendorIncident) => {
    const analysis = analyses[incident.id];
    if (!analysis) return;
    try {
      await updateIncident.mutateAsync({
        id: incident.id,
        root_cause: analysis.root_cause,
        corrective_actions: analysis.corrective_actions.join('\n• '),
      });
      toast({ title: 'Causa raiz e ações corretivas aplicadas' });
    } catch {
      toast({ title: 'Erro ao aplicar análise', variant: 'destructive' });
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      baixa: 'bg-green-500/10 text-green-500 border-green-500/20',
      media: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      alta: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      critica: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[severity] || '';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'resolvido' || status === 'encerrado') return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
    return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />;
  };

  const openCount = incidents?.filter((i) => i.status === 'aberto' || i.status === 'em_investigacao').length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-space flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Incidentes — {vendor.name}
            {openCount > 0 && (
              <Badge variant="destructive" className="ml-2">{openCount} aberto{openCount > 1 ? 's' : ''}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-4">
            {!showForm && (
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Incidente
              </Button>
            )}

            {showForm && (
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                <div>
                  <Label>Título *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Descrição breve do incidente" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={form.incident_date} onChange={(e) => setForm({ ...form, incident_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Severidade</Label>
                    <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INCIDENT_SEVERITIES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INCIDENT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
                </div>
                <div>
                  <Label>Impacto</Label>
                  <Textarea value={form.impact_description} onChange={(e) => setForm({ ...form, impact_description: e.target.value })} rows={2} placeholder="Descreva o impacto do incidente" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={createIncident.isPending || !form.title} size="sm">Registrar</Button>
                  <Button variant="ghost" onClick={resetForm} size="sm">Cancelar</Button>
                </div>
              </div>
            )}

            <Separator />

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : !incidents || incidents.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhum incidente registrado</p>
            ) : (
              <div className="space-y-3">
                {incidents.map((incident) => {
                  const analysis = analyses[incident.id];
                  const isAnalyzing = analyzingId === incident.id;
                  const isOpen = incident.status === 'aberto' || incident.status === 'em_investigacao';
                  const isExpanded = expandedAnalysis === incident.id;

                  return (
                    <div key={incident.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(incident.status)}
                          <span className="font-medium text-sm">{incident.title}</span>
                          <Badge variant="outline" className={getSeverityColor(incident.severity)}>
                            {INCIDENT_SEVERITIES.find((s) => s.value === incident.severity)?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {isOpen && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleAnalyzeWithAI(incident)}
                                disabled={isAnalyzing}
                              >
                                {isAnalyzing ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                                )}
                                {isAnalyzing ? 'Analisando...' : 'Causa Raiz IA'}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleResolve(incident)}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />Resolver
                              </Button>
                            </>
                          )}
                          {analysis && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setExpandedAnalysis(isExpanded ? null : incident.id)}
                            >
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(incident)}>
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(incident.incident_date), 'dd/MM/yyyy')}
                        </span>
                        <span>{INCIDENT_CATEGORIES.find((c) => c.value === incident.category)?.label}</span>
                        <span className="capitalize">{INCIDENT_STATUS.find((s) => s.value === incident.status)?.label}</span>
                      </div>

                      {incident.description && <p className="text-xs text-muted-foreground">{incident.description}</p>}

                      {/* AI Analysis Card */}
                      {analysis && isExpanded && (
                        <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Análise IA</span>
                            <Badge variant="outline" className="text-xs">{analysis.itil_classification}</Badge>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Causa Raiz Provável:</p>
                            <p className="text-sm">{analysis.root_cause}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Ações Corretivas Sugeridas:</p>
                            <ul className="text-sm space-y-1">
                              {analysis.corrective_actions.map((action, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {analysis.risk_assessment && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Avaliação de Risco:</p>
                              <p className="text-sm">{analysis.risk_assessment}</p>
                            </div>
                          )}
                          <Button size="sm" variant="outline" className="w-full" onClick={() => handleApplyAnalysis(incident)}>
                            <CheckCircle className="h-3.5 w-3.5 mr-2" />
                            Aplicar Causa Raiz e Ações Corretivas
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
