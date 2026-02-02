import { useState, useMemo } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { VendorEvidenceTree } from '@/components/fornecedores/VendorEvidenceTree';
import { VendorEvidenceStats } from '@/components/fornecedores/VendorEvidenceStats';
import { VendorEvidenceCard } from '@/components/fornecedores/VendorEvidenceCard';
import { VendorEvidencePreview } from '@/components/fornecedores/VendorEvidencePreview';
import { VendorEvidenceUploadVault } from '@/components/fornecedores/VendorEvidenceUploadVault';
import { useVendorEvidenceVault, VendorEvidenceVault, VendorEvidenceCategory, VendorEvidenceClassification } from '@/hooks/useVendorEvidenceVault';
import { useVendors } from '@/hooks/useVendors';

const categoryOptions: { value: VendorEvidenceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas categorias' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'certificacao', label: 'Certificação' },
  { value: 'ddq', label: 'DDQ' },
  { value: 'politica', label: 'Política' },
  { value: 'sla', label: 'SLA' },
  { value: 'auditoria', label: 'Auditoria' },
  { value: 'outro', label: 'Outro' },
];

const classificationOptions: { value: VendorEvidenceClassification | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas classificações' },
  { value: 'publico', label: 'Público' },
  { value: 'interno', label: 'Interno' },
  { value: 'confidencial', label: 'Confidencial' },
];

export default function VendorEvidencias() {
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  
  const {
    evidences, 
    isLoading: evidencesLoading, 
    evidenceCountsByVendor,
    deleteEvidence,
    downloadFile,
  } = useVendorEvidenceVault(selectedVendorId || undefined);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<VendorEvidenceCategory | 'all'>('all');
  const [classificationFilter, setClassificationFilter] = useState<VendorEvidenceClassification | 'all'>('all');
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [previewEvidence, setPreviewEvidence] = useState<VendorEvidenceVault | null>(null);

  const selectedVendor = vendors?.find((v) => v.id === selectedVendorId);

  const filteredEvidences = useMemo(() => {
    if (!evidences) return [];
    
    return evidences.filter((evidence) => {
      const matchesSearch = !searchQuery || 
        evidence.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evidence.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evidence.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || evidence.category === categoryFilter;
      const matchesClassification = classificationFilter === 'all' || evidence.classification === classificationFilter;
      
      return matchesSearch && matchesCategory && matchesClassification;
    });
  }, [evidences, searchQuery, categoryFilter, classificationFilter]);

  const vendorsById = useMemo(() => {
    const map: Record<string, { name: string; code: string }> = {};
    vendors?.forEach((v) => {
      map[v.id] = { name: v.name, code: v.code };
    });
    return map;
  }, [vendors]);

  const handleDownload = async (evidence: VendorEvidenceVault) => {
    try {
      await downloadFile(evidence.file_path, evidence.name);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cofre de Evidências</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie documentos e evidências dos fornecedores
            </p>
          </div>
          <Button
            onClick={() => setShowUploadDialog(true)}
            disabled={!selectedVendorId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Evidência
          </Button>
        </div>

        {/* Stats */}
        <VendorEvidenceStats 
          evidences={filteredEvidences} 
          isLoading={evidencesLoading} 
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar - Vendor Tree */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full border-r">
              <div className="p-3 border-b">
                <h3 className="text-sm font-medium text-muted-foreground">Fornecedores</h3>
              </div>
              <VendorEvidenceTree
                vendors={vendors || []}
                selectedVendorId={selectedVendorId}
                onSelectVendor={setSelectedVendorId}
                evidenceCounts={evidenceCountsByVendor || {}}
                isLoading={vendorsLoading}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main panel - Evidence grid */}
          <ResizablePanel defaultSize={75}>
            <div className="h-full flex flex-col">
              {/* Filters */}
              <div className="p-4 border-b flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar evidências..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as VendorEvidenceCategory | 'all')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={classificationFilter} onValueChange={(v) => setClassificationFilter(v as VendorEvidenceClassification | 'all')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classificationOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Evidence grid */}
              <div className="flex-1 overflow-auto p-4">
                {evidencesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : filteredEvidences.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                    <FileText className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Nenhuma evidência encontrada</p>
                    <p className="text-sm">
                      {selectedVendorId
                        ? 'Clique em "Nova Evidência" para adicionar'
                        : 'Selecione um fornecedor para ver as evidências'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEvidences.map((evidence) => (
                      <VendorEvidenceCard
                        key={evidence.id}
                        evidence={evidence}
                        vendorName={!selectedVendorId ? vendorsById[evidence.vendor_id]?.name : undefined}
                        onPreview={() => setPreviewEvidence(evidence)}
                        onDownload={() => handleDownload(evidence)}
                        onDelete={() => deleteEvidence.mutate(evidence.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Upload dialog */}
      {selectedVendor && (
        <VendorEvidenceUploadVault
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          vendorId={selectedVendor.id}
          vendorName={selectedVendor.name}
        />
      )}

      {/* Preview dialog */}
      <VendorEvidencePreview
        evidence={previewEvidence}
        open={!!previewEvidence}
        onOpenChange={(open) => !open && setPreviewEvidence(null)}
        onDownload={() => previewEvidence && handleDownload(previewEvidence)}
      />
    </div>
  );
}
