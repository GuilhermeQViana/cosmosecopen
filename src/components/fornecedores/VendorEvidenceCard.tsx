import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  Tag,
  Globe,
  Shield,
  Lock,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { VendorEvidenceVault, VendorEvidenceCategory, VendorEvidenceClassification } from '@/hooks/useVendorEvidenceVault';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const categoryLabels: Record<VendorEvidenceCategory, string> = {
  contrato: 'Contrato',
  certificacao: 'Certificação',
  ddq: 'DDQ',
  politica: 'Política',
  sla: 'SLA',
  auditoria: 'Auditoria',
  outro: 'Outro',
};

const categoryColors: Record<VendorEvidenceCategory, string> = {
  contrato: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  certificacao: 'bg-green-500/10 text-green-600 border-green-500/30',
  ddq: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  politica: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  sla: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
  auditoria: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  outro: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
};

const classificationIcons: Record<VendorEvidenceClassification, typeof Globe> = {
  publico: Globe,
  interno: Shield,
  confidencial: Lock,
};

const classificationColors: Record<VendorEvidenceClassification, string> = {
  publico: 'text-green-500',
  interno: 'text-yellow-500',
  confidencial: 'text-red-500',
};

interface VendorEvidenceCardProps {
  evidence: VendorEvidenceVault;
  vendorName?: string;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export function VendorEvidenceCard({
  evidence,
  vendorName,
  onPreview,
  onDownload,
  onDelete,
}: VendorEvidenceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const ClassificationIcon = classificationIcons[evidence.classification as VendorEvidenceClassification] || Shield;
  const isExpiringSoon = evidence.expires_at && differenceInDays(parseISO(evidence.expires_at), new Date()) <= 30;
  const isExpired = evidence.expires_at && differenceInDays(parseISO(evidence.expires_at), new Date()) < 0;

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = () => {
    const type = evidence.file_type?.toLowerCase() || '';
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    return '📎';
  };

  return (
    <>
      <Card className={cn(
        'group hover:shadow-md transition-all duration-200',
        isExpired && 'border-red-500/50 bg-red-500/5',
        isExpiringSoon && !isExpired && 'border-amber-500/50 bg-amber-500/5'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* File icon */}
            <div className="text-3xl">{getFileIcon()}</div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-medium truncate">{evidence.name}</h4>
                  {vendorName && (
                    <p className="text-xs text-muted-foreground truncate">{vendorName}</p>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onPreview}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Description */}
              {evidence.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {evidence.description}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <Badge 
                  variant="outline" 
                  className={categoryColors[evidence.category as VendorEvidenceCategory] || categoryColors.outro}
                >
                  {categoryLabels[evidence.category as VendorEvidenceCategory] || 'Outro'}
                </Badge>
                
                <Badge variant="outline" className="gap-1">
                  <ClassificationIcon className={cn('h-3 w-3', classificationColors[evidence.classification as VendorEvidenceClassification])} />
                  {evidence.classification}
                </Badge>
              </div>

              {/* Tags */}
              {evidence.tags && evidence.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {evidence.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                  {evidence.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{evidence.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>{formatFileSize(evidence.file_size)}</span>
                
                {evidence.expires_at && (
                  <div className={cn(
                    'flex items-center gap-1',
                    isExpired && 'text-red-500',
                    isExpiringSoon && !isExpired && 'text-amber-500'
                  )}>
                    {(isExpired || isExpiringSoon) && <AlertTriangle className="h-3 w-3" />}
                    <Calendar className="h-3 w-3" />
                    <span>
                      {isExpired ? 'Expirado' : format(parseISO(evidence.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evidência</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{evidence.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
