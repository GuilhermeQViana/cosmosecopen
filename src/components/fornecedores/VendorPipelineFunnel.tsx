import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useVendors, Vendor } from '@/hooks/useVendors';
import { Building2, ArrowRight } from 'lucide-react';

const STATUS_STAGES = [
  { value: 'inativo', label: 'Inativo', color: 'bg-gray-400' },
  { value: 'em_avaliacao', label: 'Em Avaliação', color: 'bg-amber-500' },
  { value: 'ativo', label: 'Ativo', color: 'bg-emerald-500' },
  { value: 'bloqueado', label: 'Bloqueado', color: 'bg-red-500' },
];

const LIFECYCLE_STAGES = [
  { value: 'inativo', label: 'Inativo', color: 'bg-gray-400' },
  { value: 'prospecto', label: 'Prospecto', color: 'bg-blue-400' },
  { value: 'due_diligence', label: 'Due Diligence', color: 'bg-amber-500' },
  { value: 'em_contratacao', label: 'Contratação', color: 'bg-purple-500' },
  { value: 'em_reavaliacao', label: 'Reavaliação', color: 'bg-cyan-500' },
  { value: 'ativo', label: 'Ativo', color: 'bg-emerald-500' },
  { value: 'em_offboarding', label: 'Offboarding', color: 'bg-orange-500' },
  { value: 'bloqueado', label: 'Bloqueado', color: 'bg-red-500' },
];

interface PipelineRowProps {
  label: string;
  stages: { value: string; label: string; color: string }[];
  vendors: Vendor[];
  field: keyof Vendor;
}

function PipelineRow({ label, stages, vendors, field }: PipelineRowProps) {
  const stageCounts = stages.map((stage) => ({
    ...stage,
    count: vendors.filter((v) => v[field] === stage.value).length,
  }));

  return (
    <div className="space-y-2">
      <Badge variant="outline" className="text-xs font-medium">
        {label}
      </Badge>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {stageCounts.map((stage, idx) => (
          <div key={stage.value} className="flex items-center gap-1 min-w-0">
            <div className="flex flex-col items-center gap-1 min-w-[80px]">
              <div className={`${stage.color} text-white rounded-lg px-3 py-2 text-center w-full`}>
                <p className="text-xl font-bold font-space">{stage.count}</p>
              </div>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {stage.label}
              </span>
            </div>
            {idx < stageCounts.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VendorPipelineFunnel() {
  const { data: vendors = [] } = useVendors();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 font-space">
          <Building2 className="h-5 w-5 text-primary" />
          Pipeline de Fornecedores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PipelineRow label="Status" stages={STATUS_STAGES} vendors={vendors} field="status" />
        <Separator />
        <PipelineRow label="Ciclo de Vida" stages={LIFECYCLE_STAGES} vendors={vendors} field="lifecycle_stage" />
      </CardContent>
    </Card>
  );
}
