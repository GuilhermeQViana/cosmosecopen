import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
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
  Building,
  Loader2,
  Save
} from 'lucide-react';
import { useVendors, Vendor } from '@/hooks/useVendors';
import { useUpdateVendor } from '@/hooks/useVendors';
import { format, addMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ScheduledAssessment {
  vendor: Vendor;
  nextDate: Date;
  daysUntil: number;
  isOverdue: boolean;
}

const REASSESSMENT_FREQUENCIES = {
  critica: { months: 3 },
  alta: { months: 6 },
  media: { months: 12 },
  baixa: { months: 24 },
};

export function VendorReassessmentSchedule() {
  const { data: vendors = [] } = useVendors();
  const updateVendor = useUpdateVendor();
  
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isScheduling, setIsScheduling] = useState(false);

  const scheduledAssessments: ScheduledAssessment[] = vendors
    .filter(v => v.next_assessment_date)
    .map(vendor => {
      const nextDate = parseISO(vendor.next_assessment_date!);
      const today = new Date();
      const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { vendor, nextDate, daysUntil, isOverdue: daysUntil < 0 };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const vendorsWithoutSchedule = vendors.filter(v => !v.next_assessment_date);
  const overdueAssessments = scheduledAssessments.filter(a => a.isOverdue);
  const upcomingAssessments = scheduledAssessments.filter(a => !a.isOverdue);

  const openScheduleDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor);
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
      toast.error('Erro ao agendar reavaliação: ' + error.message);
    } finally {
      setIsScheduling(false);
    }
  };

  const getStatusBadge = (daysUntil: number) => {
    if (daysUntil < 0) return 'text-red-500 bg-red-500/10';
    if (daysUntil <= 7) return 'text-orange-500 bg-orange-500/10';
    if (daysUntil <= 30) return 'text-amber-500 bg-amber-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  const renderVendorRow = (item: ScheduledAssessment) => (
    <div
      key={item.vendor.id}
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50',
        item.isOverdue && 'border-red-500/30 bg-red-500/5'
      )}
      onClick={() => openScheduleDialog(item.vendor)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Building className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{item.vendor.name}</p>
          <p className="text-xs text-muted-foreground">
            {format(item.nextDate, "dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>
      <Badge className={cn(getStatusBadge(item.daysUntil), 'text-xs shrink-0')}>
        {item.isOverdue 
          ? `${Math.abs(item.daysUntil)}d atrasada`
          : item.daysUntil === 0 ? 'Hoje' : `${item.daysUntil}d`
        }
      </Badge>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Compact Calendar */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Calendário
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
                overdue: overdueAssessments.map(a => a.nextDate),
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
          </CardContent>
        </Card>

        {/* Unified List */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Reavaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {/* Overdue */}
              {overdueAssessments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Atrasadas</p>
                  {overdueAssessments.map(renderVendorRow)}
                </div>
              )}

              {/* Upcoming */}
              {upcomingAssessments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agendadas</p>
                  {upcomingAssessments.map(renderVendorRow)}
                </div>
              )}

              {/* Without schedule */}
              {vendorsWithoutSchedule.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">Sem agenda</p>
                  <div className="flex flex-wrap gap-2">
                    {vendorsWithoutSchedule.map((vendor) => (
                      <Button
                        key={vendor.id}
                        variant="outline"
                        size="sm"
                        onClick={() => openScheduleDialog(vendor)}
                        className="gap-1.5 text-xs"
                      >
                        <Building className="h-3 w-3" />
                        {vendor.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {scheduledAssessments.length === 0 && vendorsWithoutSchedule.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum fornecedor cadastrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simplified Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Reavaliação</DialogTitle>
            <DialogDescription>
              {selectedVendor && <>Selecione a data para <strong>{selectedVendor.name}</strong></>}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-2">
            <CalendarUI
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          {selectedDate && (
            <p className="text-sm text-center text-muted-foreground">
              Data: <strong>{format(selectedDate, "dd/MM/yyyy")}</strong>
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSchedule} disabled={isScheduling || !selectedDate}>
              {isScheduling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
