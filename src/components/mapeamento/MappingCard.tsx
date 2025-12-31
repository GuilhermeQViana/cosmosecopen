import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Link2 } from 'lucide-react';
import { MappingWithControls } from '@/hooks/useFrameworkMappings';

interface MappingCardProps {
  mapping: MappingWithControls;
}

const frameworkColors: Record<string, string> = {
  nist_csf: 'bg-[hsl(var(--chart-1))]',
  iso_27001: 'bg-[hsl(var(--chart-2))]',
  bcb_cmn: 'bg-[hsl(var(--chart-3))]',
};

const mappingTypeLabels: Record<string, string> = {
  equivalent: 'Equivalente',
  partial: 'Parcial',
  related: 'Relacionado',
};

export function MappingCard({ mapping }: MappingCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Source Control */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  frameworkColors[mapping.source_control.framework.code] || 'bg-muted-foreground'
                }`}
              />
              <Badge variant="outline" className="text-xs font-mono">
                {mapping.source_control.code}
              </Badge>
            </div>
            <p className="text-sm font-medium truncate">{mapping.source_control.name}</p>
            <p className="text-xs text-muted-foreground">
              {mapping.source_control.framework.name}
            </p>
          </div>

          {/* Mapping Type */}
          <div className="flex flex-col items-center gap-1 px-4">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <Badge
              variant="secondary"
              className={`text-xs ${
                mapping.mapping_type === 'equivalent'
                  ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]'
                  : mapping.mapping_type === 'partial'
                  ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {mappingTypeLabels[mapping.mapping_type] || mapping.mapping_type}
            </Badge>
          </div>

          {/* Target Control */}
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center gap-2 mb-1 justify-end">
              <Badge variant="outline" className="text-xs font-mono">
                {mapping.target_control.code}
              </Badge>
              <div
                className={`w-2 h-2 rounded-full ${
                  frameworkColors[mapping.target_control.framework.code] || 'bg-muted-foreground'
                }`}
              />
            </div>
            <p className="text-sm font-medium truncate">{mapping.target_control.name}</p>
            <p className="text-xs text-muted-foreground">
              {mapping.target_control.framework.name}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
