import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useControls } from '@/hooks/useControls';
import { useAssessments } from '@/hooks/useAssessments';
import { useRisks } from '@/hooks/useRisks';
import { useEvidences } from '@/hooks/useEvidences';
import { useActionPlans } from '@/hooks/useActionPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Check, 
  Circle, 
  ArrowRight, 
  Shield, 
  AlertTriangle, 
  FileCheck, 
  ListTodo,
  Sparkles,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  isComplete: boolean;
}

const CHECKLIST_DISMISSED_KEY = 'cora-checklist-dismissed';

export function OnboardingChecklist() {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);
  
  const { data: controls = [] } = useControls();
  const { data: assessments = [] } = useAssessments();
  const { data: risks = [] } = useRisks();
  const { data: evidences = [] } = useEvidences();
  const { data: actionPlans = [] } = useActionPlans();

  useEffect(() => {
    const dismissed = localStorage.getItem(CHECKLIST_DISMISSED_KEY);
    if (dismissed) setIsDismissed(true);
  }, []);

  const checklistItems: ChecklistItem[] = [
    {
      id: 'assess-control',
      title: 'Avaliar primeiro controle',
      description: 'Defina o nível de maturidade de um controle',
      icon: Shield,
      path: '/diagnostico',
      isComplete: assessments.some(a => a.maturity_level !== '0'),
    },
    {
      id: 'create-risk',
      title: 'Cadastrar um risco',
      description: 'Registre um risco de segurança identificado',
      icon: AlertTriangle,
      path: '/riscos',
      isComplete: risks.length > 0,
    },
    {
      id: 'upload-evidence',
      title: 'Enviar uma evidência',
      description: 'Faça upload de um documento comprobatório',
      icon: FileCheck,
      path: '/evidencias',
      isComplete: evidences.length > 0,
    },
    {
      id: 'create-action',
      title: 'Criar plano de ação',
      description: 'Defina ações para tratar gaps de conformidade',
      icon: ListTodo,
      path: '/plano-acao',
      isComplete: actionPlans.length > 0,
    },
  ];

  const completedCount = checklistItems.filter(item => item.isComplete).length;
  const progress = (completedCount / checklistItems.length) * 100;
  const allComplete = completedCount === checklistItems.length;

  const handleDismiss = () => {
    localStorage.setItem(CHECKLIST_DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  if (isDismissed || allComplete) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Configure sua Organização</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {completedCount}/{checklistItems.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-colors',
              item.isComplete 
                ? 'bg-muted/50' 
                : 'bg-background hover:bg-muted/50 cursor-pointer'
            )}
            onClick={() => !item.isComplete && navigate(item.path)}
          >
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
              item.isComplete 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
            )}>
              {item.isComplete ? (
                <Check className="h-4 w-4" />
              ) : (
                <item.icon className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'font-medium text-sm',
                item.isComplete && 'line-through text-muted-foreground'
              )}>
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            </div>
            {!item.isComplete && (
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
