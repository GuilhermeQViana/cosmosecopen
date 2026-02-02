import { Building, ChevronRight, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Vendor {
  id: string;
  code: string;
  name: string;
  status: string;
}

interface VendorEvidenceTreeProps {
  vendors: Vendor[];
  selectedVendorId: string | null;
  onSelectVendor: (vendorId: string | null) => void;
  evidenceCounts: Record<string, number>;
  isLoading?: boolean;
}

export function VendorEvidenceTree({
  vendors,
  selectedVendorId,
  onSelectVendor,
  evidenceCounts,
  isLoading,
}: VendorEvidenceTreeProps) {
  const totalEvidences = Object.values(evidenceCounts).reduce((a, b) => a + b, 0);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {/* All Vendors option */}
        <button
          onClick={() => onSelectVendor(null)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            selectedVendorId === null && 'bg-accent text-accent-foreground font-medium'
          )}
        >
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-left truncate">Todas as Evidências</span>
          {totalEvidences > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {totalEvidences}
            </Badge>
          )}
        </button>

        {/* Separator */}
        <div className="my-2 border-t border-border" />

        {/* Vendor list */}
        {vendors.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            Nenhum fornecedor cadastrado
          </div>
        ) : (
          vendors.map((vendor) => (
            <button
              key={vendor.id}
              onClick={() => onSelectVendor(vendor.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                selectedVendorId === vendor.id && 'bg-accent text-accent-foreground font-medium'
              )}
            >
              <ChevronRight className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                selectedVendorId === vendor.id && 'rotate-90'
              )} />
              <Building className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 text-left min-w-0">
                <div className="truncate">{vendor.name}</div>
                <div className="text-xs text-muted-foreground truncate">{vendor.code}</div>
              </div>
              {evidenceCounts[vendor.id] > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {evidenceCounts[vendor.id]}
                </Badge>
              )}
            </button>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
