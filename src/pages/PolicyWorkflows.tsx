import { Card, CardContent } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';

export default function PolicyWorkflows() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-space">Fluxos de Aprovação</h1>
        <p className="text-muted-foreground mt-1">Configure workflows de aprovação para suas políticas</p>
      </div>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <GitBranch className="w-16 h-16 text-emerald-500/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum workflow configurado</h3>
          <p className="text-muted-foreground max-w-md">
            Configure fluxos de aprovação com 1 ou 2 níveis para controlar o ciclo de vida das políticas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
