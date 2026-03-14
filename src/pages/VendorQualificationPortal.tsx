import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Send,
  ShieldCheck,
  Save,
  MessageSquareWarning,
  Upload,
  XCircle,
} from 'lucide-react';

interface Question {
  id: string;
  order_index: number;
  label: string;
  type: string;
  options: any[];
  weight: number;
  is_required: boolean;
  is_ko: boolean;
  ko_value: string | null;
  conditional_on: string | null;
  conditional_value: string | null;
}

interface ExistingResponse {
  id: string;
  question_id: string;
  answer_text: string | null;
  answer_option: any;
  answer_file_url: string | null;
}

interface PortalPayload {
  campaign: { id: string; status: string; expires_at: string; reviewer_notes: string | null };
  vendor_name: string;
  template: { name: string; description: string };
  questions: Question[];
  responses: ExistingResponse[];
}

export default function VendorQualificationPortal() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, { text?: string; option?: any; file_url?: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      if (!token) { setError('Link inválido.'); setLoading(false); return; }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vendor-qualification-portal?token=${token}`,
          { headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' } }
        );
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || 'Link não encontrado ou inválido.');
          setLoading(false);
          return;
        }
        const payload: PortalPayload = await res.json();

        if (['respondido', 'em_analise', 'aprovado', 'reprovado'].includes(payload.campaign.status)) {
          setSubmitted(true);
        }

        // Pre-fill existing responses
        const prefill: Record<string, { text?: string; option?: any; file_url?: string }> = {};
        for (const r of payload.responses) {
          prefill[r.question_id] = {
            text: r.answer_text || undefined,
            option: r.answer_option || undefined,
            file_url: r.answer_file_url || undefined,
          };
        }
        setAnswers(prefill);
        setData(payload);
      } catch {
        setError('Erro ao carregar portal.');
      }
      setLoading(false);
    }
    load();
  }, [token]);

  const visibleQuestions = useMemo(() => {
    if (!data) return [];
    return data.questions.filter(q => {
      if (!q.conditional_on) return true;
      const parentAnswer = answers[q.conditional_on];
      if (!parentAnswer) return false;
      const val = parentAnswer.option?.value || parentAnswer.text || '';
      return val === q.conditional_value;
    });
  }, [data, answers]);

  const progress = useMemo(() => {
    if (visibleQuestions.length === 0) return 0;
    const answered = visibleQuestions.filter(q => {
      const a = answers[q.id];
      return a && (a.text || a.option || a.file_url);
    }).length;
    return Math.round((answered / visibleQuestions.length) * 100);
  }, [visibleQuestions, answers]);

  const setAnswer = (questionId: string, value: { text?: string; option?: any; file_url?: string }) => {
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], ...value } }));
    // Clear validation error when user answers
    setValidationErrors(prev => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  };

  // Validate required fields
  const validateRequired = (): boolean => {
    const errors = new Set<string>();
    for (const q of visibleQuestions) {
      if (q.is_required) {
        const a = answers[q.id];
        const hasAnswer = a && (a.text?.trim() || a.option || a.file_url);
        if (!hasAnswer) {
          errors.add(q.id);
        }
      }
    }
    setValidationErrors(errors);
    return errors.size === 0;
  };

  // KO questions warning
  const koWarnings = useMemo(() => {
    const warnings: string[] = [];
    for (const q of visibleQuestions) {
      if (q.is_ko && q.ko_value) {
        const a = answers[q.id];
        const val = a?.option?.value || a?.text || '';
        if (val && val === q.ko_value) {
          warnings.push(q.label);
        }
      }
    }
    return warnings;
  }, [visibleQuestions, answers]);

  const handleSubmitClick = () => {
    if (!validateRequired()) {
      toast({
        title: 'Campos obrigatórios não preenchidos',
        description: 'Preencha todos os campos obrigatórios antes de enviar.',
        variant: 'destructive',
      });
      // Scroll to first error
      const firstError = document.querySelector('[data-validation-error="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!data) return;
    setSubmitting(true);
    try {
      const responsePayload = Object.entries(answers).map(([question_id, val]) => ({
        question_id,
        answer_text: val.text || null,
        answer_option: val.option || null,
        answer_file_url: val.file_url || null,
      }));

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vendor-qualification-portal`,
        {
          method: 'POST',
          headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaign_id: data.campaign.id, responses: responsePayload, is_draft: isDraft }),
        }
      );
      if (!res.ok) throw new Error('Erro ao enviar');

      if (isDraft) {
        toast({ title: 'Rascunho salvo com sucesso!' });
      } else {
        setSubmitted(true);
        toast({ title: 'Respostas enviadas com sucesso!' });
      }
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

  const requiredCount = visibleQuestions.filter(q => q.is_required).length;
  const requiredAnswered = visibleQuestions.filter(q => {
    if (!q.is_required) return false;
    const a = answers[q.id];
    return a && (a.text?.trim() || a.option || a.file_url);
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold font-space truncate">{data?.template.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{data?.vendor_name}</p>
          </div>
          <Badge variant="outline" className="flex-shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            Expira em {new Date(data!.campaign.expires_at).toLocaleDateString('pt-BR')}
          </Badge>
        </div>
        {/* Progress */}
        <div className="container mx-auto px-4 pb-2">
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground font-medium w-10 text-right">{progress}%</span>
          </div>
          {requiredCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {requiredAnswered}/{requiredCount} obrigatórios preenchidos
            </p>
          )}
        </div>
      </header>

      {/* Reviewer notes (if returned) */}
      {data?.campaign.status === 'devolvido' && data.campaign.reviewer_notes && (
        <div className="container mx-auto px-4 mt-4 max-w-2xl">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
            <MessageSquareWarning className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Correções solicitadas</p>
              <p className="text-sm mt-1">{data.campaign.reviewer_notes}</p>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {data?.template.description && (
          <p className="text-sm text-muted-foreground mb-6">{data.template.description}</p>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-space text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Questionário de Qualificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {visibleQuestions.map((q, idx) => (
              <div key={q.id} data-validation-error={validationErrors.has(q.id) ? 'true' : 'false'}>
                <QuestionField
                  question={q}
                  index={idx}
                  value={answers[q.id]}
                  onChange={(val) => setAnswer(q.id, val)}
                  hasError={validationErrors.has(q.id)}
                />
                {idx < visibleQuestions.length - 1 && <Separator className="mt-5" />}
              </div>
            ))}

            {/* KO warnings */}
            {koWarnings.length > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-500">Atenção: Respostas eliminatórias detectadas</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    As seguintes perguntas possuem respostas que podem resultar em reprovação automática:
                  </p>
                  <ul className="text-xs text-muted-foreground mt-1 list-disc pl-4 space-y-0.5">
                    {koWarnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar Rascunho
              </Button>
              <Button
                onClick={handleSubmitClick}
                disabled={submitting || progress === 0}
                className="flex-1"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Enviar Respostas
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Confirmar Envio
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Após o envio, suas respostas serão analisadas pela equipe e não será mais possível editá-las.
                </p>
                <div className="p-3 rounded-lg bg-muted/30 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Perguntas respondidas</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Obrigatórias preenchidas</span>
                    <span className="font-medium">{requiredAnswered}/{requiredCount}</span>
                  </div>
                </div>
                {koWarnings.length > 0 && (
                  <div className="flex items-center gap-2 text-amber-500 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{koWarnings.length} resposta(s) eliminatória(s) detectada(s)</span>
                  </div>
                )}
                <p className="text-sm font-medium">Deseja realmente enviar?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar e Revisar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false);
                handleSubmit(false);
              }}
            >
              Confirmar Envio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Question Field Component ----

function QuestionField({
  question,
  index,
  value,
  onChange,
  hasError,
}: {
  question: Question;
  index: number;
  value?: { text?: string; option?: any; file_url?: string };
  onChange: (val: { text?: string; option?: any; file_url?: string }) => void;
  hasError?: boolean;
}) {
  const label = `${index + 1}. ${question.label}`;

  return (
    <div className={`space-y-2 ${hasError ? 'ring-2 ring-destructive/50 rounded-lg p-3 -m-3' : ''}`}>
      <div className="flex items-start gap-2 flex-wrap">
        <Label className="text-sm font-medium leading-relaxed flex-1">{label}</Label>
        {question.is_required && (
          <Badge variant="outline" className="text-[10px] flex-shrink-0">Obrigatório</Badge>
        )}
        {question.is_ko && (
          <Badge variant="destructive" className="text-[10px] flex-shrink-0 animate-pulse">
            ⚠ Eliminatório
          </Badge>
        )}
      </div>

      {question.is_ko && question.ko_value && (
        <p className="text-xs text-destructive/80 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Esta pergunta pode resultar em reprovação automática dependendo da resposta.
        </p>
      )}

      {hasError && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Este campo é obrigatório
        </p>
      )}

      {question.type === 'text' && (
        <Textarea
          value={value?.text || ''}
          onChange={e => onChange({ text: e.target.value })}
          placeholder="Descreva sua resposta..."
          rows={3}
          className={hasError ? 'border-destructive' : ''}
        />
      )}

      {question.type === 'multiple_choice' && (
        <RadioGroup
          value={value?.option?.value || ''}
          onValueChange={v => {
            const opt = (question.options || []).find((o: any) => o.value === v);
            onChange({ option: opt || { value: v } });
          }}
        >
          {(question.options || []).map((opt: any, i: number) => {
            const isKoOption = question.is_ko && question.ko_value === opt.value;
            return (
              <div
                key={i}
                className={`flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 ${
                  isKoOption ? 'border border-destructive/20 bg-destructive/5' : ''
                }`}
              >
                <RadioGroupItem value={opt.value} id={`${question.id}-${i}`} />
                <Label htmlFor={`${question.id}-${i}`} className="cursor-pointer text-sm flex-1">
                  {opt.label}
                </Label>
                {isKoOption && (
                  <AlertTriangle className="h-3 w-3 text-destructive/60" />
                )}
              </div>
            );
          })}
        </RadioGroup>
      )}

      {question.type === 'number' && (
        <Input
          type="number"
          value={value?.text || ''}
          onChange={e => onChange({ text: e.target.value })}
          placeholder="0"
          className={hasError ? 'border-destructive' : ''}
        />
      )}

      {question.type === 'currency' && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
          <Input
            type="number"
            step="0.01"
            value={value?.text || ''}
            onChange={e => onChange({ text: e.target.value })}
            className={`pl-10 ${hasError ? 'border-destructive' : ''}`}
            placeholder="0,00"
          />
        </div>
      )}

      {question.type === 'date' && (
        <Input
          type="date"
          value={value?.text || ''}
          onChange={e => onChange({ text: e.target.value })}
          className={hasError ? 'border-destructive' : ''}
        />
      )}

      {question.type === 'upload' && (
        <div className={`border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground ${hasError ? 'border-destructive' : ''}`}>
          {value?.file_url ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-foreground text-sm">Arquivo anexado</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange({ file_url: undefined })}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground/60" />
              <p className="text-xs">Upload de arquivo (em breve)</p>
            </div>
          )}
          <Textarea
            value={value?.text || ''}
            onChange={e => onChange({ text: e.target.value })}
            placeholder="Ou descreva aqui..."
            rows={2}
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
}
