import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Vendor } from '@/hooks/useVendors';
import { useQualificationCampaigns } from '@/hooks/useQualificationCampaigns';
import { VendorRiskBadge, VendorCriticalityBadge } from './VendorRiskBadge';
import { VendorLifecycleBadge } from './VendorLifecycleBadge';
import {
  Building2,
  MoreVertical,
  Edit,
  Trash2,
  ClipboardCheck,
  Eye,
  Calendar,
  Mail,
  Phone,
  FileBarChart,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorCardProps {
  vendor: Vendor;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
  onViewDetails: (vendor: Vendor) => void;
  onStartAssessment: (vendor: Vendor) => void;
}

export function VendorCard({
  vendor,
  onEdit,
  onDelete,
  onViewDetails,
  onStartAssessment,
}: VendorCardProps) {
  const contractEndDate = vendor.contract_end ? new Date(vendor.contract_end) : null;
  const isContractExpiring =
    contractEndDate && contractEndDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isContractExpired = contractEndDate && contractEndDate < new Date();

  const { data: qualCampaigns } = useQualificationCampaigns({ vendorId: vendor.id });
  const latestQual = qualCampaigns?.find(c => c.score !== null);

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-border/50 transition-all duration-300',
        'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
        'bg-gradient-to-br from-card to-card/80'
      )}
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="pb-2 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">{vendor.code}</span>
                <VendorCriticalityBadge criticality={vendor.criticality} size="sm" />
              </div>
              <h3 className="font-semibold text-foreground truncate mt-0.5">{vendor.name}</h3>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(vendor)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStartAssessment(vendor)}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Iniciar Avaliação
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(vendor)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(vendor)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 relative">
        {/* Status and Risk */}
        <div className="flex items-center gap-2 flex-wrap">
          <VendorLifecycleBadge stage={vendor.lifecycle_stage} size="sm" />
          {vendor.last_assessment && (
            <VendorRiskBadge
              score={vendor.last_assessment.overall_score}
              riskLevel={vendor.last_assessment.risk_level}
              size="sm"
            />
          )}
          {!vendor.last_assessment && (
            <span className="text-xs text-muted-foreground italic">Sem avaliação</span>
          )}
        </div>

        {/* Category */}
        {vendor.category && (
          <p className="text-sm text-muted-foreground">{vendor.category}</p>
        )}

        {/* Contract info */}
        {contractEndDate && (
          <div
            className={cn(
              'flex items-center gap-2 text-xs',
              isContractExpired
                ? 'text-red-500'
                : isContractExpiring
                ? 'text-amber-500'
                : 'text-muted-foreground'
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Contrato até {format(contractEndDate, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
              {isContractExpired && ' (Vencido)'}
              {isContractExpiring && !isContractExpired && ' (Vence em breve)'}
            </span>
          </div>
        )}

        {/* Contact info */}
        <div className="space-y-1">
          {vendor.contact_email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{vendor.contact_email}</span>
            </div>
          )}
          {vendor.contact_phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{vendor.contact_phone}</span>
            </div>
          )}
        </div>

        {/* Assessments count */}
        {vendor.assessments_count !== undefined && vendor.assessments_count > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <FileBarChart className="h-3.5 w-3.5" />
            <span>
              {vendor.assessments_count} avaliação{vendor.assessments_count > 1 ? 'ões' : ''} realizadas
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
