import { useState, useMemo } from 'react';
import { AnimatedItem, StaggeredGrid } from '@/components/ui/staggered-list';
import {
  useEvidences,
  useDeleteEvidence,
  useDownloadEvidence,
  Evidence,
  CLASSIFICATION_OPTIONS,
} from '@/hooks/useEvidences';
import { useMoveEvidenceToFolder } from '@/hooks/useEvidenceFolders';
import { UploadEvidenceDialog } from '@/components/evidencias/UploadEvidenceDialog';
import { EvidenceCard } from '@/components/evidencias/EvidenceCard';
import { EvidenceStats } from '@/components/evidencias/EvidenceStats';
import { EvidenceFolderTree } from '@/components/evidencias/EvidenceFolderTree';
import { EvidencePreviewDialog } from '@/components/evidencias/EvidencePreviewDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton, SkeletonCard, PageLoader } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, FileCheck, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Evidencias() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [deleteEvidence, setDeleteEvidence] = useState<Evidence | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null);

  const { toast } = useToast();
  const { data: evidences, isLoading } = useEvidences();
  const deleteEvidenceMutation = useDeleteEvidence();
  const downloadEvidence = useDownloadEvidence();

  // Count evidences by folder
  const evidenceCountByFolder = useMemo(() => {
    const counts: Record<string, number> = { root: 0 };
    evidences?.forEach((e) => {
      const folderId = (e as any).folder_id;
      if (folderId) {
        counts[folderId] = (counts[folderId] || 0) + 1;
      }
      counts.root++;
    });
    return counts;
  }, [evidences]);

  const filteredEvidences = evidences?.filter((evidence) => {
    const matchesSearch =
      evidence.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evidence.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesClassification =
      classificationFilter === 'all' || evidence.classification === classificationFilter;
    const matchesFolder = selectedFolderId === null || (evidence as any).folder_id === selectedFolderId;
    return matchesSearch && matchesClassification && matchesFolder;
  }) || [];

  const handleDelete = async () => {
    if (!deleteEvidence) return;
    try {
      await deleteEvidenceMutation.mutateAsync(deleteEvidence);
      toast({ title: 'Evidência excluída com sucesso' });
      setDeleteEvidence(null);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir a evidência', variant: 'destructive' });
    }
  };

  const handleDownload = async (evidence: Evidence) => {
    try {
      await downloadEvidence.mutateAsync(evidence);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível baixar o arquivo', variant: 'destructive' });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] relative">
      {/* Cosmic background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-chart-2/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <AnimatedItem animation="fade-up" delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              Cofre de Evidências
            </h1>
            <p className="text-muted-foreground">Gerencie documentos e evidências de conformidade</p>
          </div>
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Evidência
          </Button>
        </div>
      </AnimatedItem>

      <AnimatedItem animation="fade-up" delay={50}>
        {evidences && <EvidenceStats evidences={evidences} />}
      </AnimatedItem>

      <ResizablePanelGroup direction="horizontal" className="mt-6 rounded-lg border">
        {/* Folder Tree */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <EvidenceFolderTree
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            evidenceCountByFolder={evidenceCountByFolder}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Evidence Grid */}
        <ResizablePanel defaultSize={80}>
          <div className="p-4 space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome ou tag..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Classificação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {CLASSIFICATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', opt.color)} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredEvidences.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma evidência encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || classificationFilter !== 'all' || selectedFolderId ? 'Tente ajustar os filtros' : 'Comece enviando a primeira evidência'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <StaggeredGrid columns={3} staggerDelay={60} animation="scale-in" className="gap-4">
                {filteredEvidences.map((evidence) => (
                  <EvidenceCard key={evidence.id} evidence={evidence} onDelete={setDeleteEvidence} onPreview={setPreviewEvidence} />
                ))}
              </StaggeredGrid>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <UploadEvidenceDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <EvidencePreviewDialog evidence={previewEvidence} open={!!previewEvidence} onOpenChange={(open) => !open && setPreviewEvidence(null)} onDownload={handleDownload} />
      
      <AlertDialog open={!!deleteEvidence} onOpenChange={(open) => !open && setDeleteEvidence(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Evidência</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir "{deleteEvidence?.name}"? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
