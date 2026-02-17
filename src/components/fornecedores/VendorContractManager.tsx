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
import { Switch } from '@/components/ui/switch';
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
  useVendorContracts,
  useCreateVendorContract,
  useDeleteVendorContract,
  CONTRACT_TYPES,
  CONTRACT_STATUS,
  BILLING_FREQUENCIES,
  VendorContract,
} from '@/hooks/useVendorContracts';
import { Vendor } from '@/hooks/useVendors';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  FileText,
  Calendar,
  DollarSign,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Upload,
  X,
  ExternalLink,
} from 'lucide-react';

interface VendorContractManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

export function VendorContractManager({ open, onOpenChange, vendor }: VendorContractManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const { data: contracts, isLoading } = useVendorContracts(vendor?.id);
  const createContract = useCreateVendorContract();
  const deleteContract = useDeleteVendorContract();
  const { organization } = useOrganization();
  const { toast } = useToast();

  const [contractFile, setContractFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    contract_number: '',
    contract_type: 'servico',
    start_date: '',
    end_date: '',
    renewal_date: '',
    value: '',
    currency: 'BRL',
    billing_frequency: 'mensal',
    auto_renewal: false,
    security_clauses: false,
    lgpd_clauses: false,
    sla_defined: false,
    status: 'ativo',
    notes: '',
  });

  if (!vendor) return null;

  const resetForm = () => {
    setForm({
      contract_number: '', contract_type: 'servico', start_date: '', end_date: '',
      renewal_date: '', value: '', currency: 'BRL', billing_frequency: 'mensal',
      auto_renewal: false, security_clauses: false, lgpd_clauses: false,
      sla_defined: false, status: 'ativo', notes: '',
    });
    setContractFile(null);
    setShowForm(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(file.type)) {
        toast({ title: 'Formato inválido', description: 'Apenas PDF e DOCX são aceitos.', variant: 'destructive' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'Arquivo muito grande', description: 'Tamanho máximo: 10MB', variant: 'destructive' });
        return;
      }
      setContractFile(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      let filePath: string | null = null;

      if (contractFile && organization?.id) {
        const ext = contractFile.name.split('.').pop();
        const fileId = crypto.randomUUID();
        const storagePath = `${organization.id}/${vendor.id}/${fileId}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('vendor-contracts')
          .upload(storagePath, contractFile);

        if (uploadError) throw uploadError;
        filePath = storagePath;
      }

      await createContract.mutateAsync({
        vendor_id: vendor.id,
        contract_number: form.contract_number || null,
        contract_type: form.contract_type,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        renewal_date: form.renewal_date || null,
        value: form.value ? parseFloat(form.value) : null,
        currency: form.currency,
        billing_frequency: form.billing_frequency || null,
        auto_renewal: form.auto_renewal,
        security_clauses: form.security_clauses,
        lgpd_clauses: form.lgpd_clauses,
        sla_defined: form.sla_defined,
        file_path: filePath,
        status: form.status,
        notes: form.notes || null,
      });
      toast({ title: 'Contrato criado com sucesso' });
      resetForm();
    } catch {
      toast({ title: 'Erro ao criar contrato', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (contract: VendorContract) => {
    try {
      // Delete file from storage if exists
      if (contract.file_path) {
        await supabase.storage.from('vendor-contracts').remove([contract.file_path]);
      }
      await deleteContract.mutateAsync({ id: contract.id, vendorId: vendor.id });
      toast({ title: 'Contrato excluído' });
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const handleViewFile = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('vendor-contracts')
      .createSignedUrl(filePath, 60 * 5); // 5 min
    if (error || !data?.signedUrl) {
      toast({ title: 'Erro ao abrir arquivo', variant: 'destructive' });
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ativo: 'bg-green-500/10 text-green-500 border-green-500/20',
      vencido: 'bg-red-500/10 text-red-500 border-red-500/20',
      rascunho: 'bg-muted text-muted-foreground border-border',
      cancelado: 'bg-muted text-muted-foreground border-border',
      renovado: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return colors[status] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-space flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Contratos — {vendor.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-4">
            {!showForm && (
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Contrato
              </Button>
            )}

            {showForm && (
              <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/20">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Número do Contrato</Label>
                    <Input value={form.contract_number} onChange={(e) => setForm({ ...form, contract_number: e.target.value })} placeholder="CT-001" />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={form.contract_type} onValueChange={(v) => setForm({ ...form, contract_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONTRACT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Início</Label>
                    <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Término</Label>
                    <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Valor</Label>
                    <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Frequência</Label>
                    <Select value={form.billing_frequency} onValueChange={(v) => setForm({ ...form, billing_frequency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BILLING_FREQUENCIES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Renovação Automática</Label>
                    <Switch checked={form.auto_renewal} onCheckedChange={(v) => setForm({ ...form, auto_renewal: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Cláusulas de Segurança</Label>
                    <Switch checked={form.security_clauses} onCheckedChange={(v) => setForm({ ...form, security_clauses: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Cláusulas LGPD</Label>
                    <Switch checked={form.lgpd_clauses} onCheckedChange={(v) => setForm({ ...form, lgpd_clauses: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>SLA Definido</Label>
                    <Switch checked={form.sla_defined} onCheckedChange={(v) => setForm({ ...form, sla_defined: v })} />
                  </div>
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
                </div>

                {/* File Upload */}
                <div>
                  <Label>Arquivo do Contrato (PDF ou DOCX)</Label>
                  {contractFile ? (
                    <div className="flex items-center gap-2 mt-1 p-2 rounded-md border border-border bg-card/50">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm truncate flex-1">{contractFile.name}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setContractFile(null)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <label
                        htmlFor="contract-file-upload"
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-md border border-dashed border-border hover:border-primary/50 hover:bg-accent/30 transition-colors"
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Clique para selecionar arquivo</span>
                      </label>
                      <input
                        id="contract-file-upload"
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={createContract.isPending || uploading} size="sm">
                    {uploading ? 'Enviando...' : 'Salvar'}
                  </Button>
                  <Button variant="ghost" onClick={resetForm} size="sm">Cancelar</Button>
                </div>
              </div>
            )}

            <Separator />

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : !contracts || contracts.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhum contrato cadastrado</p>
            ) : (
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div key={contract.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{contract.contract_number || 'Sem número'}</span>
                        <Badge variant="outline" className={getStatusColor(contract.status)}>
                          {CONTRACT_STATUS.find((s) => s.value === contract.status)?.label || contract.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(contract)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {contract.start_date ? format(new Date(contract.start_date), 'dd/MM/yyyy') : '—'} — {contract.end_date ? format(new Date(contract.end_date), 'dd/MM/yyyy') : '—'}
                      </span>
                      {contract.value && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {contract.currency} {contract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      {contract.auto_renewal && (
                        <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Auto-renovação</span>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {contract.security_clauses && <Badge variant="secondary" className="text-xs"><ShieldCheck className="h-3 w-3 mr-1" />Segurança</Badge>}
                      {contract.lgpd_clauses && <Badge variant="secondary" className="text-xs">LGPD</Badge>}
                      {contract.sla_defined && <Badge variant="secondary" className="text-xs">SLA</Badge>}
                      {contract.file_path && (
                        <Badge
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handleViewFile(contract.file_path!)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver Contrato
                        </Badge>
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
