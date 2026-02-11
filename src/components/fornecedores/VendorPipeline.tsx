import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Vendor, VENDOR_LIFECYCLE_STAGES } from '@/hooks/useVendors';
import { VendorLifecycleBadge } from './VendorLifecycleBadge';
import { VendorCriticalityBadge } from './VendorRiskBadge';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorPipelineProps {
  vendors: Vendor[];
  onViewDetails: (vendor: Vendor) => void;
}

export function VendorPipeline({ vendors, onViewDetails }: VendorPipelineProps) {
  const columns = useMemo(() => {
    return VENDOR_LIFECYCLE_STAGES.map((stage) => ({
      ...stage,
      vendors: vendors.filter((v) => v.lifecycle_stage === stage.value),
    }));
  }, [vendors]);

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        {columns.map((column) => (
          <div key={column.value} className="w-[280px] flex-shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={cn('w-2.5 h-2.5 rounded-full', column.color)} />
              <h3 className="text-sm font-semibold font-space">{column.label}</h3>
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {column.vendors.length}
              </Badge>
            </div>

            <div className="space-y-2 min-h-[200px] p-2 rounded-lg bg-muted/30 border border-border/50">
              {column.vendors.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8 italic">
                  Nenhum fornecedor
                </p>
              ) : (
                column.vendors.map((vendor) => (
                  <Card
                    key={vendor.id}
                    className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 bg-card"
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
