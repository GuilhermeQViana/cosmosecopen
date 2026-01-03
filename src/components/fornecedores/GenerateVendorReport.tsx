import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GenerateVendorReportProps {
  assessmentId: string;
  vendorName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function GenerateVendorReport({ 
  assessmentId, 
  vendorName,
  variant = 'outline',
  size = 'sm'
}: GenerateVendorReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      const response = await supabase.functions.invoke('generate-vendor-report', {
        body: { assessmentId },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Create a blob from the HTML response
      const htmlContent = response.data;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      // Open in new window for printing/saving as PDF
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          // Auto-trigger print dialog for PDF saving
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }

      toast.success('Relatório gerado! Use Ctrl+P para salvar como PDF.');
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleGenerate}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Relatório PDF
        </>
      )}
    </Button>
  );
}
