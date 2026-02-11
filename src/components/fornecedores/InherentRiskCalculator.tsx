import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vendor } from '@/hooks/useVendors';
import { Calculator, AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskQuestion {
  id: string;
  label: string;
  weight: number;
  options: Array<{ value: number; label: string }>;
}

const RISK_QUESTIONS: RiskQuestion[] = [
  {
    id: 'data_type',
    label: 'Tipo de dados acessados pelo fornecedor',
    weight: 3,
    options: [
      { value: 1, label: 'Públicos' },
      { value: 2, label: 'Internos' },
      { value: 3, label: 'Pessoais' },
      { value: 4, label: 'Sensíveis' },
      { value: 5, label: 'Financeiros regulados' },
    ],
  },
  {
    id: 'data_volume',
    label: 'Volume de dados tratados',
    weight: 2,
    options: [
      { value: 1, label: 'Nenhum' },
      { value: 2, label: 'Baixo (< 1.000 registros)' },
      { value: 3, label: 'Médio (1.000 - 100.000)' },
      { value: 4, label: 'Alto (100.000 - 1M)' },
      { value: 5, label: 'Massivo (> 1M registros)' },
    ],
  },
  {
    id: 'criticality',
    label: 'Criticidade do serviço para o negócio',
    weight: 3,
    options: [
      { value: 1, label: 'Suporte (não impacta operação)' },
      { value: 2, label: 'Complementar (impacto baixo)' },
      { value: 3, label: 'Importante (impacto moderado)' },
      { value: 4, label: 'Crítico (impacto alto)' },
      { value: 5, label: 'Essencial (parada total)' },
    ],
  },
  {
    id: 'replaceability',
    label: 'Substituibilidade do fornecedor',
    weight: 2,
    options: [
      { value: 1, label: 'Fácil (muitas alternativas)' },
      { value: 3, label: 'Moderada (poucas alternativas)' },
      { value: 5, label: 'Difícil (vendor lock-in)' },
    ],
  },
  {
    id: 'location',
    label: 'Localização do fornecedor',
    weight: 1,
    options: [
      { value: 1, label: 'Nacional' },
      { value: 2, label: 'LATAM' },
      { value: 3, label: 'Internacional com adequação LGPD' },
      { value: 5, label: 'Internacional sem adequação' },
    ],
  },
  {
    id: 'history',
    label: 'Histórico de incidentes',
    weight: 1,
    options: [
      { value: 1, label: 'Sem incidentes conhecidos' },
      { value: 3, label: 'Incidentes menores' },
      { value: 5, label: 'Incidentes graves' },
    ],
  },
];

function getRiskLabel(score: number): { label: string; color: string; icon: React.ElementType } {
  if (score >= 75) return { label: 'Crítico', color: 'text-red-500', icon: AlertTriangle };
  if (score >= 50) return { label: 'Alto', color: 'text-orange-500', icon: TrendingUp };
  if (score >= 25) return { label: 'Médio', color: 'text-amber-500', icon: Shield };
  return { label: 'Baixo', color: 'text-green-500', icon: Shield };
}

interface InherentRiskCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCalculated: (score: number) => void;
  vendor: Vendor | null;
}

export function InherentRiskCalculator({ open, onOpenChange, onCalculated, vendor }: InherentRiskCalculatorProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const allAnswered = RISK_QUESTIONS.every((q) => answers[q.id] !== undefined);

  const score = allAnswered
    ? (() => {
        const totalWeightedScore = RISK_QUESTIONS.reduce(
          (sum, q) => sum + (answers[q.id] || 0) * q.weight,
          0
        );
        const maxScore = RISK_QUESTIONS.reduce((sum, q) => sum + 5 * q.weight, 0);
        return (totalWeightedScore / maxScore) * 100;
      })()
    : null;

  const riskInfo = score !== null ? getRiskLabel(score) : null;

  const handleConfirm = () => {
    if (score !== null) {
      onCalculated(score);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-space flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Calculadora de Risco Inerente
            {vendor && <span className="text-muted-foreground font-normal">— {vendor.name}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Responda às perguntas abaixo para calcular automaticamente o risco inerente do fornecedor.
            O score é ponderado por criticidade de cada fator.
          </p>

          {RISK_QUESTIONS.map((question) => (
            <div key={question.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">{question.label}</Label>
                <Badge variant="outline" className="text-[10px]">Peso {question.weight}</Badge>
              </div>
              <RadioGroup
                value={answers[question.id]?.toString()}
                onValueChange={(v) => setAnswers((prev) => ({ ...prev, [question.id]: parseInt(v) }))}
                className="grid gap-1.5"
              >
                {question.options.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value.toString()} id={`${question.id}-${opt.value}`} />
                    <Label
                      htmlFor={`${question.id}-${opt.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          {score !== null && riskInfo && (
            <Card className="border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <riskInfo.icon className={cn('h-6 w-6', riskInfo.color)} />
                    <div>
                      <p className="text-sm font-medium">Risco Inerente Calculado</p>
                      <p className={cn('text-2xl font-bold font-space', riskInfo.color)}>
                        {score.toFixed(0)}% — {riskInfo.label}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!allAnswered}>
            Salvar Score
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
