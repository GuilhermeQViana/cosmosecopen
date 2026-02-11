import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Vendor } from '@/hooks/useVendors';
import { useVendorPortalTokens, useCreatePortalToken, VendorPortalToken } from '@/hooks/useVendorPortal';
import { useToast } from '@/hooks/use-toast';
import {
  ExternalLink,
  Copy,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Link2,
} from 'lucide-react';

interface VendorPortalManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

const SCOPE_LABELS: Record<string, string> = {
  assessment: 'Autoavaliação',
  due_diligence: 'Due Diligence',
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendente: { label: 'Pendente', icon: <Clock className="h-3 w-3" />, variant: 'secondary' },
  respondido: { label: 'Respondido', icon: <CheckCircle2 className="h-3 w-3" />, variant: 'default' },
  expirado: { label: 'Expirado', icon: <XCircle className="h-3 w-3" />, variant: 'destructive' },
  revisado: { label: 'Revisado', icon: <CheckCircle2 className="h-3 w-3" />, variant: 'outline' },
};

export function VendorPortalManager({ open, onOpenChange, vendor }: VendorPortalManagerProps) {
  const [scope, setScope] = useState('assessment');
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [showCreate, setShowCreate] = useState(false);

  const { toast } = useToast();
  const { data: tokens = [], isLoading } = useVendorPortalTokens(vendor?.id);
  const createToken = useCreatePortalToken();

  if (!vendor) return null;

  const handleCreateToken = async () => {
    try {
      const token = await createToken.mutateAsync({
        vendorId: vendor.id,
        scope,
        expiresInDays: parseInt(expiresInDays),
      });
      setShowCreate(false);
      toast({ title: 'Link criado com sucesso' });
      // Copy to clipboard
      const portalUrl = `${window.location.origin}/vendor-portal/${token.token}`;
      await navigator.clipboard.writeText(portalUrl);
      toast({ title: 'Link copiado', description: 'O link do portal foi copiado para a área de transferência.' });
    } catch {
      toast({ title: 'Erro ao criar link', variant: 'destructive' });
    }
  };

  const handleCopyLink = async (token: VendorPortalToken) => {
    const portalUrl = `${window.location.origin}/vendor-portal/${token.token}`;
    await navigator.clipboard.writeText(portalUrl);
    toast({ title: 'Link copiado' });
  };

  const isExpired = (token: VendorPortalToken) => new Date(token.expires_at) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-space">
            <ExternalLink className="h-5 w-5 text-primary" />
            Portal do Fornecedor - {vendor.name}
          </DialogTitle>
          <DialogDescription>
            Gere links únicos para que o fornecedor preencha questionários de autoavaliação ou due diligence.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {!showCreate ? (
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Gerar Novo Link
              </Button>
            ) : (
              <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/20">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Escopo</label>
                  <Select value={scope} onValueChange={setScope}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assessment">Autoavaliação</SelectItem>
                      <SelectItem value="due_diligence">Due Diligence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Validade (dias)</label>
                  <Input
                    type="number"
                    min="1"
                    max="90"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreateToken}
                    disabled={createToken.isPending}
                    className="flex-1"
                  >
                    {createToken.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                    Gerar Link
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tokens.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 italic">
                Nenhum link gerado ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {tokens.map((token) => {
                  const expired = isExpired(token);
                  const status = expired && token.status === 'pendente' ? 'expirado' : token.status;
                  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;

                  return (
                    <div
                      key={token.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {SCOPE_LABELS[token.scope] || token.scope}
                          </span>
                          <Badge variant={statusConfig.variant} className="text-xs">
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Criado em {format(new Date(token.created_at!), "dd/MM/yyyy", { locale: ptBR })}
                          {' · '}
                          Expira em {format(new Date(token.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      {!expired && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(token)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
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
