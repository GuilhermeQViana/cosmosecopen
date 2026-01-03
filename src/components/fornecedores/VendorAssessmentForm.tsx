import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Vendor } from '@/hooks/useVendors';
import {
  VendorAssessment,
  useVendorAssessmentResponses,
  useSaveAssessmentResponses,
  useUpdateVendorAssessment,
  calculateOverallScore,
} from '@/hooks/useVendorAssessments';
import {
  useVendorRequirementsByDomain,
  VendorRequirement,
  VendorAssessmentDomain,
} from '@/hooks/useVendorRequirements';
import { VendorRiskBadge } from './VendorRiskBadge';
import { getRiskLevelFromScore } from '@/hooks/useVendors';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Lock,
  UserCheck,
  ServerCog,
  Save,
  CheckCircle2,
  ClipboardCheck,
  FileCheck,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Info,
} from 'lucide-react';

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  seg_info: <Shield className="h-4 w-4" />,
  cyber: <Lock className="h-4 w-4" />,
  privacy: <UserCheck className="h-4 w-4" />,
  bcn: <ServerCog className="h-4 w-4" />,
};

const COMPLIANCE_LEVELS = [
  { value: 0, label: 'Não Avaliado', color: 'text-muted-foreground' },
  { value: 1, label: 'Não Implementado', color: 'text-destructive' },
  { value: 2, label: 'Parcialmente Implementado', color: 'text-amber-500' },
  { value: 3, label: 'Em Implementação', color: 'text-yellow-500' },
  { value: 4, label: 'Implementado', color: 'text-blue-500' },
  { value: 5, label: 'Otimizado', color: 'text-green-500' },
];

interface ResponseState {
  requirement_id: string;
  compliance_level: number;
  evidence_provided: boolean;
  observations: string;
}

interface VendorAssessmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  assessment: VendorAssessment | null;
  onComplete?: () => void;
}

