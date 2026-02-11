import { Badge } from '@/components/ui/badge';
import { VENDOR_LIFECYCLE_STAGES, VENDOR_DATA_CLASSIFICATION } from '@/hooks/useVendors';
import {
  Search,
  ClipboardCheck,
  FileText,
  CheckCircle,
  RefreshCw,
  LogOut,
  Pause,
  ShieldOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGE_ICONS: Record<string, React.ElementType> = {
  prospecto: Search,
  due_diligence: ClipboardCheck,
  em_contratacao: FileText,
  ativo: CheckCircle,
  em_reavaliacao: RefreshCw,
  em_offboarding: LogOut,
  inativo: Pause,
  bloqueado: ShieldOff,
};

interface VendorLifecycleBadgeProps {
  stage: string;
  size?: 'sm' | 'md';
}

export function VendorLifecycleBadge({ stage, size = 'md' }: VendorLifecycleBadgeProps) {
  const stageInfo = VENDOR_LIFECYCLE_STAGES.find((s) => s.value === stage);
  const Icon = STAGE_ICONS[stage] || CheckCircle;

  if (!stageInfo) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium border-none text-white',
        stageInfo.color,
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'
      )}
    >
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {stageInfo.label}
    </Badge>
  );
}

interface DataClassificationBadgeProps {
  classification: string | null;
  size?: 'sm' | 'md';
}

export function DataClassificationBadge({ classification, size = 'md' }: DataClassificationBadgeProps) {
  if (!classification) return null;

  const info = VENDOR_DATA_CLASSIFICATION.find((c) => c.value === classification);
  if (!info) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium border-none text-white',
        info.color,
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'
      )}
    >
      {info.label}
    </Badge>
  );
}
