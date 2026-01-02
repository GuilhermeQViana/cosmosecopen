import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActionPlanCounts } from '@/hooks/useAssessmentActionPlans';
import { ListTodo, ExternalLink, Plus } from 'lucide-react';

interface ControlActionPlansProps {
  assessmentId: string | undefined;
  controlCode: string;
  controlName: string;
}

export function ControlActionPlans({
  assessmentId,
  controlCode,
  controlName,
}: ControlActionPlansProps) {
  const navigate = useNavigate();
  const counts = useActionPlanCounts(assessmentId);

  const handleCreateActionPlan = () => {
    const params = new URLSearchParams({
      fromAssessment: assessmentId || '',
      controlCode,
      controlName,
    });
    navigate(`/plano-acao?${params.toString()}`);
  };

  const handleViewPlans = () => {
    navigate('/plano-acao');
  };

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateActionPlan}
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        Criar Plano de Ação
      </Button>

      {counts.total > 0 && (
        <div
          className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleViewPlans}
        >
          <ListTodo className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{counts.total} plano(s)</span>
          {counts.pending > 0 && (
            <Badge variant="secondary" className="text-xs">
              {counts.pending} pendente(s)
            </Badge>
          )}
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
