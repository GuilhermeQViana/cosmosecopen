import { useState, useMemo } from 'react';
import { 
  Calculator, 
  Clock, 
  Users, 
  TrendingUp,
  DollarSign,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export function ROICalculatorSection() {
  // Input states
  const [teamSize, setTeamSize] = useState(3);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [frameworks, setFrameworks] = useState(2);
  const [vendors, setVendors] = useState(15);
  const [hourlyRate, setHourlyRate] = useState(150);

  // Calculate ROI
  const calculations = useMemo(() => {
    // Current costs (annual)
    const weeksPerYear = 48;
    const currentAnnualHours = hoursPerWeek * weeksPerYear * teamSize;
    const currentAnnualCost = currentAnnualHours * hourlyRate;

    // Efficiency gains with CosmoSec
    const automationSavingsPercent = 0.45; // 45% time savings from automation
    const multiFrameworkSavingsPercent = Math.min(0.15 * (frameworks - 1), 0.30); // 15% per additional framework, max 30%
    const vendorSavingsPercent = vendors > 10 ? 0.10 : 0.05; // 10% if more than 10 vendors

    const totalSavingsPercent = automationSavingsPercent + multiFrameworkSavingsPercent + vendorSavingsPercent;
    
    // Savings
    const hoursSaved = Math.round(currentAnnualHours * totalSavingsPercent);
    const costSaved = Math.round(currentAnnualCost * totalSavingsPercent);

    // CosmoSec estimated cost based on operation size (R$ 30k - 60k/year)
    let cosmoSecCost = 30000; // Base: small operation
    if (teamSize >= 8 || frameworks >= 4) {
      cosmoSecCost = 60000; // Large operation
    } else if (teamSize >= 4 || frameworks >= 3) {
      cosmoSecCost = 45000; // Medium operation
    }

    // Time to breakeven: (CosmoSec Cost / Annual Savings) * 12 months
    const monthsToBreakeven = costSaved > 0 
      ? Math.max(1, Math.round((cosmoSecCost / costSaved) * 12)) 
      : 12;

    // Net ROI: Savings - Investment
    const netROI = costSaved - cosmoSecCost;

    // Productivity improvement
    const productivityGain = Math.round(totalSavingsPercent * 100);

    return {
      currentAnnualHours,
      currentAnnualCost,
      hoursSaved,
      costSaved,
      cosmoSecCost,
      monthsToBreakeven,
      netROI,
      productivityGain,
      totalSavingsPercent
    };
  }, [teamSize, hoursPerWeek, frameworks, vendors, hourlyRate]);

  const scrollToContact = () => {
    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  return (
    <section id="roi-calculator" className="py-24 relative overflow-hidden bg-muted/30">
      {/* Background effects */}
      <div 
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.4), transparent 60%)',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30 dark:border-primary/50 text-primary">
            <Calculator className="w-3 h-3 mr-1" />
            Calculadora de ROI
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-space">
            Calcule sua <span className="text-gradient-cosmic">economia</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra quanto tempo e dinheiro sua equipe pode economizar automatizando a gestão de conformidade.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Card */}
          <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-primary/10">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Sua situação atual
              </h3>

              {/* Team Size */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Tamanho da equipe de GRC
                  </Label>
                  <span className="text-sm font-medium text-foreground bg-primary/10 px-2 py-1 rounded">
                    {teamSize} {teamSize === 1 ? 'pessoa' : 'pessoas'}
                  </span>
                </div>
                <Slider
                  value={[teamSize]}
                  onValueChange={(value) => setTeamSize(value[0])}
                  min={1}
                  max={15}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Hours per week */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horas/semana em compliance (por pessoa)
                  </Label>
                  <span className="text-sm font-medium text-foreground bg-primary/10 px-2 py-1 rounded">
                    {hoursPerWeek}h
                  </span>
                </div>
                <Slider
                  value={[hoursPerWeek]}
                  onValueChange={(value) => setHoursPerWeek(value[0])}
                  min={5}
                  max={40}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Frameworks */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    📋 Frameworks gerenciados
                  </Label>
                  <span className="text-sm font-medium text-foreground bg-primary/10 px-2 py-1 rounded">
                    {frameworks}
                  </span>
                </div>
                <Slider
                  value={[frameworks]}
                  onValueChange={(value) => setFrameworks(value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Vendors */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    🏢 Fornecedores avaliados
                  </Label>
                  <span className="text-sm font-medium text-foreground bg-primary/10 px-2 py-1 rounded">
                    {vendors}
                  </span>
                </div>
                <Slider
                  value={[vendors]}
                  onValueChange={(value) => setVendors(value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Hourly Rate */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Custo/hora médio da equipe
                  </Label>
                  <span className="text-sm font-medium text-foreground bg-primary/10 px-2 py-1 rounded">
                    {formatCurrency(hourlyRate)}
                  </span>
                </div>
                <Slider
                  value={[hourlyRate]}
                  onValueChange={(value) => setHourlyRate(value[0])}
                  min={50}
                  max={500}
                  step={25}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="bg-gradient-to-br from-primary/5 via-card/80 to-secondary/5 dark:from-primary/10 dark:via-card/60 dark:to-secondary/10 backdrop-blur-sm border-primary/20">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Seu potencial de economia
              </h3>

              {/* Main metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/60 dark:bg-background/40 rounded-xl p-4 text-center border border-primary/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Horas economizadas/ano</p>
                  <p className="text-3xl font-bold text-primary font-space">
                    {formatNumber(calculations.hoursSaved)}h
                  </p>
                </div>
                <div className="bg-background/60 dark:bg-background/40 rounded-xl p-4 text-center border border-secondary/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Economia anual</p>
                  <p className="text-3xl font-bold text-secondary font-space">
                    {formatCurrency(calculations.costSaved)}
                  </p>
                </div>
              </div>

              {/* Secondary metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg border border-primary/5">
                  <span className="text-sm text-muted-foreground">Investimento estimado CosmoSec</span>
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(calculations.cosmoSecCost)}/ano</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg border border-secondary/10">
                  <span className="text-sm text-muted-foreground">ROI líquido (economia - investimento)</span>
                  <span className={`text-sm font-semibold ${calculations.netROI > 0 ? 'text-secondary' : 'text-destructive'}`}>
                    {calculations.netROI > 0 ? '+' : ''}{formatCurrency(calculations.netROI)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg border border-primary/5">
                  <span className="text-sm text-muted-foreground">Ganho de produtividade</span>
                  <span className="text-sm font-semibold text-foreground">+{calculations.productivityGain}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg border border-primary/5">
                  <span className="text-sm text-muted-foreground">Tempo para retorno (payback)</span>
                  <span className="text-sm font-semibold text-foreground">~{calculations.monthsToBreakeven} {calculations.monthsToBreakeven === 1 ? 'mês' : 'meses'}</span>
                </div>
              </div>

              {/* Benefits list */}
              <div className="pt-4 border-t border-primary/10">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Como você economiza:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Automação de 45% das tarefas repetitivas</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Mapeamento automático entre {frameworks} frameworks</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Avaliação padronizada de {vendors} fornecedores</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Geração automática de relatórios e evidências</span>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <Button 
                variant="cosmic" 
                size="lg" 
                onClick={scrollToContact} 
                className="w-full group"
              >
                Quero uma proposta personalizada
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                * Estimativas baseadas em dados de clientes similares. Resultados podem variar.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
