import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAllDueDiligence } from '@/hooks/useVendorDashboardData';
import { ClipboardCheck } from 'lucide-react';

export function VendorDueDiligenceSummary() {
  const { data: dds = [] } = useAllDueDiligence();

  const pending = dds.filter((d) => d.status === 'pendente' || d.status === 'em_andamento').length;
  const approved = dds.filter((d) => d.status === 'aprovado').length;
  const rejected = dds.filter((d) => d.status === 'rejeitado').length;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 font-space">
          <ClipboardCheck className="h-5 w-5 text-indigo-500" />
          Due Diligence
          {pending > 0 && (
            <Badge variant="secondary" className="ml-auto">{pending} pendentes</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dds.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum processo de due diligence
          </p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-amber-500/10 p-3">
                <p className="text-2xl font-bold font-space text-amber-500">{pending}</p>
                <p className="text-[10px] text-muted-foreground">Em Andamento</p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <p className="text-2xl font-bold font-space text-emerald-500">{approved}</p>
                <p className="text-[10px] text-muted-foreground">Aprovados</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-3">
                <p className="text-2xl font-bold font-space text-red-500">{rejected}</p>
                <p className="text-[10px] text-muted-foreground">Rejeitados</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {dds.length} processos totais
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
