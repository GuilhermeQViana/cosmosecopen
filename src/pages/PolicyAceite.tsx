import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function PolicyAceite() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-space">Campanhas de Aceite</h1>
        <p className="text-muted-foreground mt-1">Gerencie campanhas de aceite de políticas pelos colaboradores</p>
      </div>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-16 h-16 text-emerald-500/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma campanha ativa</h3>
          <p className="text-muted-foreground max-w-md">
            Crie campanhas de aceite vinculadas a políticas publicadas para rastrear a aderência dos colaboradores.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
