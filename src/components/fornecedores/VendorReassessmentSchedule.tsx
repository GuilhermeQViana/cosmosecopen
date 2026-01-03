import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  RefreshCw,
  Building,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Save
} from 'lucide-react';
import { useVendors, Vendor } from '@/hooks/useVendors';
import { useUpdateVendor } from '@/hooks/useVendors';
import { format, addMonths, addDays, isBefore, isAfter, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ScheduledAssessment {
  vendor: Vendor;
  nextDate: Date;
  daysUntil: number;
  isOverdue: boolean;
}

// Frequency options based on criticality
const REASSESSMENT_FREQUENCIES = {
  critica: { months: 3, label: 'Trimestral' },
  alta: { months: 6, label: 'Semestral' },
  media: { months: 12, label: 'Anual' },
  baixa: { months: 24, label: 'Bienal' },
};

export function VendorReassessmentSchedule() {
  const { data: vendors = [] } = useVendors();
  const updateVendor = useUpdateVendor();
  
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isScheduling, setIsScheduling] = useState(false);

  // Get scheduled assessments
  const scheduledAssessments: ScheduledAssessment[] = vendors
    .filter(v => v.next_assessment_date)
    .map(vendor => {
      const nextDate = parseISO(vendor.next_assessment_date!);
      const today = new Date();
      const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        vendor,
        nextDate,
        daysUntil,
        isOverdue: daysUntil < 0,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // Get assessments for the selected month
  const assessmentsInMonth = scheduledAssessments.filter(a => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    return a.nextDate >= monthStart && a.nextDate <= monthEnd;
  });

  // Vendors without scheduled assessment
  const vendorsWithoutSchedule = vendors.filter(v => !v.next_assessment_date);

  const openScheduleDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    
    // Suggest date based on criticality
    const frequency = REASSESSMENT_FREQUENCIES[vendor.criticality as keyof typeof REASSESSMENT_FREQUENCIES] || REASSESSMENT_FREQUENCIES.media;
    const suggestedDate = vendor.last_assessment 
      ? addMonths(parseISO(vendor.last_assessment.assessment_date), frequency.months)
      : addMonths(new Date(), frequency.months);
    
    setSelectedDate(suggestedDate);
    setScheduleDialogOpen(true);
  };

  const handleSchedule = async () => {
    if (!selectedVendor || !selectedDate) return;

    setIsScheduling(true);
    try {
      await updateVendor.mutateAsync({
        id: selectedVendor.id,
        next_assessment_date: format(selectedDate, 'yyyy-MM-dd'),
      });
      
      toast.success(`Reavaliação de ${selectedVendor.name} agendada para ${format(selectedDate, 'dd/MM/yyyy')}`);
      setScheduleDialogOpen(false);
      setSelectedVendor(null);
      setSelectedDate(undefined);
    } catch (error: any) {
      console.error('Error scheduling assessment:', error);
      toast.error('Erro ao agendar reavaliação: ' + error.message);
    } finally {
      setIsScheduling(false);
    }
  };

  const getStatusColor = (daysUntil: number) => {
    if (daysUntil < 0) return 'text-red-500 bg-red-500/10';
    if (daysUntil <= 7) return 'text-orange-500 bg-orange-500/10';
    if (daysUntil <= 30) return 'text-amber-500 bg-amber-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scheduledAssessments.filter(a => a.isOverdue).length}</p>
                <p className="text-xs text-muted-foreground">Atrasadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scheduledAssessments.filter(a => a.daysUntil > 0 && a.daysUntil <= 30).length}</p>
                <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scheduledAssessments.length}</p>
                <p className="text-xs text-muted-foreground">Agendadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vendorsWithoutSchedule.length}</p>
                <p className="text-xs text-muted-foreground">Sem agenda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar View */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Calendário de Reavaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarUI
              mode="single"
              selected={selectedMonth}
              onSelect={(date) => date && setSelectedMonth(date)}
              className="rounded-md border"
              modifiers={{
                hasAssessment: scheduledAssessments.map(a => a.nextDate),
                overdue: scheduledAssessments.filter(a => a.isOverdue).map(a => a.nextDate),
              }}
              modifiersStyles={{
                hasAssessment: { 
                  backgroundColor: 'hsl(var(--primary) / 0.2)',
                  color: 'hsl(var(--primary))',
                  fontWeight: 'bold',
                },
                overdue: {
                  backgroundColor: 'hsl(0 84% 60% / 0.2)',
                  color: 'hsl(0 84% 60%)',
                },
              }}
            />
            
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-primary/20" />
                <span>Agendada</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500/20" />
                <span>Atrasada</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Próximas Reavaliações
            </CardTitle>
            <CardDescription>
              Reavaliações agendadas para os próximos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scheduledAssessments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhuma reavaliação agendada</p>
                <p className="text-sm">Configure as datas de reavaliação dos fornecedores</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {scheduledAssessments.slice(0, 10).map((item) => (
                  <div
                    key={item.vendor.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50',
                      item.isOverdue && 'border-red-500/30 bg-red-500/5'
                    )}
                    onClick={() => openScheduleDialog(item.vendor)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', getStatusColor(item.daysUntil).split(' ')[1])}>
                        <Building className={cn('h-4 w-4', getStatusColor(item.daysUntil).split(' ')[0])} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.vendor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(item.nextDate, "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn(getStatusColor(item.daysUntil), 'text-xs')}>
                      {item.isOverdue 
                        ? `${Math.abs(item.daysUntil)}d atrasada`
                        : item.daysUntil === 0 
                          ? 'Hoje'
                          : `${item.daysUntil}d`
                      }
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendors without schedule */}
      {vendorsWithoutSchedule.length > 0 && (
        <Card className="border-border/50 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Fornecedores sem Reavaliação Agendada
            </CardTitle>
            <CardDescription>
              Agende a próxima reavaliação para estes fornecedores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {vendorsWithoutSchedule.slice(0, 10).map((vendor) => (
                <Button
                  key={vendor.id}
                  variant="outline"
                  size="sm"
                  onClick={() => openScheduleDialog(vendor)}
                  className="gap-2"
                >
                  <Building className="h-3 w-3" />
                  {vendor.name}
                </Button>
              ))}
              {vendorsWithoutSchedule.length > 10 && (
                <Badge variant="outline" className="text-muted-foreground">
                  +{vendorsWithoutSchedule.length - 10} mais
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Agendar Reavaliação
            </DialogTitle>
            <DialogDescription>
              {selectedVendor && (
                <>
                  Configure a data da próxima reavaliação para <strong>{selectedVendor.name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedVendor && (
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Frequência Sugerida</span>
                  <Badge variant="secondary">
                    {REASSESSMENT_FREQUENCIES[selectedVendor.criticality as keyof typeof REASSESSMENT_FREQUENCIES]?.label || 'Anual'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Baseada na criticidade: {selectedVendor.criticality}
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <CalendarUI
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            {selectedDate && (
              <div className="p-3 rounded-lg bg-primary/10 text-center">
                <p className="text-sm">
                  Reavaliação agendada para:{' '}
                  <strong>{format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</strong>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSchedule} disabled={isScheduling || !selectedDate}>
              {isScheduling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
