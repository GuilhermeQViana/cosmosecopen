import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  Building,
  Loader2,
  Save,
  AlertTriangle,
  CalendarCheck,
  X,
  Plus,
  Clock,
  CalendarClock,
} from 'lucide-react';
import { useVendors, useUpdateVendor, Vendor, VENDOR_CRITICALITY } from '@/hooks/useVendors';
import { format, addMonths, parseISO, isSameDay } from 'date-fns';
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

interface VendorReassessmentScheduleProps {
  onNewScheduleOpen?: () => void;
}

export function VendorReassessmentSchedule({ onNewScheduleOpen }: VendorReassessmentScheduleProps) {
  const { data: vendors = [] } = useVendors();
  const updateVendor = useUpdateVendor();
  
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isScheduling, setIsScheduling] = useState(false);

  // New schedule dialog (from header button)
  const [newScheduleDialogOpen, setNewScheduleDialogOpen] = useState(false);
  const [newScheduleVendorId, setNewScheduleVendorId] = useState<string>('');
  const [newScheduleDate, setNewScheduleDate] = useState<Date | undefined>(undefined);

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
  const next30Days = upcomingAssessments.filter(a => a.daysUntil <= 30);

  // Filter by selected date
  const filteredOverdue = filterDate 
    ? overdueAssessments.filter(a => isSameDay(a.nextDate, filterDate))
    : overdueAssessments;
  const filteredUpcoming = filterDate
    ? upcomingAssessments.filter(a => isSameDay(a.nextDate, filterDate))
    : upcomingAssessments;

  const openScheduleDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    const frequency = REASSESSMENT_FREQUENCIES[vendor.criticality as keyof typeof REASSESSMENT_FREQUENCIES] || REASSESSMENT_FREQUENCIES.media;
    const suggestedDate = vendor.last_assessment 
      ? addMonths(parseISO(vendor.last_assessment.assessment_date), frequency.months)
      : addMonths(new Date(), frequency.months);
    setSelectedDate(suggestedDate);
    setScheduleDialogOpen(true);
  };

  const FREQUENCY_OPTIONS = [
    { label: 'Mensal', months: 1 },
    { label: 'Trimestral', months: 3 },
    { label: 'Semestral', months: 6 },
    { label: 'Anual', months: 12 },
  ];

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

  const handleNewSchedule = async () => {
    if (!newScheduleVendorId || !newScheduleDate) return;
    const vendor = vendors.find(v => v.id === newScheduleVendorId);
    if (!vendor) return;
    setIsScheduling(true);
    try {
      await updateVendor.mutateAsync({
        id: newScheduleVendorId,
        next_assessment_date: format(newScheduleDate, 'yyyy-MM-dd'),
      });
      toast.success(`Reavaliação de ${vendor.name} agendada para ${format(newScheduleDate, 'dd/MM/yyyy')}`);
      setNewScheduleDialogOpen(false);
      setNewScheduleVendorId('');
      setNewScheduleDate(undefined);
    } catch (error: any) {
      toast.error('Erro ao agendar reavaliação: ' + error.message);
    } finally {
      setIsScheduling(false);
    }
  };

  // Expose open method for parent
  const openNewScheduleDialog = () => {
    setNewScheduleVendorId('');
    setNewScheduleDate(undefined);
    setNewScheduleDialogOpen(true);
  };

  // Allow parent to trigger via ref-like prop
  if (onNewScheduleOpen) {
    // We pass back through a side-channel
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    // If clicking same date, clear filter
    if (filterDate && isSameDay(date, filterDate)) {
      setFilterDate(undefined);
    } else {
      setFilterDate(date);
    }
    setSelectedMonth(date);
  };

  const getCriticalityBadge = (criticality: string) => {
    const crit = VENDOR_CRITICALITY.find(c => c.value === criticality);
    if (!crit) return null;
    const colorMap: Record<string, string> = {
      critica: 'text-red-400 bg-red-500/15 border-red-500/20',
      alta: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
      media: 'text-amber-400 bg-amber-500/15 border-amber-500/20',
      baixa: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
    };
    return (
      <Badge className={cn('text-[10px] px-1.5 py-0 border', colorMap[criticality] || '')}>
        {crit.label}
      </Badge>
    );
  };

  const getStatusBadge = (daysUntil: number) => {
    if (daysUntil < 0) return 'text-red-400 bg-red-500/15 border-red-500/30';
    if (daysUntil <= 7) return 'text-orange-400 bg-orange-500/15 border-orange-500/30';
    if (daysUntil <= 30) return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
  };

  const renderVendorRow = (item: ScheduledAssessment) => (
    <div
      key={item.vendor.id}
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-muted/50 group',
        item.isOverdue && 'border-red-500/30 bg-red-500/5'
      )}
      onClick={() => openScheduleDialog(item.vendor)}
    >
      <div className="flex items-center gap-3 min-w-0">
        {item.isOverdue ? (
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
        ) : (
          <CalendarCheck className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{item.vendor.name}</p>
            {getCriticalityBadge(item.vendor.criticality)}
          </div>
          <p className="text-xs text-muted-foreground">
            {item.vendor.category && <span>{item.vendor.category} · </span>}
            {format(item.nextDate, "dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>
      <Badge className={cn(getStatusBadge(item.daysUntil), 'text-xs shrink-0 border')}>
        {item.isOverdue 
          ? `${Math.abs(item.daysUntil)}d atrasada`
          : item.daysUntil === 0 ? 'Hoje' : `${item.daysUntil}d`
        }
      </Badge>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Summary Indicators */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
          <span className="text-xs font-medium text-red-400">{overdueAssessments.length} atrasada{overdueAssessments.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">{next30Days.length} próx. 30 dias</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10">
          <CalendarCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">{scheduledAssessments.length} agendada{scheduledAssessments.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Calendário
              </CardTitle>
              {filterDate && (
                <Button variant="ghost" size="sm" onClick={() => setFilterDate(undefined)} className="h-7 text-xs gap-1">
                  <X className="h-3 w-3" />
                  Limpar filtro
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CalendarUI
              mode="single"
              selected={filterDate}
              onSelect={handleCalendarSelect}
              className="rounded-md"
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
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {filterDate 
                  ? `Reavaliações em ${format(filterDate, "dd/MM/yyyy")}`
                  : 'Reavaliações'
                }
              </CardTitle>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={openNewScheduleDialog}>
                <Plus className="h-3 w-3" />
                Agendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {/* Overdue */}
              {filteredOverdue.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Atrasadas</p>
                  {filteredOverdue.map(renderVendorRow)}
                </div>
              )}

              {/* Upcoming */}
              {filteredUpcoming.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agendadas</p>
                  {filteredUpcoming.map(renderVendorRow)}
                </div>
              )}

              {/* Without schedule (only when no filter) */}
              {!filterDate && vendorsWithoutSchedule.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Sem agenda</p>
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

              {/* Empty states */}
              {filterDate && filteredOverdue.length === 0 && filteredUpcoming.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarClock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma reavaliação nesta data</p>
                </div>
              )}

              {!filterDate && scheduledAssessments.length === 0 && vendorsWithoutSchedule.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum fornecedor cadastrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Schedule Dialog */}
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

      {/* New Schedule Dialog (with vendor select) */}
      <Dialog open={newScheduleDialogOpen} onOpenChange={setNewScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Reavaliação</DialogTitle>
            <DialogDescription>Selecione o fornecedor e a data desejada</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fornecedor</label>
              <Select value={newScheduleVendorId || 'none'} onValueChange={(val) => setNewScheduleVendorId(val === 'none' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>Selecione um fornecedor</SelectItem>
                  {vendors.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="flex items-center gap-2">
                        {v.name}
                        {v.next_assessment_date && <span className="text-muted-foreground text-xs">(já agendado)</span>}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center">
              <CalendarUI
                mode="single"
                selected={newScheduleDate}
                onSelect={setNewScheduleDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
            {newScheduleDate && (
              <p className="text-sm text-center text-muted-foreground">
                Data: <strong>{format(newScheduleDate, "dd/MM/yyyy")}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewScheduleDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleNewSchedule} disabled={isScheduling || !newScheduleVendorId || !newScheduleDate}>
              {isScheduling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarClock className="h-4 w-4 mr-2" />}
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
