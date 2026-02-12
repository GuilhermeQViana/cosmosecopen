import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, CheckCircle, AlertTriangle, Clock, Plus, BookTemplate, Send, Eye } from 'lucide-react';
import { usePolicies } from '@/hooks/usePolicies';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  rascunho: 'Rascunho',
  em_revisao: 'Em Revisão',
  aprovada: 'Aprovada',
  publicada: 'Publicada',
  expirada: 'Expirada',
  arquivada: 'Arquivada',
};

export default function PolicyDashboard() {
  const navigate = useNavigate();
  const { policies, isLoading } = usePolicies();

  const stats = useMemo(() => {
    const total = policies.length;
    const published = policies.filter(p => p.status === 'publicada').length;
    const inReview = policies.filter(p => p.status === 'em_revisao').length;
    const expired = policies.filter(p => p.status === 'expirada' || (p.expires_at && isPast(new Date(p.expires_at)))).length;
    const drafts = policies.filter(p => p.status === 'rascunho').length;
    return { total, published, inReview, expired, drafts };
  }, [policies]);

  const upcomingReviews = useMemo(() => {
    const now = new Date();
    const in30Days = addDays(now, 30);
    return policies
      .filter(p => p.next_review_at && isWithinInterval(new Date(p.next_review_at), { start: now, end: in30Days }))
      .sort((a, b) => new Date(a.next_review_at!).getTime() - new Date(b.next_review_at!).getTime())
      .slice(0, 5);
  }, [policies]);

  const recentPolicies = useMemo(() => {
    return [...policies].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5);
  }, [policies]);

  const statCards = [
    { title: 'Total de Políticas', value: stats.total, icon: FileText, color: 'text-emerald-500' },
    { title: 'Publicadas', value: stats.published, icon: CheckCircle, color: 'text-green-500' },
    { title: 'Em Revisão', value: stats.inReview, icon: Clock, color: 'text-amber-500' },
    { title: 'Expiradas', value: stats.expired, icon: AlertTriangle, color: 'text-red-500' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-space">Dashboard de Políticas</h1>
          <p className="text-muted-foreground mt-1">Visão geral do módulo de Gestão de Políticas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/policies/templates')}>
            <BookTemplate className="w-4 h-4 mr-2" /> Templates
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('/policies/central/nova')}>
            <Plus className="w-4 h-4 mr-2" /> Nova Política
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(stat => (
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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Policies */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Políticas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPolicies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma política criada ainda</p>
            ) : (
              <div className="space-y-3">
                {recentPolicies.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/policies/central/${p.id}`)}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Atualizada {format(new Date(p.updated_at), "dd MMM yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0 ml-2">
                      {statusLabels[p.status] || p.status}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Reviews */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Revisões nos Próximos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma revisão programada</p>
            ) : (
              <div className="space-y-3">
                {upcomingReviews.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/policies/central/${p.id}`)}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0 ml-2 text-amber-500 border-amber-500/30">
                      {format(new Date(p.next_review_at!), "dd/MM", { locale: ptBR })}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
