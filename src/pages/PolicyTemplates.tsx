import { Card, CardContent } from '@/components/ui/card';
import { BookTemplate } from 'lucide-react';

export default function PolicyTemplates() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-space">Biblioteca de Modelos</h1>
        <p className="text-muted-foreground mt-1">Templates pré-carregados e modelos customizados para acelerar a criação de políticas</p>
      </div>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BookTemplate className="w-16 h-16 text-emerald-500/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Biblioteca de Templates</h3>
          <p className="text-muted-foreground max-w-md">
            Em breve: templates pré-carregados para ISO 27001, BCB 4.893 e NIST CSF, além de geração assistida por IA.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
