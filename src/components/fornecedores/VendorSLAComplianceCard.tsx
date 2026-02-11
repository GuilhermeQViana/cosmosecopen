import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAllVendorSLAs } from '@/hooks/useVendorDashboardData';
import { Gauge } from 'lucide-react';

export function VendorSLAComplianceCard() {
  const { data: slas = [] } = useAllVendorSLAs();

  const total = slas.length;
  const conforme = slas.filter((s) => s.compliance_status === 'conforme').length;
  const atencao = slas.filter((s) => s.compliance_status === 'atencao').length;
  const violado = slas.filter((s) => s.compliance_status === 'violado').length;

  const complianceRate = total > 0 ? Math.round((conforme / total) * 100) : 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 font-space">
          <Gauge className="h-5 w-5 text-blue-500" />
          Compliance de SLAs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum SLA cadastrado
          </p>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold font-space">{complianceRate}%</p>
              <p className="text-xs text-muted-foreground">Taxa de conformidade</p>
            </div>
            <Progress value={complianceRate} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="font-bold text-emerald-500 font-space">{conforme}</p>
                <p className="text-[10px] text-muted-foreground">Conforme</p>
              </div>
              <div>
                <p className="font-bold text-amber-500 font-space">{atencao}</p>
                <p className="text-[10px] text-muted-foreground">Atenção</p>
              </div>
              <div>
                <p className="font-bold text-red-500 font-space">{violado}</p>
                <p className="text-[10px] text-muted-foreground">Violado</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
