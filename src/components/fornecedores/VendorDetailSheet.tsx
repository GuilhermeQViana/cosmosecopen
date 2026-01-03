import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Vendor } from '@/hooks/useVendors';
import { useVendorAssessments } from '@/hooks/useVendorAssessments';
import { VendorRiskBadge, VendorCriticalityBadge, VendorStatusBadge } from './VendorRiskBadge';
import {
  Building2,
  Calendar,
  Mail,
  Phone,
  User,
  ClipboardCheck,
  Edit,
  FileBarChart,
} from 'lucide-react';

interface VendorDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  onEdit?: (vendor: Vendor) => void;
  onStartAssessment?: (vendor: Vendor) => void;
}

export function VendorDetailSheet({
  open,
  onOpenChange,
  vendor,
  onEdit,
  onStartAssessment,
}: VendorDetailSheetProps) {
  const { data: assessments } = useVendorAssessments(vendor?.id);

  if (!vendor) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-muted-foreground">{vendor.code}</p>
              <SheetTitle className="text-xl font-space">{vendor.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <VendorStatusBadge status={vendor.status} />
                <VendorCriticalityBadge criticality={vendor.criticality} />
                {vendor.last_assessment && (
                  <VendorRiskBadge
                    score={vendor.last_assessment.overall_score}
                    riskLevel={vendor.last_assessment.risk_level}
                  />
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-12rem)] mt-6 -mx-6 px-6">
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(vendor)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              {onStartAssessment && (
                <Button size="sm" onClick={() => onStartAssessment(vendor)}>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Nova Avaliação
                </Button>
              )}
            </div>

            {/* Description */}
            {vendor.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h4>
                <p className="text-sm">{vendor.description}</p>
              </div>
            )}

            {/* Category */}
            {vendor.category && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Categoria</h4>
                <p className="text-sm">{vendor.category}</p>
              </div>
            )}

            <Separator />

            {/* Contact */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Contato</h4>
              <div className="space-y-2">
                {vendor.contact_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.contact_name}</span>
                  </div>
                )}
                {vendor.contact_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${vendor.contact_email}`} className="text-primary hover:underline">
                      {vendor.contact_email}
                    </a>
                  </div>
                )}
                {vendor.contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.contact_phone}</span>
                  </div>
                )}
                {!vendor.contact_name && !vendor.contact_email && !vendor.contact_phone && (
                  <p className="text-sm text-muted-foreground italic">Nenhum contato cadastrado</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Contract */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Contrato</h4>
              <div className="space-y-2">
                {vendor.contract_start && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Início: {format(new Date(vendor.contract_start), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                {vendor.contract_end && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Término: {format(new Date(vendor.contract_end), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                {!vendor.contract_start && !vendor.contract_end && (
                  <p className="text-sm text-muted-foreground italic">Datas de contrato não definidas</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Assessments History */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <FileBarChart className="h-4 w-4" />
                Histórico de Avaliações
              </h4>
              {assessments && assessments.length > 0 ? (
                <div className="space-y-2">
                  {assessments.slice(0, 5).map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(assessment.assessment_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {assessment.status.replace('_', ' ')}
                        </p>
                      </div>
                      {assessment.overall_score !== null && (
                        <VendorRiskBadge
                          score={assessment.overall_score}
                          riskLevel={assessment.risk_level}
                          size="sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Nenhuma avaliação realizada</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
