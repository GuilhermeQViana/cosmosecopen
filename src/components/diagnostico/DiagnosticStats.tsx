import { Card, CardContent } from '@/components/ui/card';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import { CheckCircle2, AlertCircle, XCircle, BarChart3 } from 'lucide-react';

interface DiagnosticStatsProps {
  controls: Control[];
  assessments: Assessment[];
}

export function DiagnosticStats({ controls, assessments }: DiagnosticStatsProps) {
  const assessmentMap = new Map(
    assessments.map((a) => [a.control_id, a])
  );

  const stats = {
    total: controls.length,
    assessed: assessments.length,
    conforme: assessments.filter((a) => a.status === 'conforme').length,
    parcial: assessments.filter((a) => a.status === 'parcial').length,
    naoConforme: assessments.filter((a) => a.status === 'nao_conforme').length,
  };

  const averageMaturity =
    assessments.length > 0
      ? (
          assessments.reduce((acc, a) => acc + parseInt(a.maturity_level), 0) /
          assessments.length
        ).toFixed(1)
      : '0.0';

  const completionRate =
    controls.length > 0
      ? Math.round((assessments.length / controls.length) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="card-metric">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {averageMaturity}
              </p>
              <p className="text-xs text-muted-foreground">
                Maturidade Média
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-metric">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--conforme))]/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--conforme))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.conforme}
              </p>
              <p className="text-xs text-muted-foreground">Conformes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-metric">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--parcial))]/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[hsl(var(--parcial))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.parcial}
              </p>
              <p className="text-xs text-muted-foreground">Parciais</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-metric">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--nao-conforme))]/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-[hsl(var(--nao-conforme))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.naoConforme}
              </p>
              <p className="text-xs text-muted-foreground">Não Conformes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
