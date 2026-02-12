import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function PolicyDashboard() {
  const stats = [
    { title: 'Total de Políticas', value: '0', icon: FileText, color: 'text-emerald-500' },
    { title: 'Publicadas', value: '0', icon: CheckCircle, color: 'text-green-500' },
    { title: 'Em Revisão', value: '0', icon: Clock, color: 'text-amber-500' },
    { title: 'Expiradas', value: '0', icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-space">Dashboard de Políticas</h1>
        <p className="text-muted-foreground mt-1">Visão geral do módulo de Gestão de Políticas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-16 h-16 text-emerald-500/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Módulo de Gestão de Políticas</h3>
          <p className="text-muted-foreground max-w-md">
            Crie, gerencie e publique políticas corporativas com fluxos de aprovação, campanhas de aceite e vínculo com frameworks de compliance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
