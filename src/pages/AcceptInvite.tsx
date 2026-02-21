import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { AUTH_ROUTE } from '@/lib/constants';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'login_required'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de convite inválido.');
      return;
    }

    if (!user) {
      setStatus('login_required');
      setMessage('Você precisa estar logado para aceitar o convite.');
      return;
    }

    acceptInvite();
  }, [token, user]);

  const acceptInvite = async () => {
    try {
      setStatus('loading');
      const { data, error } = await supabase.rpc('accept_organization_invite', {
        _token: token!,
      });

      if (error) throw error;

      setStatus('success');
      setMessage('Convite aceito com sucesso! Você agora faz parte da organização.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Erro ao aceitar convite.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle>Convite de Equipe</CardTitle>
          <CardDescription>CosmoSec</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Processando convite...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-10 w-10 text-[hsl(var(--success))]" />
              <p className="text-center">{message}</p>
              <Button onClick={() => navigate('/selecionar-organizacao')} className="w-full">
                Ir para a plataforma
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-10 w-10 text-destructive" />
              <p className="text-center text-muted-foreground">{message}</p>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Voltar ao início
              </Button>
            </>
          )}
          {status === 'login_required' && (
            <>
              <XCircle className="h-10 w-10 text-[hsl(var(--warning))]" />
              <p className="text-center text-muted-foreground">{message}</p>
              <Button onClick={() => navigate(AUTH_ROUTE)} className="w-full">
                Fazer login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
