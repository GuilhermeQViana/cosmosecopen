import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useVendorSLAs,
  useCreateVendorSLA,
  useUpdateVendorSLA,
  useDeleteVendorSLA,
  SLA_UNITS,
  SLA_PERIODS,
  SLA_COMPLIANCE,
  VendorSLA,
} from '@/hooks/useVendorSLAs';
import { Vendor } from '@/hooks/useVendors';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Gauge,
  Trash2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface VendorSLATrackerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

export function VendorSLATracker({ open, onOpenChange, vendor }: VendorSLATrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const { data: slas, isLoading } = useVendorSLAs(vendor?.id);
  const createSLA = useCreateVendorSLA();
  const updateSLA = useUpdateVendorSLA();
  const deleteSLA = useDeleteVendorSLA();
  const { toast } = useToast();

  const [form, setForm] = useState({
    metric_name: '',
    target_value: '',
    unit: 'percentual',
    period: 'mensal',
  });

  if (!vendor) return null;

  const resetForm = () => {
    setForm({ metric_name: '', target_value: '', unit: 'percentual', period: 'mensal' });
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.metric_name || !form.target_value) return;
    try {
      await createSLA.mutateAsync({
        vendor_id: vendor.id,
        contract_id: null,
        metric_name: form.metric_name,
        target_value: parseFloat(form.target_value),
        unit: form.unit,
        current_value: null,
        compliance_status: 'conforme',
        period: form.period,
        measured_at: null,
        notes: null,
      });
      toast({ title: 'SLA criado com sucesso' });
      resetForm();
    } catch {
      toast({ title: 'Erro ao criar SLA', variant: 'destructive' });
    }
  };

  const handleUpdateValue = async (sla: VendorSLA, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    let compliance_status = 'conforme';
    if (sla.unit === 'percentual') {
      if (numValue < sla.target_value * 0.95) compliance_status = 'violado';
      else if (numValue < sla.target_value) compliance_status = 'atencao';
    } else {
      // For time-based metrics (lower is better)
      if (numValue > sla.target_value * 1.2) compliance_status = 'violado';
      else if (numValue > sla.target_value) compliance_status = 'atencao';
    }

    try {
      await updateSLA.mutateAsync({
        id: sla.id,
        current_value: numValue,
        compliance_status,
        measured_at: new Date().toISOString(),
      });
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleDelete = async (sla: VendorSLA) => {
    try {
      await deleteSLA.mutateAsync({ id: sla.id, vendorId: vendor.id });
      toast({ title: 'SLA excluído' });
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const getComplianceColor = (status: string) => {
    const colors: Record<string, string> = {
      conforme: 'bg-green-500/10 text-green-500 border-green-500/20',
      atencao: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      violado: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[status] || '';
  };

  const getProgressValue = (sla: VendorSLA) => {
    if (sla.current_value === null) return 0;
    if (sla.unit === 'percentual') return Math.min(100, (sla.current_value / sla.target_value) * 100);
    // For time-based, invert (lower is better)
    return Math.max(0, Math.min(100, (1 - (sla.current_value - sla.target_value) / sla.target_value) * 100));
  };

  const conformeCount = slas?.filter((s) => s.compliance_status === 'conforme').length || 0;
  const totalCount = slas?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-space flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            SLAs — {vendor.name}
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-2">{conformeCount}/{totalCount} conforme</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-4">
            {!showForm && (
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo SLA
              </Button>
            )}

            {showForm && (
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>Nome da Métrica *</Label>
                    <Input value={form.metric_name} onChange={(e) => setForm({ ...form, metric_name: e.target.value })} placeholder="Ex: Disponibilidade, Tempo de Resposta" />
                  </div>
                  <div>
                    <Label>Meta</Label>
                    <Input type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} placeholder="99.9" />
                  </div>
                  <div>
                    <Label>Unidade</Label>
                    <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SLA_UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Período</Label>
                    <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SLA_PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={createSLA.isPending || !form.metric_name || !form.target_value} size="sm">Salvar</Button>
                  <Button variant="ghost" onClick={resetForm} size="sm">Cancelar</Button>
                </div>
              </div>
            )}

            <Separator />

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : !slas || slas.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhum SLA cadastrado</p>
            ) : (
              <div className="space-y-3">
                {slas.map((sla) => (
                  <div key={sla.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{sla.metric_name}</span>
                        <Badge variant="outline" className={getComplianceColor(sla.compliance_status)}>
                          {SLA_COMPLIANCE.find((c) => c.value === sla.compliance_status)?.label}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(sla)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Atual: {sla.current_value !== null ? `${sla.current_value} ${SLA_UNITS.find((u) => u.value === sla.unit)?.label}` : '—'}</span>
                          <span>Meta: {sla.target_value} {SLA_UNITS.find((u) => u.value === sla.unit)?.label}</span>
                        </div>
                        <Progress value={getProgressValue(sla)} className="h-2" />
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Valor"
                          className="h-8 text-xs"
                          onBlur={(e) => e.target.value && handleUpdateValue(sla, e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{SLA_PERIODS.find((p) => p.value === sla.period)?.label}</span>
                      {sla.current_value !== null && sla.target_value && (
                        <span className="flex items-center gap-1">
                          {sla.compliance_status === 'conforme'
                            ? <><TrendingUp className="h-3 w-3 text-green-500" /> Dentro da meta</>
                            : <><TrendingDown className="h-3 w-3 text-red-500" /> Abaixo da meta</>
                          }
                        </span>
                      )}
                    </div>
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
