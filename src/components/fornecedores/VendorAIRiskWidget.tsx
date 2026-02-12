import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Vendor } from '@/hooks/useVendors';
import { useVendorAssessments } from '@/hooks/useVendorAssessments';
import { useVendorIncidents } from '@/hooks/useVendorIncidents';
import { useVendorSLAs } from '@/hooks/useVendorSLAs';
import { useVendorContracts } from '@/hooks/useVendorContracts';
import { useDueDiligence } from '@/hooks/useDueDiligence';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RiskAnalysis {
  risk_score: number;
  trend: 'melhorando' | 'estavel' | 'piorando';
  top_concerns: string[];
  recommendation: string;
  summary: string;
}

interface VendorAIRiskWidgetProps {
  vendor: Vendor;
}

export function VendorAIRiskWidget({ vendor }: VendorAIRiskWidgetProps) {
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const { data: assessments } = useVendorAssessments(vendor.id);
  const { data: incidents } = useVendorIncidents(vendor.id);
  const { data: slas } = useVendorSLAs(vendor.id);
  const { data: contracts } = useVendorContracts(vendor.id);
  const { data: ddList } = useDueDiligence(vendor.id);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const lastAssessment = assessments?.[0];
      const openIncidents = incidents?.filter((i) => i.status === 'aberto' || i.status === 'em_investigacao') || [];
      const slaCompliance = slas && slas.length > 0
        ? Math.round((slas.filter((s: any) => s.status === 'conforme').length / slas.length) * 100)
        : null;
      const activeContract = contracts?.find((c: any) => c.status === 'ativo');
      const activeDd = ddList?.[0];

      const { data, error } = await supabase.functions.invoke('vendor-risk-analysis', {
        body: {
          vendor_name: vendor.name,
          vendor_criticality: vendor.criticality,
          vendor_category: vendor.category,
          assessment_score: lastAssessment?.overall_score,
          assessment_risk_level: lastAssessment?.risk_level,
          open_incidents: openIncidents.length,
          incident_severities: openIncidents.map((i) => i.severity).join(', ') || null,
          sla_compliance_rate: slaCompliance,
          contract_end_date: activeContract?.end_date,
          due_diligence_status: activeDd?.status,
          due_diligence_risk_score: activeDd?.inherent_risk_score,
        },
      });

      if (error) throw error;
      setAnalysis(data);
      setExpanded(true);
    } catch (err: any) {
      toast({ title: err?.message || 'Erro ao analisar risco', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'melhorando') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'piorando') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getRiskColor = (score: number) => {
    if (score <= 25) return 'bg-green-500';
    if (score <= 50) return 'bg-yellow-500';
    if (score <= 75) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendLabel = (trend: string) => {
    if (trend === 'melhorando') return 'Melhorando';
    if (trend === 'piorando') return 'Piorando';
    return 'Estável';
  };

  if (!analysis && !loading) {
    return (
      <div className="p-3 rounded-lg border border-border/50 bg-card/50">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleAnalyze}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Analisar Risco com IA
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Analisando com IA...</span>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Risco IA: {analysis.risk_score}/100</span>
          <div className="flex items-center gap-1">
            {getTrendIcon(analysis.trend)}
            <span className="text-xs text-muted-foreground">{getTrendLabel(analysis.trend)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Score de Risco</span>
              <span className="font-medium">{analysis.risk_score}/100</span>
            </div>
            <Progress value={analysis.risk_score} className={`h-2 [&>div]:${getRiskColor(analysis.risk_score)}`} />
          </div>

          <p className="text-xs text-muted-foreground">{analysis.summary}</p>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Principais Preocupações:
            </p>
            <ul className="text-xs space-y-1">
              {analysis.top_concerns.map((c, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-2 rounded-md bg-background border">
            <p className="text-xs font-medium text-muted-foreground mb-1">💡 Recomendação:</p>
            <p className="text-xs">{analysis.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
