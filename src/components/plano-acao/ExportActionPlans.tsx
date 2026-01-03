import { useState } from 'react';
import { ActionPlan, PRIORITY_OPTIONS, STATUS_COLUMNS } from '@/hooks/useActionPlans';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface ExportActionPlansProps {
  plans: ActionPlan[];
}

export function ExportActionPlans({ plans }: ExportActionPlansProps) {
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);
  const { toast } = useToast();

  const getPriorityLabel = (priority: string) => {
    return PRIORITY_OPTIONS.find((p) => p.value === priority)?.label || priority;
  };

  const getStatusLabel = (status: string) => {
    return STATUS_COLUMNS.find((s) => s.value === status)?.label || status;
  };

  const exportToCSV = () => {
    setIsExporting('csv');
    try {
      const headers = ['Título', 'Descrição', 'Status', 'Prioridade', 'Data Limite', 'Criado em', 'Atualizado em'];
      
      const rows = plans.map((plan) => [
        `"${plan.title.replace(/"/g, '""')}"`,
        `"${(plan.description || '').replace(/"/g, '""')}"`,
        getStatusLabel(plan.status),
        getPriorityLabel(plan.priority),
        plan.due_date ? format(new Date(plan.due_date + 'T12:00:00'), 'dd/MM/yyyy') : '',
        format(new Date(plan.created_at), 'dd/MM/yyyy HH:mm'),
        format(new Date(plan.updated_at), 'dd/MM/yyyy HH:mm'),
      ]);

      const csvContent = [
        headers.join(';'),
        ...rows.map((row) => row.join(';')),
      ].join('\n');

      // Add BOM for UTF-8
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `planos-acao-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: 'Exportação concluída', description: 'Arquivo CSV baixado com sucesso' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao exportar CSV', variant: 'destructive' });
    } finally {
      setIsExporting(null);
    }
  };

  const exportToPDF = () => {
    setIsExporting('pdf');
    try {
      const statusCounts = {
        backlog: plans.filter((p) => p.status === 'backlog').length,
        todo: plans.filter((p) => p.status === 'todo').length,
        in_progress: plans.filter((p) => p.status === 'in_progress').length,
        review: plans.filter((p) => p.status === 'review').length,
        done: plans.filter((p) => p.status === 'done').length,
      };

      const priorityCounts = {
        critica: plans.filter((p) => p.priority === 'critica').length,
        alta: plans.filter((p) => p.priority === 'alta').length,
        media: plans.filter((p) => p.priority === 'media').length,
        baixa: plans.filter((p) => p.priority === 'baixa').length,
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Planos de Ação - ${format(new Date(), 'dd/MM/yyyy')}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a2e; background: #f8fafc; }
            .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
            .header h1 { font-size: 28px; color: #1e293b; margin-bottom: 8px; }
            .header p { color: #64748b; font-size: 14px; }
            .stats { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
            .stat-card { flex: 1; min-width: 120px; background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
            .stat-card .value { font-size: 24px; font-weight: bold; color: #1e293b; }
            .stat-card .label { font-size: 12px; color: #64748b; margin-top: 4px; }
            .section { margin-bottom: 32px; }
            .section h2 { font-size: 18px; color: #1e293b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            th { background: #1e293b; color: white; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; }
            td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            tr:last-child td { border-bottom: none; }
            tr:hover { background: #f8fafc; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
            .badge-backlog { background: #e2e8f0; color: #475569; }
            .badge-todo { background: #dbeafe; color: #1e40af; }
            .badge-in_progress { background: #fef3c7; color: #92400e; }
            .badge-review { background: #e9d5ff; color: #6b21a8; }
            .badge-done { background: #dcfce7; color: #166534; }
            .badge-critica { background: #fee2e2; color: #991b1b; }
            .badge-alta { background: #ffedd5; color: #9a3412; }
            .badge-media { background: #fef9c3; color: #854d0e; }
            .badge-baixa { background: #ecfccb; color: #3f6212; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }
            @media print {
              body { padding: 20px; }
              .stat-card, table { box-shadow: none; border: 1px solid #e2e8f0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Planos de Ação</h1>
            <p>Relatório gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="value">${plans.length}</div>
              <div class="label">Total de Planos</div>
            </div>
            <div class="stat-card">
              <div class="value">${statusCounts.in_progress}</div>
              <div class="label">Em Progresso</div>
            </div>
            <div class="stat-card">
              <div class="value">${statusCounts.done}</div>
              <div class="label">Concluídos</div>
            </div>
            <div class="stat-card">
              <div class="value">${priorityCounts.critica + priorityCounts.alta}</div>
              <div class="label">Alta Prioridade</div>
            </div>
          </div>

          <div class="section">
            <h2>Lista de Planos de Ação</h2>
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Status</th>
                  <th>Prioridade</th>
                  <th>Data Limite</th>
                </tr>
              </thead>
              <tbody>
                ${plans.map((plan) => `
                  <tr>
                    <td>
                      <strong>${plan.title}</strong>
                      ${plan.description ? `<br><small style="color: #64748b;">${plan.description.substring(0, 100)}${plan.description.length > 100 ? '...' : ''}</small>` : ''}
                    </td>
                    <td><span class="badge badge-${plan.status}">${getStatusLabel(plan.status)}</span></td>
                    <td><span class="badge badge-${plan.priority}">${getPriorityLabel(plan.priority)}</span></td>
                    <td>${plan.due_date ? format(new Date(plan.due_date + 'T12:00:00'), 'dd/MM/yyyy') : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>CosmoSec GRC Platform</p>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }

      toast({ title: 'Exportação iniciada', description: 'Use Ctrl+P ou Cmd+P para salvar como PDF' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao gerar PDF', variant: 'destructive' });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-background/50">
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border">
        <DropdownMenuItem onClick={exportToCSV} disabled={!!isExporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} disabled={!!isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
