import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Send
} from 'lucide-react';
import { useUpdateVendorAssessment, VendorAssessment } from '@/hooks/useVendorAssessments';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AssessmentApprovalWorkflowProps {
  assessment: VendorAssessment;
  onApproved?: () => void;
  onRejected?: () => void;
}

export function AssessmentApprovalWorkflow({ 
  assessment,
  onApproved,
  onRejected
}: AssessmentApprovalWorkflowProps) {
  const { user } = useAuth();
  const { data: teamMembers = [] } = useTeamMembers();
  const updateAssessment = useUpdateVendorAssessment();
  
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const assessedByMember = teamMembers.find(m => m.user_id === assessment.assessed_by);
  const approvedByMember = teamMembers.find(m => m.user_id === assessment.approved_by);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await updateAssessment.mutateAsync({
        id: assessment.id,
        status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        notes: comments ? `${assessment.notes || ''}\n\n[Aprovação]: ${comments}` : assessment.notes,
      });
      toast.success('Avaliação aprovada com sucesso!');
      setApproveDialogOpen(false);
      setComments('');
      onApproved?.();
    } catch (error: any) {
      console.error('Error approving assessment:', error);
      toast.error('Erro ao aprovar avaliação: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      toast.error('Informe o motivo da rejeição');
      return;
    }

    setIsProcessing(true);
    try {
      await updateAssessment.mutateAsync({
        id: assessment.id,
        status: 'rejected',
        notes: `${assessment.notes || ''}\n\n[Rejeição]: ${comments}`,
      });
      toast.success('Avaliação rejeitada. O avaliador será notificado.');
      setRejectDialogOpen(false);
      setComments('');
      onRejected?.();
    } catch (error: any) {
      console.error('Error rejecting assessment:', error);
      toast.error('Erro ao rejeitar avaliação: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendForApproval = async () => {
    setIsProcessing(true);
    try {
      await updateAssessment.mutateAsync({
        id: assessment.id,
        status: 'pending_approval',
      });
      toast.success('Avaliação enviada para aprovação!');
    } catch (error: any) {
      console.error('Error sending for approval:', error);
      toast.error('Erro ao enviar para aprovação: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusInfo = () => {
    switch (assessment.status) {
      case 'draft':
        return {
          label: 'Rascunho',
          color: 'bg-muted text-muted-foreground',
          icon: Clock,
        };
      case 'in_progress':
        return {
          label: 'Em Andamento',
          color: 'bg-blue-500/20 text-blue-600',
          icon: Clock,
        };
      case 'completed':
        return {
          label: 'Concluída',
          color: 'bg-amber-500/20 text-amber-600',
          icon: CheckCircle2,
        };
      case 'pending_approval':
        return {
          label: 'Aguardando Aprovação',
          color: 'bg-purple-500/20 text-purple-600',
          icon: UserCheck,
        };
      case 'approved':
        return {
          label: 'Aprovada',
          color: 'bg-green-500/20 text-green-600',
          icon: CheckCircle2,
        };
      case 'rejected':
        return {
          label: 'Rejeitada',
          color: 'bg-red-500/20 text-red-600',
          icon: XCircle,
        };
      default:
        return {
          label: assessment.status,
          color: 'bg-muted text-muted-foreground',
          icon: Clock,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const canApprove = assessment.status === 'pending_approval' || assessment.status === 'completed';
  const canSendForApproval = assessment.status === 'completed';

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
        <div className={cn('p-2 rounded-lg', statusInfo.color.split(' ')[0])}>
          <StatusIcon className={cn('h-5 w-5', statusInfo.color.split(' ')[1])} />
        </div>
        <div className="flex-1">
          <p className="font-medium">Status da Avaliação</p>
          <p className="text-sm text-muted-foreground">
            <Badge className={cn(statusInfo.color, 'mr-2')}>
              {statusInfo.label}
            </Badge>
            {assessment.assessment_date && (
              <span>
                Realizada em {format(new Date(assessment.assessment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Assessor Info */}
      {assessedByMember && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
          <Avatar className="h-8 w-8">
            <AvatarImage src={assessedByMember.profile?.avatar_url || undefined} />
            <AvatarFallback>{assessedByMember.profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{assessedByMember.profile?.full_name || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground">Avaliador</p>
          </div>
        </div>
      )}

      {/* Approver Info */}
      {assessment.status === 'approved' && approvedByMember && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <Avatar className="h-8 w-8">
            <AvatarImage src={approvedByMember.profile?.avatar_url || undefined} />
            <AvatarFallback>{approvedByMember.profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-600">{approvedByMember.profile?.full_name || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground">
              Aprovado em {assessment.approved_at && format(new Date(assessment.approved_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {canSendForApproval && (
          <Button 
            variant="outline" 
            onClick={handleSendForApproval}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar para Aprovação
          </Button>
        )}
        
        {canApprove && (
          <>
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setApproveDialogOpen(true)}
              disabled={isProcessing}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-600/30 hover:bg-red-600/10"
              onClick={() => setRejectDialogOpen(true)}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
          </>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Aprovar Avaliação
            </DialogTitle>
            <DialogDescription>
              Ao aprovar, você confirma que a avaliação está correta e pode ser registrada oficialmente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comentários (opcional)</label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Adicione comentários ou observações..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Rejeitar Avaliação
            </AlertDialogTitle>
            <AlertDialogDescription>
              A avaliação será devolvida ao avaliador para correções. 
              Informe o motivo da rejeição.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Motivo da rejeição (obrigatório)..."
              rows={4}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isProcessing || !comments.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
