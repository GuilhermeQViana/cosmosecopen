import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface MappingStatsProps {
  totalMappings: number;
  equivalentCount: number;
  partialCount: number;
  relatedCount: number;
}

export function MappingStats({
  totalMappings,
  equivalentCount,
  partialCount,
  relatedCount,
}: MappingStatsProps) {
  const stats = [
    {
      title: 'Total de Mapeamentos',
      value: totalMappings,
      icon: Link2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Equivalentes',
      value: equivalentCount,
      icon: CheckCircle2,
      color: 'text-[hsl(var(--success))]',
      bgColor: 'bg-[hsl(var(--success))]/10',
    },
    {
      title: 'Parciais',
      value: partialCount,
      icon: ArrowLeftRight,
      color: 'text-[hsl(var(--warning))]',
      bgColor: 'bg-[hsl(var(--warning))]/10',
    },
    {
      title: 'Relacionados',
      value: relatedCount,
      icon: AlertCircle,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
