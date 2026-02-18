import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useQualificationTemplates } from '@/hooks/useQualificationTemplates';
import { useCreateQualificationCampaign } from '@/hooks/useQualificationCampaigns';
import { useVendors } from '@/hooks/useVendors';
import { Loader2, Send, ClipboardList, Building, Copy } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartQualificationCampaignDialog({ open, onOpenChange }: Props) {
  const [templateId, setTemplateId] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [createdLinks, setCreatedLinks] = useState<Array<{ vendor_name: string; token: string }>>([]);
  const { toast } = useToast();

  const { data: templates } = useQualificationTemplates();
  const { data: vendors } = useVendors();
  const createCampaign = useCreateQualificationCampaign();

  const publishedTemplates = templates?.filter(t => t.status === 'publicado') || [];
  const selectedTemplate = publishedTemplates.find(t => t.id === templateId);

  const toggleVendor = (vendorId: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
  };

  const handleSubmit = async () => {
    if (!templateId || selectedVendors.length === 0) return;

    try {
      const campaigns = await createCampaign.mutateAsync({
        templateId,
        templateVersion: selectedTemplate?.version || 1,
        vendorIds: selectedVendors,
        expiresInDays,
      });

      const links = campaigns.map(c => {
        const vendor = vendors?.find(v => v.id === c.vendor_id);
        return { vendor_name: vendor?.name || 'Fornecedor', token: c.token };
      });

      setCreatedLinks(links);
      toast({ title: `${campaigns.length} campanha(s) criada(s) com sucesso!` });
    } catch {
      toast({ title: 'Erro ao criar campanhas', variant: 'destructive' });
    }
  };

  const getPortalUrl = (token: string) => {
    const base = window.location.origin;
    return `${base}/qualification/${token}`;
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(getPortalUrl(token));
    toast({ title: 'Link copiado!' });
  };

  const handleClose = (o: boolean) => {
    if (!o) {
      setTemplateId('');
      setSelectedVendors([]);
      setExpiresInDays(30);
      setCreatedLinks([]);
    }
    onOpenChange(o);
  };

  if (createdLinks.length > 0) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-space">
              <Send className="h-5 w-5 text-primary" />
              Campanhas Criadas
            </DialogTitle>
            <DialogDescription>
              Copie e envie os links abaixo para cada fornecedor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {createdLinks.map((link, i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-muted/30">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{link.vendor_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{getPortalUrl(link.token)}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => copyLink(link.token)}>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copiar
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => handleClose(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-space">
            <ClipboardList className="h-5 w-5 text-primary" />
            Nova Campanha de Qualificação
          </DialogTitle>
          <DialogDescription>
            Selecione um template e os fornecedores para iniciar a qualificação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template publicado" />
              </SelectTrigger>
              <SelectContent>
                {publishedTemplates.length === 0 ? (
                  <SelectItem value="_none" disabled>Nenhum template publicado</SelectItem>
                ) : (
                  publishedTemplates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name} (v{t.version})</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label>Validade (dias)</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={expiresInDays}
              onChange={e => setExpiresInDays(Number(e.target.value))}
            />
          </div>

          {/* Vendor Selection */}
          <div className="space-y-2">
            <Label>Fornecedores ({selectedVendors.length} selecionados)</Label>
            <ScrollArea className="h-48 border rounded-lg p-2">
              {vendors?.map(v => (
                <label
                  key={v.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedVendors.includes(v.id)}
                    onCheckedChange={() => toggleVendor(v.id)}
                  />
                  <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.code}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] flex-shrink-0">{v.criticality}</Badge>
                </label>
              ))}
              {(!vendors || vendors.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum fornecedor cadastrado</p>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={!templateId || selectedVendors.length === 0 || createCampaign.isPending}
          >
            {createCampaign.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar ({selectedVendors.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
