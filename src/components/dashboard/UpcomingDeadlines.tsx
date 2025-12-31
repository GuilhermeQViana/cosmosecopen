import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, AlertCircle } from 'lucide-react';

const deadlines = [
  {
    id: 1,
    title: 'Implementar política de senhas',
    dueDate: '2024-01-15',
    daysLeft: 3,
    priority: 'critica',
  },
  {
    id: 2,
    title: 'Revisar controles de acesso',
    dueDate: '2024-01-18',
    daysLeft: 6,
    priority: 'alta',
  },
  {
    id: 3,
    title: 'Atualizar documentação ISO',
    dueDate: '2024-01-22',
    daysLeft: 10,
    priority: 'media',
  },
  {
    id: 4,
    title: 'Treinamento de conscientização',
    dueDate: '2024-01-25',
    daysLeft: 13,
    priority: 'media',
  },
];

const priorityColors: Record<string, string> = {
  critica: 'badge-risk-critical',
  alta: 'badge-risk-high',
  media: 'badge-risk-medium',
  baixa: 'badge-risk-low',
};

const priorityLabels: Record<string, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export function UpcomingDeadlines() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Próximos Prazos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deadlines.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {item.daysLeft <= 5 && (
                  <AlertCircle className="h-3 w-3 text-[hsl(var(--risk-critical))]" />
                )}
                {item.daysLeft} dias restantes
              </p>
            </div>
            <Badge className={priorityColors[item.priority]}>
              {priorityLabels[item.priority]}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
