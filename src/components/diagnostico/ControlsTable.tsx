import { useState } from 'react';
import { Control } from '@/hooks/useControls';
import { Assessment } from '@/hooks/useAssessments';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Edit,
  AlertTriangle,
  ListTodo,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type MaturityLevel = Database['public']['Enums']['maturity_level'];
type ConformityStatus = Database['public']['Enums']['conformity_status'];

interface ControlsTableProps {
  controls: Control[];
  assessments: Assessment[];
  onEditControl: (control: Control, assessment?: Assessment) => void;
}

type SortField = 'code' | 'name' | 'status' | 'maturity' | 'date';
type SortDirection = 'asc' | 'desc';

const STATUS_CONFIG: Record<ConformityStatus, { label: string; className: string }> = {
  conforme: { label: 'Conforme', className: 'badge-conforme' },
  parcial: { label: 'Parcial', className: 'badge-parcial' },
  nao_conforme: { label: 'Não Conforme', className: 'badge-nao-conforme' },
  nao_aplicavel: { label: 'N/A', className: 'bg-muted text-muted-foreground' },
};

export function ControlsTable({ controls, assessments, onEditControl }: ControlsTableProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const assessmentMap = new Map(assessments.map((a) => [a.control_id, a]));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedControls = [...controls].sort((a, b) => {
    const aAssessment = assessmentMap.get(a.id);
    const bAssessment = assessmentMap.get(b.id);
    
    let comparison = 0;
    
    switch (sortField) {
      case 'code':
        comparison = a.code.localeCompare(b.code);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'status':
        const aStatus = aAssessment?.status || 'nao_conforme';
        const bStatus = bAssessment?.status || 'nao_conforme';
        comparison = aStatus.localeCompare(bStatus);
        break;
      case 'maturity':
        const aMat = parseInt(aAssessment?.maturity_level || '0');
        const bMat = parseInt(bAssessment?.maturity_level || '0');
        comparison = aMat - bMat;
        break;
      case 'date':
        const aDate = aAssessment?.assessed_at || aAssessment?.updated_at || '';
        const bDate = bAssessment?.assessed_at || bAssessment?.updated_at || '';
        comparison = aDate.localeCompare(bDate);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const getMaturityColor = (level: string) => {
    const num = parseInt(level);
    if (num <= 1) return 'text-destructive';
    if (num <= 2) return 'text-[hsl(var(--warning))]';
    if (num <= 3) return 'text-[hsl(var(--parcial))]';
    return 'text-[hsl(var(--conforme))]';
  };

  const handleCreateRisk = (control: Control) => {
    navigate(`/riscos?action=new&controlCode=${encodeURIComponent(control.code)}&controlName=${encodeURIComponent(control.name)}`);
  };

  const handleCreateActionPlan = (control: Control, assessment?: Assessment) => {
    const params = new URLSearchParams({
      action: 'new',
      controlCode: control.code,
      controlName: control.name,
    });
    if (assessment?.id) {
      params.set('assessmentId', assessment.id);
    }
    navigate(`/plano-acao?${params.toString()}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">
              <button
                onClick={() => handleSort('code')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Código
                <SortIcon field="code" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('name')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Nome
                <SortIcon field="name" />
              </button>
            </TableHead>
            <TableHead className="w-[130px]">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Status
                <SortIcon field="status" />
              </button>
            </TableHead>
            <TableHead className="w-[150px]">
              <button
                onClick={() => handleSort('maturity')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Maturidade
                <SortIcon field="maturity" />
              </button>
            </TableHead>
            <TableHead className="w-[130px]">
              <button
                onClick={() => handleSort('date')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Avaliado em
                <SortIcon field="date" />
              </button>
            </TableHead>
            <TableHead className="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedControls.map((control) => {
            const assessment = assessmentMap.get(control.id);
            const status = assessment?.status || 'nao_conforme';
            const statusConfig = STATUS_CONFIG[status];
            const maturityLevel = assessment?.maturity_level || '0';
            const maturityPercent = (parseInt(maturityLevel) / 5) * 100;
            const assessedDate = assessment?.assessed_at || assessment?.updated_at;
            const isNonConformant = status === 'nao_conforme' || status === 'parcial';

            return (
              <TableRow key={control.id} className="group">
                <TableCell className="font-mono text-sm">{control.code}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{control.name}</p>
                    {control.category && (
                      <p className="text-xs text-muted-foreground">{control.category}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn('text-xs', statusConfig.className)}>
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={maturityPercent} className="h-2 w-16" />
                    <span className={cn('text-sm font-medium', getMaturityColor(maturityLevel))}>
                      {maturityLevel}/5
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {assessedDate
                    ? format(new Date(assessedDate), 'dd/MM/yyyy', { locale: ptBR })
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEditControl(control, assessment)}
                      title="Editar avaliação"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {isNonConformant && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleCreateRisk(control)}
                          title="Criar risco"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary"
                          onClick={() => handleCreateActionPlan(control, assessment)}
                          title="Criar plano de ação"
                        >
                          <ListTodo className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
