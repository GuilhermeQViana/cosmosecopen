import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ShieldAlert,
  Bell,
  CheckCircle2,
  ChevronRight,
  Building
} from 'lucide-react';
import { useVendors, getRiskLevelFromScore } from '@/hooks/useVendors';
import { useVendorAssessments } from '@/hooks/useVendorAssessments';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isBefore, isAfter, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'contract' | 'assessment' | 'risk' | 'overdue';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  vendorId: string;
  vendorName: string;
  dueDate?: Date;
  daysRemaining?: number;
}

export function VendorAlerts() {
  const navigate = useNavigate();
  const { data: vendors = [] } = useVendors();
  const { data: assessments = [] } = useVendorAssessments();

  const alerts = useMemo(() => {
    const allAlerts: Alert[] = [];
    const today = new Date();
    const thirtyDays = addDays(today, 30);
    const sevenDays = addDays(today, 7);
    const ninetyDays = addDays(today, 90);

    vendors.forEach(vendor => {
      // Contract expiring alerts
      if (vendor.contract_end) {
        const endDate = new Date(vendor.contract_end);
        const daysRemaining = differenceInDays(endDate, today);

        if (daysRemaining < 0) {
          allAlerts.push({
            id: `contract-expired-${vendor.id}`,
            type: 'contract',
            severity: 'critical',
            title: 'Contrato Vencido',
            description: `Contrato venceu há ${Math.abs(daysRemaining)} dias`,
            vendorId: vendor.id,
            vendorName: vendor.name,
            dueDate: endDate,
            daysRemaining,
          });
        } else if (daysRemaining <= 7) {
          allAlerts.push({
            id: `contract-urgent-${vendor.id}`,
            type: 'contract',
            severity: 'high',
            title: 'Contrato Expirando',
            description: `Contrato expira em ${daysRemaining} dias`,
            vendorId: vendor.id,
            vendorName: vendor.name,
            dueDate: endDate,
            daysRemaining,
          });
        } else if (daysRemaining <= 30) {
          allAlerts.push({
            id: `contract-soon-${vendor.id}`,
            type: 'contract',
            severity: 'medium',
            title: 'Contrato Próximo do Vencimento',
            description: `Contrato expira em ${daysRemaining} dias`,
            vendorId: vendor.id,
            vendorName: vendor.name,
            dueDate: endDate,
            daysRemaining,
          });
        }
      }

      // Assessment alerts
      if (!vendor.last_assessment) {
        // Never assessed
        allAlerts.push({
          id: `no-assessment-${vendor.id}`,
          type: 'assessment',
          severity: vendor.criticality === 'critica' ? 'high' : 'medium',
          title: 'Avaliação Pendente',
          description: 'Fornecedor nunca foi avaliado',
          vendorId: vendor.id,
          vendorName: vendor.name,
        });
      } else if (vendor.next_assessment_date) {
        const nextDate = new Date(vendor.next_assessment_date);
        const daysUntil = differenceInDays(nextDate, today);

        if (daysUntil < 0) {
          allAlerts.push({
            id: `assessment-overdue-${vendor.id}`,
            type: 'overdue',
            severity: 'critical',
            title: 'Reavaliação Atrasada',
            description: `Reavaliação deveria ter sido feita há ${Math.abs(daysUntil)} dias`,
            vendorId: vendor.id,
            vendorName: vendor.name,
            dueDate: nextDate,
            daysRemaining: daysUntil,
          });
        } else if (daysUntil <= 30) {
          allAlerts.push({
            id: `assessment-due-${vendor.id}`,
            type: 'assessment',
            severity: daysUntil <= 7 ? 'high' : 'medium',
            title: 'Reavaliação Agendada',
            description: `Reavaliação em ${daysUntil} dias`,
            vendorId: vendor.id,
            vendorName: vendor.name,
            dueDate: nextDate,
            daysRemaining: daysUntil,
          });
        }
      }

      // High risk alerts
      const riskLevel = getRiskLevelFromScore(vendor.last_assessment?.overall_score ?? null);
      if (riskLevel === 'critico') {
        allAlerts.push({
          id: `risk-critical-${vendor.id}`,
          type: 'risk',
          severity: 'critical',
          title: 'Risco Crítico',
          description: `Score de conformidade: ${vendor.last_assessment?.overall_score ?? 0}%`,
          vendorId: vendor.id,
          vendorName: vendor.name,
        });
      } else if (riskLevel === 'alto' && vendor.criticality === 'critica') {
        allAlerts.push({
          id: `risk-high-${vendor.id}`,
          type: 'risk',
          severity: 'high',
          title: 'Risco Alto em Fornecedor Crítico',
          description: `Score de conformidade: ${vendor.last_assessment?.overall_score ?? 0}%`,
          vendorId: vendor.id,
          vendorName: vendor.name,
        });
      }
    });

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [vendors]);

  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-500',
          badge: 'bg-red-500/20 text-red-600 border-red-500/30',
        };
      case 'high':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          text: 'text-orange-500',
          badge: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-500',
          badge: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-500',
          badge: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
        };
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'contract':
        return Calendar;
      case 'assessment':
        return Clock;
      case 'risk':
        return ShieldAlert;
      case 'overdue':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Alertas
          </CardTitle>
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
            </Badge>
          )}
          {highCount > 0 && (
            <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30 text-xs">
              {highCount} alto{highCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {alerts.length} total
        </Badge>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
            <p className="font-medium">Nenhum alerta no momento</p>
            <p className="text-sm">Todos os fornecedores estão em conformidade</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {alerts.map((alert) => {
                const styles = getSeverityStyles(alert.severity);
                const Icon = getAlertIcon(alert.type);

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-colors',
                      styles.bg,
                      styles.border,
                      'hover:opacity-80'
                    )}
                    onClick={() => navigate('/vrm/fornecedores')}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('p-1.5 rounded-md', styles.bg)}>
                        <Icon className={cn('w-4 h-4', styles.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{alert.title}</span>
                          <Badge variant="outline" className={cn('text-[10px] px-1.5', styles.badge)}>
                            {alert.severity === 'critical' ? 'Crítico' : 
                             alert.severity === 'high' ? 'Alto' : 
                             alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{alert.description}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building className="w-3 h-3" />
                          {alert.vendorName}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
