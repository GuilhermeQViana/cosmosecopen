import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, Upload, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { VendorRequirement, VendorAssessmentDomain } from '@/hooks/useVendorRequirements';

interface ImportRequirementsCSVProps {
  requirements: VendorRequirement[];
  domains: VendorAssessmentDomain[];
  organizationId: string;
}

export function ImportRequirementsCSV({ requirements, domains, organizationId }: ImportRequirementsCSVProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleExport = () => {
    const header = 'codigo,nome,descricao,dominio_codigo,peso,exemplo_evidencia,ativo';
    const rows = requirements.map(r => {
      const domainCode = domains.find(d => d.id === r.domain_id)?.code || '';
      return [
        r.code,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.description || '').replace(/"/g, '""')}"`,
        domainCode,
        r.weight,
        `"${(r.evidence_example || '').replace(/"/g, '""')}"`,
        r.is_active ? 'sim' : 'nao',
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requisitos-fornecedores-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado com sucesso');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        toast.error('CSV vazio ou sem dados');
        return;
      }

      const rows = lines.slice(1).map(line => {
        const cols = line.match(/(".*?"|[^,]*)/g) || [];
        const clean = (s: string) => s.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        return {
          code: clean(cols[0] || ''),
          name: clean(cols[1] || ''),
          description: clean(cols[2] || ''),
          domain_code: clean(cols[3] || ''),
          weight: parseInt(clean(cols[4] || '1')) || 1,
          evidence_example: clean(cols[5] || ''),
          is_active: clean(cols[6] || 'sim').toLowerCase() !== 'nao',
        };
      }).filter(r => r.code && r.name);

      setPreview(rows);
      setImportOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setIsImporting(true);

    try {
      const domainMap: Record<string, string> = {};
      domains.forEach(d => { domainMap[d.code] = d.id; });

      const records = preview
        .filter(r => domainMap[r.domain_code])
        .map((r, i) => ({
          code: r.code,
          name: r.name,
          description: r.description || null,
          domain_id: domainMap[r.domain_code],
          organization_id: organizationId,
          weight: Math.min(3, Math.max(1, r.weight)),
          evidence_example: r.evidence_example || null,
          is_active: r.is_active,
          order_index: 100 + i,
        }));

      if (!records.length) {
        toast.error('Nenhum registro válido encontrado. Verifique os códigos de domínio.');
        return;
      }

      const { error } = await supabase
        .from('vendor_requirements')
        .insert(records);

      if (error) throw error;

      toast.success(`${records.length} requisitos importados com sucesso`);
      queryClient.invalidateQueries({ queryKey: ['vendor-requirements'] });
      setImportOpen(false);
      setPreview([]);
    } catch (error: any) {
      toast.error('Erro na importação: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Importar CSV
        </Button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar Requisitos</DialogTitle>
            <DialogDescription>
              {preview.length} requisito(s) encontrado(s) no CSV. Todos serão criados como customizados.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-60 overflow-y-auto space-y-2 py-2">
            {preview.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-xs">{r.code}</span>
                <span className="truncate">{r.name}</span>
                <span className="text-muted-foreground ml-auto shrink-0">{r.domain_code}</span>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancelar</Button>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Importar {preview.length} requisito(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
