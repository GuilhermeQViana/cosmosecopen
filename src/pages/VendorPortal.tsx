import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Send,
  ShieldCheck,
} from 'lucide-react';

interface PortalData {
  id: string;
  vendor_id: string;
  scope: string;
  expires_at: string;
  status: string;
  vendor_name?: string;
}

const ASSESSMENT_QUESTIONS = [
  { id: 'security_policy', label: 'Sua empresa possui uma Política de Segurança da Informação formal e atualizada?' },
  { id: 'access_control', label: 'Existem controles de acesso baseados em privilégio mínimo?' },
  { id: 'incident_response', label: 'Há um plano de resposta a incidentes documentado e testado?' },
  { id: 'data_protection', label: 'Quais medidas de proteção de dados pessoais são implementadas (LGPD)?' },
  { id: 'bcp', label: 'Existe um Plano de Continuidade de Negócios (BCP) documentado?' },
  { id: 'certifications', label: 'Quais certificações de segurança a empresa possui? (ISO 27001, SOC2, etc.)' },
  { id: 'third_party', label: 'Como é feita a gestão de terceiros e subcontratados em relação à segurança?' },
  { id: 'training', label: 'Os colaboradores recebem treinamento periódico em segurança da informação?' },
];

export default function VendorPortal() {
  const { token } = useParams<{ token: string }>();
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadPortal() {
      if (!token) {
        setError('Link inválido.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('vendor-portal', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: undefined,
        // @ts-ignore - passing query params via URL workaround
        }) as any;

        // Use fetch directly for GET with query params
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vendor-portal?token=${token}`,
          {
            method: 'GET',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) {
          const err = await res.json();
          setError(err.error || 'Link não encontrado ou inválido.');
          setLoading(false);
          return;
        }

        const portalResult = await res.json();

        if (portalResult.status !== 'pendente') {
          setSubmitted(true);
        }

        setPortalData(portalResult);
      } catch {
        setError('Erro ao carregar portal.');
      }
      setLoading(false);
    }
    loadPortal();
  }, [token]);

  const handleSubmit = async () => {
    if (!portalData) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vendor-portal`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            portal_id: portalData.id,
            responses,
          }),
        }
      );

      if (!res.ok) throw new Error('Erro ao enviar');
      setSubmitted(true);
      toast({ title: 'Respostas enviadas com sucesso!' });
    } catch {
      toast({ title: 'Erro ao enviar respostas', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Link Inválido</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Respostas Enviadas</h2>
            <p className="text-muted-foreground">
              Obrigado por preencher o questionário. Nossa equipe irá revisar suas respostas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-semibold font-space">Portal do Fornecedor</h1>
            <p className="text-xs text-muted-foreground">{portalData?.vendor_name}</p>
          </div>
          <Badge variant="outline" className="ml-auto">
            <Clock className="h-3 w-3 mr-1" />
            Expira em {new Date(portalData!.expires_at).toLocaleDateString('pt-BR')}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-space">
              <Building2 className="h-5 w-5 text-primary" />
              Questionário de {portalData?.scope === 'due_diligence' ? 'Due Diligence' : 'Autoavaliação'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Por favor, responda as perguntas abaixo com o máximo de detalhes possível.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {ASSESSMENT_QUESTIONS.map((q, idx) => (
              <div key={q.id}>
                <label className="text-sm font-medium mb-2 block">
                  {idx + 1}. {q.label}
                </label>
                <Textarea
                  value={responses[q.id] || ''}
                  onChange={(e) => setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Descreva sua resposta..."
                  rows={3}
                />
                {idx < ASSESSMENT_QUESTIONS.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}

            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(responses).length === 0}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Respostas
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
