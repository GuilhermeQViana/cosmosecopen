import { useState, useEffect } from 'react';
import { Risk, RISK_CATEGORIES, TREATMENT_OPTIONS, calculateRiskLevel, getRiskLevelColor, getRiskLevelLabel } from '@/hooks/useRisks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type RiskTreatment = Database['public']['Enums']['risk_treatment'];

interface PrefillData {
  controlCode?: string;
  controlName?: string;
}

interface RiskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk?: Risk | null;
  prefillData?: PrefillData | null;
  onSubmit: (data: RiskFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface RiskFormData {
  code: string;
  title: string;
  description: string;
  category: string;
  inherent_probability: number;
  inherent_impact: number;
  residual_probability: number | null;
  residual_impact: number | null;
  treatment: RiskTreatment;
  treatment_plan: string;
}

const PROBABILITY_LABELS = ['', 'Muito Baixa', 'Baixa', 'Média', 'Alta', 'Muito Alta'];
const IMPACT_LABELS = ['', 'Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];

export function RiskForm({ open, onOpenChange, risk, prefillData, onSubmit, isLoading }: RiskFormProps) {
  const [formData, setFormData] = useState<RiskFormData>({
    code: '',
    title: '',
    description: '',
    category: '',
    inherent_probability: 3,
    inherent_impact: 3,
    residual_probability: null,
    residual_impact: null,
    treatment: 'mitigar',
    treatment_plan: '',
  });

  useEffect(() => {
    if (risk) {
      setFormData({
        code: risk.code,
        title: risk.title,
        description: risk.description || '',
        category: risk.category || '',
        inherent_probability: risk.inherent_probability,
        inherent_impact: risk.inherent_impact,
        residual_probability: risk.residual_probability,
        residual_impact: risk.residual_impact,
        treatment: risk.treatment,
        treatment_plan: risk.treatment_plan || '',
      });
    } else if (prefillData) {
      // Pre-fill from control data
      const riskCode = `RSK-${prefillData.controlCode?.replace(/[^A-Z0-9]/gi, '') || 'NEW'}`;
      setFormData({
        code: riskCode,
        title: `Risco relacionado ao controle ${prefillData.controlCode}`,
        description: prefillData.controlName 
          ? `Este risco foi identificado a partir do controle não conforme: ${prefillData.controlCode} - ${prefillData.controlName}`
          : '',
        category: 'Conformidade',
        inherent_probability: 3,
        inherent_impact: 3,
        residual_probability: null,
        residual_impact: null,
        treatment: 'mitigar',
        treatment_plan: '',
      });
    } else {
      setFormData({
        code: '',
        title: '',
        description: '',
        category: '',
        inherent_probability: 3,
        inherent_impact: 3,
        residual_probability: null,
        residual_impact: null,
        treatment: 'mitigar',
        treatment_plan: '',
      });
    }
  }, [risk, prefillData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const inherentLevel = calculateRiskLevel(formData.inherent_probability, formData.inherent_impact);
  const residualLevel = formData.residual_probability && formData.residual_impact
    ? calculateRiskLevel(formData.residual_probability, formData.residual_impact)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {risk ? 'Editar Risco' : 'Novo Risco'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="RSK-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {RISK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Descreva o risco..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes sobre o risco..."
              rows={3}
            />
          </div>

          {/* Inherent Risk */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Risco Inerente</h4>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'px-3 py-1 rounded-full text-white text-sm font-medium',
                    getRiskLevelColor(inherentLevel)
                  )}
                >
                  {inherentLevel} - {getRiskLevelLabel(inherentLevel)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Probabilidade</Label>
                  <span className="text-sm font-medium">
                    {formData.inherent_probability} - {PROBABILITY_LABELS[formData.inherent_probability]}
                  </span>
                </div>
                <Slider
                  value={[formData.inherent_probability]}
                  onValueChange={([value]) => setFormData({ ...formData, inherent_probability: value })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Impacto</Label>
                  <span className="text-sm font-medium">
                    {formData.inherent_impact} - {IMPACT_LABELS[formData.inherent_impact]}
                  </span>
                </div>
                <Slider
                  value={[formData.inherent_impact]}
                  onValueChange={([value]) => setFormData({ ...formData, inherent_impact: value })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Treatment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="treatment">Tratamento *</Label>
              <Select
                value={formData.treatment}
                onValueChange={(value) => setFormData({ ...formData, treatment: value as RiskTreatment })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TREATMENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment_plan">Plano de Tratamento</Label>
            <Textarea
              id="treatment_plan"
              value={formData.treatment_plan}
              onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
              placeholder="Descreva as ações para tratar o risco..."
              rows={3}
            />
          </div>

          {/* Residual Risk */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Risco Residual (após controles)</h4>
              {residualLevel !== null && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'px-3 py-1 rounded-full text-white text-sm font-medium',
                      getRiskLevelColor(residualLevel)
                    )}
                  >
                    {residualLevel} - {getRiskLevelLabel(residualLevel)}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Probabilidade</Label>
                  <span className="text-sm font-medium">
                    {formData.residual_probability ?? '-'}
                    {formData.residual_probability && ` - ${PROBABILITY_LABELS[formData.residual_probability]}`}
                  </span>
                </div>
                <Slider
                  value={[formData.residual_probability ?? 0]}
                  onValueChange={([value]) => setFormData({
                    ...formData,
                    residual_probability: value === 0 ? null : value,
                    residual_impact: value === 0 ? null : (formData.residual_impact ?? formData.inherent_impact),
                  })}
                  min={0}
                  max={5}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Impacto</Label>
                  <span className="text-sm font-medium">
                    {formData.residual_impact ?? '-'}
                    {formData.residual_impact && ` - ${IMPACT_LABELS[formData.residual_impact]}`}
                  </span>
                </div>
                <Slider
                  value={[formData.residual_impact ?? 0]}
                  onValueChange={([value]) => setFormData({
                    ...formData,
                    residual_impact: value === 0 ? null : value,
                    residual_probability: value === 0 ? null : (formData.residual_probability ?? formData.inherent_probability),
                  })}
                  min={0}
                  max={5}
                  step={1}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {risk ? 'Salvar Alterações' : 'Criar Risco'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
