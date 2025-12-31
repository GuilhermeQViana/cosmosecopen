import { Evidence, CLASSIFICATION_OPTIONS } from '@/hooks/useEvidences';
import { Card, CardContent } from '@/components/ui/card';
import { FileCheck, Clock, AlertTriangle, Shield } from 'lucide-react';

interface EvidenceStatsProps {
  evidences: Evidence[];
}

export function EvidenceStats({ evidences }: EvidenceStatsProps) {
  const total = evidences.length;

  const expiringSoon = evidences.filter((e) => {
    if (!e.expires_at) return false;
    const expiresDate = new Date(e.expires_at);
    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return expiresDate > now && expiresDate <= in30Days;
  }).length;

  const expired = evidences.filter((e) => {
    if (!e.expires_at) return false;
    return new Date(e.expires_at) < new Date();
  }).length;

  const confidential = evidences.filter((e) => e.classification === 'confidencial').length;

  const stats = [
    {
      label: 'Total de Evidências',
      value: total,
      icon: FileCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Expirando em 30 dias',
      value: expiringSoon,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Expiradas',
      value: expired,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Confidenciais',
      value: confidential,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
}
