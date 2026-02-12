import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Vendor, useUpdateVendor } from '@/hooks/useVendors';
import { useVendorAssessments, VendorAssessment } from '@/hooks/useVendorAssessments';
import { VendorRiskBadge, VendorCriticalityBadge, VendorStatusBadge } from './VendorRiskBadge';
import { VendorLifecycleBadge, DataClassificationBadge } from './VendorLifecycleBadge';
import { VendorEvidenceUpload } from './VendorEvidenceUpload';
import { VendorActionPlanManager } from './VendorActionPlanManager';
import { VendorContractManager } from './VendorContractManager';
import { VendorIncidentLog } from './VendorIncidentLog';
import { VendorSLATracker } from './VendorSLATracker';
import { VendorOffboardingWizard } from './VendorOffboardingWizard';
import { VendorPortalManager } from './VendorPortalManager';
import { toast } from 'sonner';
import {
  Building2,
  Calendar,
  CalendarClock,
  Mail,
  Phone,
  User,
  ClipboardCheck,
  Edit,
  FileBarChart,
  Paperclip,
  ListTodo,
  ArrowRight,
  Search,
  FileText,
  AlertTriangle,
  Gauge,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface VendorDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  onEdit?: (vendor: Vendor) => void;
  onStartAssessment?: (vendor: Vendor) => void;
  onContinueAssessment?: (assessment: VendorAssessment) => void;
  onStartDueDiligence?: (vendor: Vendor) => void;
}

export function VendorDetailSheet({
  open,
  onOpenChange,
  vendor,
  onEdit,
  onStartAssessment,
  onContinueAssessment,
  onStartDueDiligence,
}: VendorDetailSheetProps) {
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [actionPlanOpen, setActionPlanOpen] = useState(false);
  const [contractsOpen, setContractsOpen] = useState(false);
  const [incidentsOpen, setIncidentsOpen] = useState(false);
  const [slasOpen, setSlasOpen] = useState(false);
  const [offboardingOpen, setOffboardingOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { data: assessments } = useVendorAssessments(vendor?.id);
  const updateVendor = useUpdateVendor();

  if (!vendor) return null;

  const handleOpenEvidences = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setEvidenceDialogOpen(true);
  };

  const handleScheduleReassessment = async () => {
    if (!selectedDate || !vendor) return;
    try {
      await updateVendor.mutateAsync({
        id: vendor.id,
        next_assessment_date: format(selectedDate, 'yyyy-MM-dd'),
      });
      toast.success('Reavaliação agendada com sucesso!');
      setScheduleOpen(false);
      setSelectedDate(undefined);
    } catch {
      toast.error('Erro ao agendar reavaliação');
    }
  };

  const openScheduleDialog = () => {
    setSelectedDate(vendor.next_assessment_date ? new Date(vendor.next_assessment_date + 'T00:00:00') : undefined);
    setScheduleOpen(true);
  };

  return (
    <>
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
                  <VendorLifecycleBadge stage={vendor.lifecycle_stage} />
                  <VendorCriticalityBadge criticality={vendor.criticality} />
                  <DataClassificationBadge classification={vendor.data_classification} />
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
              <div className="flex gap-2 flex-wrap">
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
                <Button variant="outline" size="sm" onClick={() => setActionPlanOpen(true)}>
                  <ListTodo className="h-4 w-4 mr-2" />
                  Planos de Ação
                </Button>
                <Button variant="outline" size="sm" onClick={() => setContractsOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Contratos
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIncidentsOpen(true)}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Incidentes
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSlasOpen(true)}>
                  <Gauge className="h-4 w-4 mr-2" />
                  SLAs
                </Button>
                {onStartDueDiligence && (
                  <Button variant="outline" size="sm" onClick={() => onStartDueDiligence(vendor)}>
                    <Search className="h-4 w-4 mr-2" />
                    Due Diligence
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setOffboardingOpen(true)}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Offboarding
                </Button>
                <Button variant="outline" size="sm" onClick={openScheduleDialog}>
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Reavaliação
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPortalOpen(true)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Portal
                </Button>
              </div>

              {vendor.description && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h4>
                  <p className="text-sm">{vendor.description}</p>
                </div>
              )}

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
                  {vendor.next_assessment_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      <span className="text-primary font-medium">
                        Próxima reavaliação: {format(new Date(vendor.next_assessment_date + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  {!vendor.contract_start && !vendor.contract_end && !vendor.next_assessment_date && (
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
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {format(new Date(assessment.assessment_date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {assessment.status.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {assessment.overall_score !== null && (
                            <VendorRiskBadge
                              score={assessment.overall_score}
                              riskLevel={assessment.risk_level}
                              size="sm"
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEvidences(assessment.id)}
                          >
                            <Paperclip className="h-4 w-4 mr-1" />
                            <span className="text-xs">Evidências</span>
                          </Button>
                          {assessment.status === 'em_andamento' && onContinueAssessment && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onContinueAssessment(assessment)}
                            >
                              <ArrowRight className="h-4 w-4 mr-1" />
                              <span className="text-xs">Continuar</span>
                            </Button>
                          )}
                        </div>
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

      {/* Evidence Upload Dialog */}
      <VendorEvidenceUpload
        open={evidenceDialogOpen}
        onOpenChange={setEvidenceDialogOpen}
        assessmentId={selectedAssessmentId}
        vendorName={vendor.name}
      />

      {/* Action Plan Manager */}
      <VendorActionPlanManager
        open={actionPlanOpen}
        onOpenChange={setActionPlanOpen}
        vendor={vendor}
      />

      {/* Contract Manager */}
      <VendorContractManager
        open={contractsOpen}
        onOpenChange={setContractsOpen}
        vendor={vendor}
      />

      {/* Incident Log */}
      <VendorIncidentLog
        open={incidentsOpen}
        onOpenChange={setIncidentsOpen}
        vendor={vendor}
      />

      {/* SLA Tracker */}
      <VendorSLATracker
        open={slasOpen}
        onOpenChange={setSlasOpen}
        vendor={vendor}
      />

      {/* Offboarding Wizard */}
      <VendorOffboardingWizard
        open={offboardingOpen}
        onOpenChange={setOffboardingOpen}
        vendor={vendor}
      />

      {/* Portal Manager */}
      <VendorPortalManager
        open={portalOpen}
        onOpenChange={setPortalOpen}
        vendor={vendor}
      />

      {/* Schedule Reassessment Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Reavaliação</DialogTitle>
            <DialogDescription>
              Selecione a data da próxima reavaliação para <strong>{vendor.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-2">
            <CalendarUI
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              locale={ptBR}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleScheduleReassessment}
              disabled={!selectedDate || updateVendor.isPending}
            >
              {updateVendor.isPending ? 'Agendando...' : 'Agendar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
