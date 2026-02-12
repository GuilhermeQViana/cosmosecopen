import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

export default function Politicas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-space">Central de Políticas</h1>
          <p className="text-muted-foreground mt-1">Repositório unificado de políticas corporativas</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Política
        </Button>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-16 h-16 text-emerald-500/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma política criada</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Comece criando sua primeira política ou use um modelo da biblioteca de templates.
          </p>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Criar Política
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
