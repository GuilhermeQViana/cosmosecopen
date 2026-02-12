import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Vendor } from '@/hooks/useVendors';
import {
  useDueDiligence,
  useDueDiligenceItems,
  useCreateDueDiligence,
  useUpdateDueDiligenceItem,
  useUpdateDueDiligence,
  DD_CATEGORIES,
  DD_ITEM_STATUS,
  DueDiligenceItem,
} from '@/hooks/useDueDiligence';
import { InherentRiskCalculator } from './InherentRiskCalculator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ClipboardCheck,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Clock,
  FileText,
  Banknote,
  Shield,
  Scale,
  Settings,
  Calculator,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  documentacao: FileText,
  financeiro: Banknote,
  seguranca: Shield,
  legal: Scale,
  operacional: Settings,
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  pendente: Clock,
  ok: CheckCircle2,
  alerta: AlertTriangle,
  reprovado: XCircle,
  nao_aplicavel: MinusCircle,
};

interface AIAssistance {
  questions: string[];
  red_flags: string[];
  approval_criteria: string[];
}

interface DueDiligenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

export function DueDiligenceDialog({ open, onOpenChange, vendor }: DueDiligenceDialogProps) {
  const [showRiskCalculator, setShowRiskCalculator] = useState(false);
  const [aiCache, setAiCache] = useState<Record<string, AIAssistance>>({});
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [expandedAiItem, setExpandedAiItem] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: ddList, isLoading: ddLoading } = useDueDiligence(vendor?.id ?? null);
  const activeDd = ddList?.[0] ?? null;
  const { data: items, isLoading: itemsLoading } = useDueDiligenceItems(activeDd?.id ?? null);

  const createDd = useCreateDueDiligence();
  const updateItem = useUpdateDueDiligenceItem();
  const updateDd = useUpdateDueDiligence();

  if (!vendor) return null;

  const handleStart = async () => {
    try {
      await createDd.mutateAsync(vendor.id);
      toast({ title: 'Due Diligence iniciada', description: 'Checklist criado com os itens padrão' });
    } catch {
      toast({ title: 'Erro ao iniciar Due Diligence', variant: 'destructive' });
    }
  };

  const handleItemStatusChange = async (item: DueDiligenceItem, newStatus: string) => {
    await updateItem.mutateAsync({ id: item.id, status: newStatus });
  };

  const handleItemObservation = async (item: DueDiligenceItem, observations: string) => {
    await updateItem.mutateAsync({ id: item.id, observations });
  };

  const handleComplete = async (approved: boolean) => {
    if (!activeDd) return;
    await updateDd.mutateAsync({
      id: activeDd.id,
      status: approved ? 'aprovado' : 'rejeitado',
      completed_at: new Date().toISOString(),
    });
    toast({
      title: approved ? 'Due Diligence Aprovada' : 'Due Diligence Rejeitada',
      description: approved
        ? 'O fornecedor foi aprovado na due diligence'
        : 'O fornecedor foi rejeitado na due diligence',
    });
  };

  const handleRiskScoreCalculated = async (score: number) => {
    if (!activeDd) return;
    await updateDd.mutateAsync({ id: activeDd.id, inherent_risk_score: score });
    setShowRiskCalculator(false);
    toast({ title: 'Risk Score calculado', description: `Score: ${score.toFixed(0)}%` });
  };

  const handleAIAssist = async (item: DueDiligenceItem) => {
    if (aiCache[item.id]) {
      setExpandedAiItem(expandedAiItem === item.id ? null : item.id);
      return;
    }

    setLoadingItemId(item.id);
    try {
      const { data, error } = await supabase.functions.invoke('assist-due-diligence', {
        body: {
          item_name: item.item_name,
          item_category: item.category,
          item_description: item.description,
          vendor_name: vendor.name,
          vendor_category: vendor.category,
        },
      });
      if (error) throw error;
      setAiCache((prev) => ({ ...prev, [item.id]: data }));
      setExpandedAiItem(item.id);
    } catch (err: any) {
      toast({ title: err?.message || 'Erro ao gerar assistência', variant: 'destructive' });
    } finally {
      setLoadingItemId(null);
    }
  };

  const groupedItems = items?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DueDiligenceItem[]>) ?? {};

  const totalItems = items?.length ?? 0;
  const completedItems = items?.filter((i) => i.status !== 'pendente').length ?? 0;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-space flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Due Diligence — {vendor.name}
          </DialogTitle>
        </DialogHeader>

        {ddLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !activeDd ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium font-space">Iniciar Due Diligence</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Inicie o processo de due diligence pré-contratação para avaliar documentação, segurança,
              aspectos financeiros, legais e operacionais do fornecedor.
            </p>
            <Button onClick={handleStart} disabled={createDd.isPending}>
              {createDd.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Iniciar Due Diligence
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-white border-none',
                    activeDd.status === 'aprovado' ? 'bg-green-500' :
                    activeDd.status === 'rejeitado' ? 'bg-red-500' :
                    activeDd.status === 'em_andamento' ? 'bg-amber-500' :
                    'bg-gray-400'
                  )}
                >
                  {activeDd.status === 'aprovado' ? 'Aprovado' :
                   activeDd.status === 'rejeitado' ? 'Rejeitado' :
                   activeDd.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {completedItems}/{totalItems} itens verificados
                </span>
                {activeDd.inherent_risk_score !== null && (
                  <Badge variant="outline" className="gap-1">
                    <Calculator className="h-3 w-3" />
                    Score: {activeDd.inherent_risk_score.toFixed(0)}%
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowRiskCalculator(true)}>
                  <Calculator className="h-4 w-4 mr-1" />
                  Calcular Risco
                </Button>
                {activeDd.status === 'em_andamento' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleComplete(false)}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                    <Button size="sm" onClick={() => handleComplete(true)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <Separator />

            {/* Checklist */}
            <ScrollArea className="h-[50vh]">
              <div className="space-y-6 pr-4">
                {DD_CATEGORIES.map((cat) => {
                  const catItems = groupedItems[cat.value] || [];
                  if (catItems.length === 0) return null;

                  const CatIcon = CATEGORY_ICONS[cat.value] || FileText;
                  const catCompleted = catItems.filter((i) => i.status !== 'pendente').length;

                  return (
                    <div key={cat.value}>
                      <div className="flex items-center gap-2 mb-3">
                        <CatIcon className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold font-space">{cat.label}</h4>
                        <span className="text-xs text-muted-foreground">
                          ({catCompleted}/{catItems.length})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {catItems.map((item) => {
                          const StatusIcon = STATUS_ICONS[item.status] || Clock;
                          const isLoadingThis = loadingItemId === item.id;
                          const aiData = aiCache[item.id];
                          const isAiExpanded = expandedAiItem === item.id;

                          return (
                            <div
                              key={item.id}
                              className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1">
                                  <StatusIcon
                                    className={cn(
                                      'h-4 w-4 mt-0.5 flex-shrink-0',
                                      item.status === 'ok' ? 'text-green-500' :
                                      item.status === 'alerta' ? 'text-amber-500' :
                                      item.status === 'reprovado' ? 'text-red-500' :
                                      'text-muted-foreground'
                                    )}
                                  />
                                  <div>
                                    <p className="text-sm font-medium">{item.item_name}</p>
                                    {item.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleAIAssist(item)}
                                    disabled={isLoadingThis}
                                  >
                                    {isLoadingThis ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Sparkles className={cn("h-3.5 w-3.5", aiData ? "text-primary" : "text-muted-foreground")} />
                                    )}
                                  </Button>
                                  <Select
                                    value={item.status}
                                    onValueChange={(v) => handleItemStatusChange(item, v)}
                                  >
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {DD_ITEM_STATUS.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                          {s.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* AI Assistance Card */}
                              {aiData && isAiExpanded && (
                                <div className="p-3 rounded-md bg-primary/5 border border-primary/20 space-y-2 text-xs">
                                  <div className="flex items-center gap-1 text-primary font-medium">
                                    <Sparkles className="h-3 w-3" />
                                    Assistente IA
                                  </div>
                                  <div>
                                    <p className="font-medium text-muted-foreground mb-1">❓ Perguntas Investigativas:</p>
                                    <ul className="space-y-1 ml-3">
                                      {aiData.questions.map((q, i) => <li key={i}>{q}</li>)}
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="font-medium text-muted-foreground mb-1">🚩 Red Flags:</p>
                                    <ul className="space-y-1 ml-3">
                                      {aiData.red_flags.map((f, i) => <li key={i} className="text-destructive">{f}</li>)}
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="font-medium text-muted-foreground mb-1">✅ Critérios de Aprovação:</p>
                                    <ul className="space-y-1 ml-3">
                                      {aiData.approval_criteria.map((c, i) => <li key={i}>{c}</li>)}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              <Textarea
                                placeholder="Observações..."
                                value={item.observations || ''}
                                onChange={(e) => handleItemObservation(item, e.target.value)}
                                className="text-xs h-16 resize-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Risk Calculator Dialog */}
        <InherentRiskCalculator
          open={showRiskCalculator}
          onOpenChange={setShowRiskCalculator}
          onCalculated={handleRiskScoreCalculated}
          vendor={vendor}
        />
      </DialogContent>
    </Dialog>
  );
}
