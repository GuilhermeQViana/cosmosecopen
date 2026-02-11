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
import {
  Plus,
  AlertTriangle,
  Calendar,
  Trash2,
  CheckCircle,
} from 'lucide-react';

interface VendorIncidentLogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

export function VendorIncidentLog({ open, onOpenChange, vendor }: VendorIncidentLogProps) {
  const [showForm, setShowForm] = useState(false);
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
                {incidents.map((incident) => (
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
                        {(incident.status === 'aberto' || incident.status === 'em_investigacao') && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleResolve(incident)}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />Resolver
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
