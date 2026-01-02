import { Evidence, CLASSIFICATION_OPTIONS, formatFileSize, getFileIcon, useDownloadEvidence } from '@/hooks/useEvidences';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, Trash2, Calendar, Clock, Loader2 } from 'lucide-react';

interface EvidenceCardProps {
  evidence: Evidence;
  onDelete: (evidence: Evidence) => void;
  onPreview?: (evidence: Evidence) => void;
}

export function EvidenceCard({ evidence, onDelete, onPreview }: EvidenceCardProps) {
  const downloadEvidence = useDownloadEvidence();

  const classificationConfig = CLASSIFICATION_OPTIONS.find(
    (c) => c.value === evidence.classification
  );

  const isExpired = evidence.expires_at && new Date(evidence.expires_at) < new Date();
  const isExpiringSoon = evidence.expires_at && !isExpired && 
    new Date(evidence.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div 
          className="flex items-start gap-3 cursor-pointer" 
          onClick={() => onPreview?.(evidence)}
        >
          {/* File Icon */}
          <div className="text-3xl">{getFileIcon(evidence.file_type)}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{evidence.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(evidence.file_size)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => downloadEvidence.mutate(evidence)}
                  disabled={downloadEvidence.isPending}
                  title="Download"
                >
                  {downloadEvidence.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(evidence)}
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {evidence.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {evidence.description}
              </p>
            )}

            {/* Tags */}
            {evidence.tags && evidence.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {evidence.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
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
            <div className="flex items-center justify-between mt-3 pt-2 border-t">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  classificationConfig?.value === 'publico' && 'border-green-500 text-green-600',
                  classificationConfig?.value === 'interno' && 'border-yellow-500 text-yellow-600',
                  classificationConfig?.value === 'confidencial' && 'border-red-500 text-red-600'
                )}
              >
                {classificationConfig?.label || evidence.classification}
              </Badge>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {evidence.expires_at && (
                  <div
                    className={cn(
                      'flex items-center gap-1',
                      isExpired && 'text-destructive',
                      isExpiringSoon && !isExpired && 'text-orange-500'
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    {isExpired ? 'Expirado' : format(new Date(evidence.expires_at), 'dd/MM/yyyy')}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(evidence.created_at), 'dd/MM/yy', { locale: ptBR })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
