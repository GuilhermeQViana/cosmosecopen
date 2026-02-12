import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { X, Plus, Search, Shield, AlertTriangle, Link2 } from 'lucide-react';
import {
  usePolicyRisks, useLinkPolicyRisk, useUnlinkPolicyRisk,
  usePolicyControls, useLinkPolicyControl, useUnlinkPolicyControl,
} from '@/hooks/usePolicyLinkages';
import { useRisks } from '@/hooks/useRisks';
import { useControls } from '@/hooks/useControls';
import { useFrameworks } from '@/hooks/useFrameworks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface PolicyLinkagesProps {
  policyId: string;
}

export function PolicyLinkages({ policyId }: PolicyLinkagesProps) {
  const { data: linkedRisks, isLoading: loadingRisks } = usePolicyRisks(policyId);
  const { data: linkedControls, isLoading: loadingControls } = usePolicyControls(policyId);
  const unlinkRisk = useUnlinkPolicyRisk();
  const unlinkControl = useUnlinkPolicyControl();

  const [addDialog, setAddDialog] = useState<'risk' | 'control' | null>(null);

  return (
    <Card className="p-4 space-y-4">
      {/* Risks Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Riscos ({linkedRisks?.length || 0})
          </h4>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAddDialog('risk')}>
            <Plus className="w-3 h-3 mr-1" /> Vincular
          </Button>
        </div>
        {loadingRisks ? (
          <Skeleton className="h-12" />
        ) : linkedRisks && linkedRisks.length > 0 ? (
          <div className="space-y-1.5">
            {linkedRisks.map((lr: any) => (
              <div key={lr.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="font-mono text-xs shrink-0">{lr.risks?.code}</Badge>
                  <span className="truncate">{lr.risks?.title}</span>
                </div>
                <button
                  onClick={() => unlinkRisk.mutate({ policyId, riskId: lr.risks?.id })}
                  className="text-muted-foreground hover:text-destructive shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nenhum risco vinculado</p>
        )}
      </div>

      {/* Controls Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" /> Controles ({linkedControls?.length || 0})
          </h4>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAddDialog('control')}>
            <Plus className="w-3 h-3 mr-1" /> Vincular
          </Button>
        </div>
        {loadingControls ? (
          <Skeleton className="h-12" />
        ) : linkedControls && linkedControls.length > 0 ? (
          <div className="space-y-1.5">
            {linkedControls.map((lc: any) => (
              <div key={lc.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="font-mono text-xs shrink-0">{lc.controls?.code}</Badge>
                  <span className="truncate">{lc.controls?.name}</span>
                </div>
                <button
                  onClick={() => unlinkControl.mutate({ policyId, controlId: lc.controls?.id })}
                  className="text-muted-foreground hover:text-destructive shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nenhum controle vinculado</p>
        )}
      </div>

      {/* Add Dialog */}
      {addDialog === 'risk' && (
        <AddRiskDialog policyId={policyId} linkedIds={new Set(linkedRisks?.map((lr: any) => lr.risks?.id) || [])} onClose={() => setAddDialog(null)} />
      )}
      {addDialog === 'control' && (
        <AddControlDialog policyId={policyId} linkedIds={new Set(linkedControls?.map((lc: any) => lc.controls?.id) || [])} onClose={() => setAddDialog(null)} />
      )}
    </Card>
  );
}

function AddRiskDialog({ policyId, linkedIds, onClose }: { policyId: string; linkedIds: Set<string>; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const { data: risks } = useRisks({ filterByFramework: false });
  const linkRisk = useLinkPolicyRisk();

  const filtered = (risks || []).filter(r =>
    !linkedIds.has(r.id) &&
    (r.code.toLowerCase().includes(search.toLowerCase()) || r.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Vincular Risco</DialogTitle></DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar risco..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <ScrollArea className="h-[300px]">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum risco disponível</p>
          ) : (
            <div className="space-y-1.5 p-1">
              {filtered.map(risk => (
                <button
                  key={risk.id}
                  onClick={() => linkRisk.mutate({ policyId, riskId: risk.id })}
                  className="w-full text-left p-2.5 rounded-md hover:bg-muted/50 flex items-center gap-2"
                  disabled={linkRisk.isPending}
                >
                  <Badge variant="outline" className="font-mono text-xs">{risk.code}</Badge>
                  <span className="text-sm truncate">{risk.title}</span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function AddControlDialog({ policyId, linkedIds, onClose }: { policyId: string; linkedIds: Set<string>; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const { data: frameworks } = useFrameworks();
  const { data: controls } = useControls(null);
  const linkControl = useLinkPolicyControl();

  const filtered = (controls || []).filter(c =>
    !linkedIds.has(c.id) &&
    (c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Vincular Controle</DialogTitle></DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar controle..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <ScrollArea className="h-[300px]">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum controle disponível</p>
          ) : (
            <div className="space-y-1.5 p-1">
              {filtered.map(control => (
                <button
                  key={control.id}
                  onClick={() => linkControl.mutate({ policyId, controlId: control.id })}
                  className="w-full text-left p-2.5 rounded-md hover:bg-muted/50 flex items-center gap-2"
                  disabled={linkControl.isPending}
                >
                  <Badge variant="outline" className="font-mono text-xs">{control.code}</Badge>
                  <span className="text-sm truncate">{control.name}</span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
