import { Card, CardContent } from '@/components/ui/card';
import { Vendor, getRiskLevelFromScore } from '@/hooks/useVendors';
import { Building2, AlertTriangle, Clock, ShieldCheck, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorStatsProps {
  vendors: Vendor[];
}

export function VendorStats({ vendors }: VendorStatsProps) {
  const stats = {
    total: vendors.length,
    active: vendors.filter((v) => v.status === 'ativo').length,
    critical: vendors.filter((v) => v.criticality === 'critica').length,
    highRisk: vendors.filter((v) => {
      const level = getRiskLevelFromScore(v.last_assessment?.overall_score ?? null);
      return level === 'critico' || level === 'alto';
    }).length,
    pendingAssessment: vendors.filter((v) => !v.last_assessment).length,
    expiringContracts: vendors.filter((v) => {
      if (!v.contract_end) return false;
      const endDate = new Date(v.contract_end);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return endDate <= thirtyDaysFromNow && endDate >= new Date();
    }).length,
  };

  const statItems = [
    {
      label: 'Total de Fornecedores',
      value: stats.total,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Fornecedores Ativos',
      value: stats.active,
      icon: ShieldCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Criticidade Alta/Crítica',
      value: stats.critical,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Risco Alto/Crítico',
      value: stats.highRisk,
      icon: ShieldX,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Sem Avaliação',
      value: stats.pendingAssessment,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <Card
          key={item.label}
          className="border-border/50 bg-gradient-to-br from-card to-card/80 hover:border-primary/30 transition-all"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', item.bgColor)}>
                <item.icon className={cn('h-5 w-5', item.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold font-space">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
