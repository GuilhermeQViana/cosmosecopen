import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { CheckCircle2, AlertTriangle, FileCheck, Target, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const iconMap = {
  check: CheckCircle2,
  alert: AlertTriangle,
  file: FileCheck,
  target: Target,
};

export function RecentActivity() {
  const { data: activities = [], isLoading } = useRecentActivity(5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <p className="text-sm text-muted-foreground text-center">
            Nenhuma atividade recente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => {
          const IconComponent = iconMap[activity.iconType];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 text-sm"
            >
              <div className={`mt-0.5 ${activity.iconColor}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground truncate">{activity.message}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.user} • {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
