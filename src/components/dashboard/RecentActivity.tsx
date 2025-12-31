import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Shield, 
  Clock,
  TrendingUp,
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'assessment',
    message: 'Controle A.5.1 avaliado como Conforme',
    user: 'Maria S.',
    time: '10 min atrás',
    icon: CheckCircle2,
    iconColor: 'text-[hsl(var(--success))]',
  },
  {
    id: 2,
    type: 'risk',
    message: 'Novo risco identificado: Vazamento de dados',
    user: 'João P.',
    time: '1h atrás',
    icon: AlertTriangle,
    iconColor: 'text-[hsl(var(--risk-high))]',
  },
  {
    id: 3,
    type: 'evidence',
    message: 'Evidência anexada ao controle GV.OC-01',
    user: 'Ana L.',
    time: '2h atrás',
    icon: FileCheck,
    iconColor: 'text-primary',
  },
  {
    id: 4,
    type: 'action',
    message: 'Plano de ação concluído: Implementar MFA',
    user: 'Carlos M.',
    time: '3h atrás',
    icon: Shield,
    iconColor: 'text-[hsl(var(--success))]',
  },
  {
    id: 5,
    type: 'maturity',
    message: 'Maturidade do PR.AC elevada para nível 3',
    user: 'Sistema',
    time: '5h atrás',
    icon: TrendingUp,
    iconColor: 'text-primary',
  },
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`mt-0.5 ${activity.iconColor}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground line-clamp-2">{activity.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{activity.user}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
