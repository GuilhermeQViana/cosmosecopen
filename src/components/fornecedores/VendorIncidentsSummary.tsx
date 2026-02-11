import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAllVendorIncidents } from '@/hooks/useVendorDashboardData';
import { AlertTriangle } from 'lucide-react';

const SEVERITY_CONFIG: Record<string, { label: string; variant: 'destructive' | 'default' | 'secondary' | 'outline' }> = {
  critica: { label: 'Crítica', variant: 'destructive' },
  alta: { label: 'Alta', variant: 'default' },
  media: { label: 'Média', variant: 'secondary' },
  baixa: { label: 'Baixa', variant: 'outline' },
};

export function VendorIncidentsSummary() {
  const { data: incidents = [] } = useAllVendorIncidents();

  const openIncidents = incidents.filter((i) => i.status === 'aberto' || i.status === 'em_investigacao');

  const bySeverity = Object.entries(SEVERITY_CONFIG).map(([key, config]) => ({
    ...config,
    key,
    count: openIncidents.filter((i) => i.severity === key).length,
  }));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 font-space">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Incidentes Abertos
          {openIncidents.length > 0 && (
            <Badge variant="destructive" className="ml-auto">{openIncidents.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {openIncidents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum incidente aberto 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {bySeverity.filter((s) => s.count > 0).map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <Badge variant={s.variant}>{s.label}</Badge>
                <span className="text-lg font-bold font-space">{s.count}</span>
              </div>
            ))}
            <div className="border-t border-border/50 pt-2 mt-2">
              <p className="text-xs text-muted-foreground">
                Total: {incidents.length} incidentes ({incidents.filter((i) => i.status === 'resolvido' || i.status === 'encerrado').length} resolvidos)
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
