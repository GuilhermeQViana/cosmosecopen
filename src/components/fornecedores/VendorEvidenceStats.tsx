import { FileText, Shield, Lock, Globe, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { VendorEvidenceVault } from '@/hooks/useVendorEvidenceVault';
import { differenceInDays, parseISO } from 'date-fns';

interface VendorEvidenceStatsProps {
  evidences: VendorEvidenceVault[];
  isLoading?: boolean;
}

export function VendorEvidenceStats({ evidences, isLoading }: VendorEvidenceStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-12 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const total = evidences.length;
  const publico = evidences.filter((e) => e.classification === 'publico').length;
  const interno = evidences.filter((e) => e.classification === 'interno').length;
  const confidencial = evidences.filter((e) => e.classification === 'confidencial').length;
  
  const expiringCount = evidences.filter((e) => {
    if (!e.expires_at) return false;
    const daysUntilExpiry = differenceInDays(parseISO(e.expires_at), new Date());
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  }).length;

  const stats = [
    {
      label: 'Total',
      value: total,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Público',
      value: publico,
      icon: Globe,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Interno',
      value: interno,
      icon: Shield,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Confidencial',
      value: confidencial,
      icon: Lock,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {expiringCount > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{expiringCount}</p>
                <p className="text-xs text-muted-foreground">A expirar (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
