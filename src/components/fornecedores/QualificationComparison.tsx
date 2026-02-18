import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQualificationCampaigns, QualificationCampaign } from '@/hooks/useQualificationCampaigns';
import { useQualificationResponses } from '@/hooks/useQualificationResponses';
import { BarChart3, AlertTriangle, Trophy, Users } from 'lucide-react';

interface QualificationComparisonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ResponseColumn({ campaignId, questionIds }: { campaignId: string; questionIds: string[] }) {
  const { data: responses } = useQualificationResponses(campaignId);
  const responseMap = useMemo(() => {
    const map: Record<string, { answer: string; score: number; maxWeight: number }> = {};
    responses?.forEach(r => {
      const q = r.qualification_questions;
      const answer = r.answer_text || (r.answer_option as any)?.label || (r.answer_option as any)?.value || (r.answer_file_url ? '📎 Anexo' : '—');
      map[r.question_id] = { answer, score: r.score_awarded ?? 0, maxWeight: q?.weight ?? 0 };
    });
    return map;
  }, [responses]);

  return (
    <>
      {questionIds.map(qId => {
        const r = responseMap[qId];
        if (!r) return <td key={qId} className="p-2 text-xs text-muted-foreground italic border-b border-border/30">—</td>;
        const pct = r.maxWeight > 0 ? (r.score / r.maxWeight) * 100 : 0;
        return (
          <td key={qId} className="p-2 border-b border-border/30">
            <p className="text-xs truncate max-w-[140px]" title={r.answer}>{r.answer}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex-1 bg-muted/50 rounded-full h-1">
                <div className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">{r.score.toFixed(1)}</span>
            </div>
          </td>
        );
      })}
    </>
  );
}

export function QualificationComparison({ open, onOpenChange }: QualificationComparisonProps) {
  const { data: allCampaigns } = useQualificationCampaigns();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Only campaigns with scores
  const scoredCampaigns = useMemo(() =>
    allCampaigns?.filter(c => c.score !== null && ['em_analise', 'aprovado', 'reprovado'].includes(c.status)) || []
  , [allCampaigns]);

  // Group by template
  const templateGroups = useMemo(() => {
    const groups: Record<string, QualificationCampaign[]> = {};
    scoredCampaigns.forEach(c => {
      const key = c.template_id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  }, [scoredCampaigns]);

  // Only templates with 2+ campaigns
  const comparableTemplates = useMemo(() =>
    Object.entries(templateGroups).filter(([, camps]) => camps.length >= 2)
  , [templateGroups]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const availableCampaigns = selectedTemplate ? (templateGroups[selectedTemplate] || []) : [];

  // Get questions from first campaign's responses
  const firstSelected = selectedIds[0] || availableCampaigns[0]?.id;
  const { data: firstResponses } = useQualificationResponses(firstSelected);

  const questions = useMemo(() => {
    if (!firstResponses?.length) return [];
    return firstResponses
      .filter(r => r.qualification_questions)
      .sort((a, b) => (a.qualification_questions!.order_index ?? 0) - (b.qualification_questions!.order_index ?? 0))
      .map(r => ({ id: r.question_id, label: r.qualification_questions!.label, weight: r.qualification_questions!.weight, isKo: r.qualification_questions!.is_ko }));
  }, [firstResponses]);

  const selectedCampaigns = availableCampaigns.filter(c => selectedIds.includes(c.id));

  const toggleCampaign = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? prev : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-space flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Comparativo de Qualificação
          </DialogTitle>
          <DialogDescription>Compare as respostas de até 3 fornecedores que responderam o mesmo template</DialogDescription>
        </DialogHeader>

        {comparableTemplates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>É necessário ter ao menos 2 campanhas com score calculado para o mesmo template.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Template selector */}
            <Select value={selectedTemplate} onValueChange={v => { setSelectedTemplate(v); setSelectedIds([]); }}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Selecione o template para comparar" />
              </SelectTrigger>
              <SelectContent>
                {comparableTemplates.map(([tId, camps]) => (
                  <SelectItem key={tId} value={tId}>
                    {camps[0].qualification_templates?.name || 'Template'} ({camps.length} campanhas)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Campaign picker */}
            {selectedTemplate && (
              <div className="flex flex-wrap gap-2">
                {availableCampaigns.map(c => {
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <Badge
                      key={c.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer text-xs py-1.5 px-3"
                      onClick={() => toggleCampaign(c.id)}
                    >
                      {c.vendors?.name || 'Fornecedor'} — {c.score}%
                      {c.ko_triggered && <AlertTriangle className="h-3 w-3 ml-1 text-red-500" />}
                    </Badge>
                  );
                })}
                <span className="text-xs text-muted-foreground self-center ml-2">
                  {selectedIds.length}/3 selecionados
                </span>
              </div>
            )}

            {/* Comparison Table */}
            {selectedCampaigns.length >= 2 && questions.length > 0 && (
              <ScrollArea className="max-h-[50vh]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background z-10">
                    <tr>
                      <th className="text-left p-2 text-xs text-muted-foreground font-medium border-b border-border/50 min-w-[180px]">Pergunta</th>
                      {selectedCampaigns.map(c => (
                        <th key={c.id} className="text-left p-2 border-b border-border/50 min-w-[160px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium truncate">{c.vendors?.name}</span>
                            <Badge variant="outline" className={`text-[10px] ${(c.score ?? 0) >= 81 ? 'text-green-500 border-green-500/20' : (c.score ?? 0) >= 51 ? 'text-yellow-500 border-yellow-500/20' : 'text-red-500 border-red-500/20'}`}>
                              {c.score}%
                            </Badge>
                            {c.ko_triggered && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, idx) => (
                      <tr key={q.id} className="hover:bg-muted/20">
                        <td className="p-2 border-b border-border/30">
                          <p className="text-xs font-medium flex items-center gap-1">
                            <span className="text-muted-foreground font-mono">Q{idx + 1}</span>
                            {q.label}
                            {q.isKo && <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-500 border-red-500/20 ml-1">KO</Badge>}
                          </p>
                          <span className="text-[10px] text-muted-foreground">Peso: {q.weight}</span>
                        </td>
                        {selectedCampaigns.map(c => (
                          <ResponseColumn key={c.id} campaignId={c.id} questionIds={[q.id]} />
                        ))}
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="bg-muted/30 font-medium">
                      <td className="p-2 text-xs flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-primary" /> Score Total
                      </td>
                      {selectedCampaigns.map(c => (
                        <td key={c.id} className="p-2">
                          <span className={`text-sm font-bold font-space ${(c.score ?? 0) >= 81 ? 'text-green-500' : (c.score ?? 0) >= 51 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {c.score}%
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}