export function VendorAssessmentForm({
  open,
  onOpenChange,
  vendor,
  assessment,
  onComplete,
}: VendorAssessmentFormProps) {
  const [responses, setResponses] = useState<Record<string, ResponseState>>({});
  const [activeTab, setActiveTab] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const { requirementsByDomain, totalRequirements, isLoading: requirementsLoading } = useVendorRequirementsByDomain();
  const { data: savedResponses } = useVendorAssessmentResponses(assessment?.id || null);
  const saveResponses = useSaveAssessmentResponses();
  const updateAssessment = useUpdateVendorAssessment();

  // Initialize responses from saved data
  useEffect(() => {
    if (savedResponses && savedResponses.length > 0) {
      const initialResponses: Record<string, ResponseState> = {};
      savedResponses.forEach((r) => {
        initialResponses[r.requirement_id] = {
          requirement_id: r.requirement_id,
          compliance_level: r.compliance_level,
          evidence_provided: r.evidence_provided,
          observations: r.observations || '',
        };
      });
      setResponses(initialResponses);
    }
  }, [savedResponses]);

  // Set initial tab and notes
  useEffect(() => {
    if (requirementsByDomain.length > 0 && !activeTab) {
      setActiveTab(requirementsByDomain[0].domain.code);
    }
  }, [requirementsByDomain, activeTab]);

  useEffect(() => {
    if (assessment?.notes) {
      setNotes(assessment.notes);
    }
  }, [assessment?.notes]);

  const getOrCreateResponse = (requirementId: string): ResponseState => {
    return responses[requirementId] || {
      requirement_id: requirementId,
      compliance_level: 0,
      evidence_provided: false,
      observations: '',
    };
  };

  const updateResponse = (requirementId: string, update: Partial<ResponseState>) => {
    setResponses((prev) => ({
      ...prev,
      [requirementId]: {
        ...getOrCreateResponse(requirementId),
        ...update,
      },
    }));
    setHasChanges(true);
  };

  // Calculate progress and scores
  const { overallScore, domainScores, answeredCount, progress } = useMemo(() => {
    const allResponses = Object.values(responses);
    const answered = allResponses.filter((r) => r.compliance_level > 0);
    const progress = totalRequirements > 0 ? (answered.length / totalRequirements) * 100 : 0;

    const domainScores: Record<string, number> = {};
    requirementsByDomain.forEach(({ domain, requirements }) => {
      const domainResponses = requirements
        .map((r) => responses[r.id])
        .filter((r) => r && r.compliance_level > 0);
      
      if (domainResponses.length > 0) {
        domainScores[domain.code] = calculateOverallScore(
          domainResponses.map((r) => ({ compliance_level: r.compliance_level }))
        );
      }
    });

    const overallScore = answered.length > 0
      ? calculateOverallScore(answered.map((r) => ({ compliance_level: r.compliance_level })))
      : 0;

    return { overallScore, domainScores, answeredCount: answered.length, progress };
  }, [responses, requirementsByDomain, totalRequirements]);

  const handleSave = async (complete = false) => {
    if (!assessment) return;

    setIsSaving(true);
    try {
      // Save responses
      const responsesToSave = Object.values(responses).filter((r) => r.compliance_level > 0);
      if (responsesToSave.length > 0) {
        await saveResponses.mutateAsync({
          assessmentId: assessment.id,
          responses: responsesToSave,
        });
      }

      // Update assessment
      const riskLevel = getRiskLevelFromScore(overallScore);
      await updateAssessment.mutateAsync({
        id: assessment.id,
        notes,
        overall_score: overallScore,
        risk_level: riskLevel,
        status: complete ? 'concluido' : 'em_andamento',
      });

      setHasChanges(false);
      toast({ title: complete ? 'Avaliação concluída' : 'Avaliação salva' });

      if (complete) {
        onOpenChange(false);
        onComplete?.();
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível salvar a avaliação', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const getDomainProgress = (domain: VendorAssessmentDomain, requirements: VendorRequirement[]) => {
    const answered = requirements.filter((r) => responses[r.id]?.compliance_level > 0).length;
    return {
      answered,
      total: requirements.length,
      percentage: requirements.length > 0 ? (answered / requirements.length) * 100 : 0,
    };
  };

  if (!vendor || !assessment) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-4xl p-0" side="right">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-6 border-b bg-card/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <SheetTitle className="font-space">Avaliação de Fornecedor</SheetTitle>
                    <SheetDescription>
                      {vendor.code} - {vendor.name}
                    </SheetDescription>
                    <p className="text-xs text-muted-foreground mt-1">
                      Data: {format(new Date(assessment.assessment_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <VendorRiskBadge score={overallScore} riskLevel={getRiskLevelFromScore(overallScore)} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {answeredCount}/{totalRequirements} requisitos
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progresso da Avaliação</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </SheetHeader>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <div className="border-b px-6">
                <TabsList className="h-12 w-full justify-start bg-transparent p-0 gap-2">
                  {requirementsByDomain.map(({ domain, requirements }) => {
                    const { answered, total, percentage } = getDomainProgress(domain, requirements);
                    return (
                      <TabsTrigger
                        key={domain.code}
                        value={domain.code}
                        className="relative data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-t-lg px-4 pb-3"
                      >
                        <div className="flex items-center gap-2">
                          {DOMAIN_ICONS[domain.code]}
                          <span className="hidden sm:inline">{domain.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {answered}/{total}
                          </Badge>
                        </div>
                        {percentage > 0 && (
                          <div
                            className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                {requirementsByDomain.map(({ domain, requirements }) => (
                  <TabsContent key={domain.code} value={domain.code} className="m-0 p-6">
                    <div className="space-y-4">
                      {domain.description && (
                        <Card className="bg-muted/30 border-muted">
                          <CardContent className="p-4 flex items-start gap-3">
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-sm text-muted-foreground">{domain.description}</p>
                          </CardContent>
                        </Card>
                      )}

                      <Accordion type="multiple" className="space-y-3">
                        {requirements.map((requirement) => {
                          const response = getOrCreateResponse(requirement.id);
                          const levelInfo = COMPLIANCE_LEVELS[response.compliance_level];

                          return (
                            <AccordionItem
                              key={requirement.id}
                              value={requirement.id}
                              className="border rounded-lg bg-card/50 overflow-hidden"
                            >
                              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                                <div className="flex items-center gap-3 w-full text-left">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      response.compliance_level === 0
                                        ? 'bg-muted-foreground'
                                        : response.compliance_level >= 4
                                        ? 'bg-green-500'
                                        : response.compliance_level >= 3
                                        ? 'bg-yellow-500'
                                        : 'bg-destructive'
                                    }`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{requirement.code}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {requirement.name}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className={`${levelInfo.color} shrink-0`}>
                                    {levelInfo.label}
                                  </Badge>
                                  {response.evidence_provided && (
                                    <FileCheck className="h-4 w-4 text-green-500 shrink-0" />
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-4 pt-2">
                                  {requirement.description && (
                                    <p className="text-sm text-muted-foreground">{requirement.description}</p>
                                  )}

                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-xs text-muted-foreground mb-3 block">
                                        Nível de Conformidade: {levelInfo.label}
                                      </Label>
                                      <div className="flex gap-2 flex-wrap">
                                        {COMPLIANCE_LEVELS.slice(1).map((level) => (
                                          <Button
                                            key={level.value}
                                            type="button"
                                            size="sm"
                                            variant={response.compliance_level === level.value ? 'default' : 'outline'}
                                            onClick={() =>
                                              updateResponse(requirement.id, { compliance_level: level.value })
                                            }
                                            className="text-xs"
                                          >
                                            {level.value} - {level.label}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id={`evidence-${requirement.id}`}
                                        checked={response.evidence_provided}
                                        onCheckedChange={(checked) =>
                                          updateResponse(requirement.id, { evidence_provided: checked })
                                        }
                                      />
                                      <Label htmlFor={`evidence-${requirement.id}`} className="text-sm">
                                        Evidência fornecida
                                      </Label>
                                    </div>

                                    <div>
                                      <Label className="text-xs text-muted-foreground">Observações</Label>
                                      <Textarea
                                        placeholder={requirement.evidence_example || 'Adicione observações...'}
                                        value={response.observations}
                                        onChange={(e) =>
                                          updateResponse(requirement.id, { observations: e.target.value })
                                        }
                                        className="mt-1 resize-none text-sm"
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>

            {/* Footer */}
            <div className="border-t p-4 bg-card/50 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Observações Gerais</Label>
                <Textarea
                  placeholder="Observações sobre a avaliação..."
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setHasChanges(true);
                  }}
                  className="mt-1 resize-none text-sm"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                  {hasChanges && <span className="text-amber-500">• Alterações não salvas</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Fechar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSave(false)}
                    disabled={isSaving || !hasChanges}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Rascunho
                  </Button>
                  <Button
                    onClick={() => setShowCompleteDialog(true)}
                    disabled={isSaving || progress < 100}
                    className="bg-gradient-to-r from-green-600 to-green-500"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Concluir Avaliação
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-space flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Concluir Avaliação
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Confirma a conclusão da avaliação do fornecedor "{vendor.name}"?
                </p>
                <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Score Final</span>
                    <VendorRiskBadge score={overallScore} riskLevel={getRiskLevelFromScore(overallScore)} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Requisitos Avaliados</span>
                    <span>{answeredCount} de {totalRequirements}</span>
                  </div>
                </div>
                {progress < 100 && (
                  <div className="flex items-center gap-2 text-amber-500 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Nem todos os requisitos foram avaliados</span>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCompleteDialog(false);
                handleSave(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar Conclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
