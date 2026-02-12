import { useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Vendor, VENDOR_LIFECYCLE_STAGES, useUpdateVendor } from '@/hooks/useVendors';
import { VendorCriticalityBadge } from './VendorRiskBadge';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VendorPipelineProps {
  vendors: Vendor[];
  onViewDetails: (vendor: Vendor) => void;
}

export function VendorPipeline({ vendors, onViewDetails }: VendorPipelineProps) {
  const draggedVendorId = useRef<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const updateVendor = useUpdateVendor();

  const columns = useMemo(() => {
    return VENDOR_LIFECYCLE_STAGES.map((stage) => ({
      ...stage,
      vendors: vendors.filter((v) => v.lifecycle_stage === stage.value),
    }));
  }, [vendors]);

  const handleDragStart = (vendorId: string) => {
    draggedVendorId.current = vendorId;
  };

  const handleDragOver = (e: React.DragEvent, stageValue: string) => {
    e.preventDefault();
    setDragOverStage(stageValue);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const vendorId = draggedVendorId.current;
    draggedVendorId.current = null;

    if (!vendorId) return;

    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor || vendor.lifecycle_stage === newStage) return;

    const stageLabel = VENDOR_LIFECYCLE_STAGES.find((s) => s.value === newStage)?.label || newStage;

    try {
      await updateVendor.mutateAsync({ id: vendorId, lifecycle_stage: newStage });
      toast.success(`${vendor.name} movido para "${stageLabel}"`);
    } catch {
      toast.error('Erro ao atualizar estágio do fornecedor');
    }
  };

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        {columns.map((column) => (
          <div
            key={column.value}
            className="w-[280px] flex-shrink-0"
            onDragOver={(e) => handleDragOver(e, column.value)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.value)}
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={cn('w-2.5 h-2.5 rounded-full', column.color)} />
              <h3 className="text-sm font-semibold font-space">{column.label}</h3>
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {column.vendors.length}
              </Badge>
            </div>

            <div
              className={cn(
                'space-y-2 min-h-[200px] p-2 rounded-lg bg-muted/30 border transition-all duration-200',
                dragOverStage === column.value
                  ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                  : 'border-border/50'
              )}
            >
              {column.vendors.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8 italic">
                  Nenhum fornecedor
                </p>
              ) : (
                column.vendors.map((vendor) => (
                  <Card
                    key={vendor.id}
                    draggable
                    onDragStart={() => handleDragStart(vendor.id)}
                    className="cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-md transition-all duration-200 bg-card"
                    onClick={() => onViewDetails(vendor)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-mono text-muted-foreground">{vendor.code}</p>
                          <p className="text-sm font-medium truncate">{vendor.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <VendorCriticalityBadge criticality={vendor.criticality} size="sm" />
                        {vendor.category && (
                          <span className="text-[10px] text-muted-foreground">{vendor.category}</span>
                        )}
                      </div>
                      {vendor.contract_value && (
                        <p className="text-[10px] text-muted-foreground">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: vendor.contract_currency || 'BRL',
                          }).format(vendor.contract_value)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
