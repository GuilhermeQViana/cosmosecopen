import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from './StarRating';
import { useFeedbacks, Feedback } from '@/hooks/useFeedbacks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, MessageSquare, User } from 'lucide-react';

const MODULES: Record<string, string> = {
  dashboard: 'Dashboard',
  diagnostico: 'Diagnóstico',
  riscos: 'Riscos',
  evidencias: 'Evidências',
  'plano-acao': 'Plano de Ação',
  relatorios: 'Relatórios',
  mapeamento: 'Mapeamento',
  equipe: 'Equipe',
  auditoria: 'Auditoria',
  configuracoes: 'Configurações',
  vrm: 'VRM - Fornecedores',
  geral: 'Plataforma em Geral',
};

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const userName = feedback.profiles?.full_name || 'Usuário';
  const avatarUrl = feedback.profiles?.avatar_url;
  const orgName = feedback.organizations?.name;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">{userName}</span>
              <Badge variant="secondary" className="text-xs">
                {MODULES[feedback.module] || feedback.module}
              </Badge>
              {orgName && (
                <span className="text-xs text-muted-foreground">• {orgName}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={feedback.rating || 0} readonly size="sm" />
              <span className="text-xs text-muted-foreground">
                {format(new Date(feedback.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            {feedback.liked && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">O que gostou:</p>
                <p className="text-sm">{feedback.liked}</p>
              </div>
            )}
            {feedback.suggestions && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Sugestões:</p>
                <p className="text-sm">{feedback.suggestions}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackStats({ feedbacks }: { feedbacks: Feedback[] }) {
  const moduleStats = feedbacks.reduce((acc, fb) => {
    if (!acc[fb.module]) {
      acc[fb.module] = { total: 0, sum: 0 };
    }
    acc[fb.module].total++;
    acc[fb.module].sum += fb.rating || 0;
    return acc;
  }, {} as Record<string, { total: number; sum: number }>);

  const stats = Object.entries(moduleStats)
    .map(([module, { total, sum }]) => ({
      module,
      label: MODULES[module] || module,
      count: total,
      average: sum / total,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Estatísticas por Módulo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum feedback recebido ainda.</p>
        ) : (
          stats.map((stat) => (
            <div key={stat.module} className="flex items-center justify-between">
              <span className="text-sm">{stat.label}</span>
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(stat.average)} readonly size="sm" />
                <Badge variant="outline" className="text-xs">
                  {stat.count}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function FeedbacksList() {
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const { data: feedbacks, isLoading } = useFeedbacks();

  const filteredFeedbacks = feedbacks?.filter(
    (fb) => moduleFilter === 'all' || fb.module === moduleFilter
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Feedbacks Recebidos</h3>
              <Badge variant="secondary">{feedbacks?.length || 0}</Badge>
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os módulos</SelectItem>
                {Object.entries(MODULES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredFeedbacks?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum feedback encontrado.
                </CardContent>
              </Card>
            ) : (
              filteredFeedbacks?.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))
            )}
          </div>
        </div>

        <div>
          <FeedbackStats feedbacks={feedbacks || []} />
        </div>
      </div>
    </div>
  );
}
