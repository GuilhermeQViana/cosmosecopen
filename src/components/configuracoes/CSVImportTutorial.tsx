import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface CSVImportTutorialProps {
  onDownloadTemplate: () => void;
  defaultOpen?: boolean;
}

const REQUIRED_FIELDS = [
  {
    field: 'code',
    description: 'Identificador único do controle',
    example: 'CTRL-001',
  },
  {
    field: 'name',
    description: 'Nome/título descritivo do controle',
    example: 'Política de Segurança da Informação',
  },
];

const OPTIONAL_FIELDS = [
  {
    field: 'category',
    description: 'Agrupamento lógico dos controles',
    example: 'Governança',
  },
  {
    field: 'description',
    description: 'Texto explicativo detalhado',
    example: 'Estabelecer diretrizes...',
  },
  {
    field: 'weight',
    description: 'Peso/importância de 1 a 5',
    example: '3',
  },
  {
    field: 'criticality',
    description: 'Nível de criticidade',
    example: 'alta, media, baixa',
  },
  {
    field: 'weight_reason',
    description: 'Justificativa do peso atribuído',
    example: 'Controle fundamental...',
  },
  {
    field: 'implementation_example',
    description: 'Exemplo de como implementar',
    example: 'Documento formal...',
  },
  {
    field: 'evidence_example',
    description: 'Evidências esperadas',
    example: 'Política assinada...',
  },
  {
    field: 'order_index',
    description: 'Ordem de exibição',
    example: '1',
  },
];

const TIPS = [
  'Os nomes das colunas podem variar — você poderá mapeá-los manualmente na próxima etapa',
  'Textos que contêm vírgulas devem estar entre aspas duplas',
  'Códigos duplicados serão rejeitados automaticamente',
  'Linhas vazias serão ignoradas',
  'O peso deve ser um número inteiro de 1 a 5',
  'Você pode usar vírgula (,) ou ponto-e-vírgula (;) como separador',
];

export function CSVImportTutorial({ onDownloadTemplate, defaultOpen = true }: CSVImportTutorialProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-primary/20 bg-primary/5">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-primary/10 transition-colors py-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                Como Preparar seu Arquivo CSV
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Step 1: File Structure */}
            <section>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                  1
                </Badge>
                Estrutura do Arquivo
              </h4>
              <div className="text-sm text-muted-foreground space-y-1 ml-7">
                <p>• Primeira linha: nomes das colunas (cabeçalho)</p>
                <p>• Demais linhas: dados dos controles</p>
                <p>• Separador: vírgula (,) ou ponto-e-vírgula (;)</p>
                <p>• Codificação: UTF-8 recomendado</p>
              </div>
            </section>

            {/* Step 2: Required Fields */}
            <section>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                  2
                </Badge>
                <span className="flex items-center gap-1">
                  Campos Obrigatórios
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </span>
              </h4>
              <div className="ml-7">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Campo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-40">Exemplo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {REQUIRED_FIELDS.map((field) => (
                      <TableRow key={field.field}>
                        <TableCell className="font-mono text-xs font-medium">
                          {field.field}
                        </TableCell>
                        <TableCell className="text-sm">{field.description}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {field.example}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Step 3: Optional Fields */}
            <section>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
                <span className="flex items-center gap-1">
                  Campos Opcionais
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </span>
              </h4>
              <div className="ml-7">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40">Campo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-32">Exemplo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {OPTIONAL_FIELDS.map((field) => (
                      <TableRow key={field.field}>
                        <TableCell className="font-mono text-xs">
                          {field.field}
                        </TableCell>
                        <TableCell className="text-sm">{field.description}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {field.example}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Step 4: Tips */}
            <section>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                  4
                </Badge>
                <span className="flex items-center gap-1">
                  Dicas Importantes
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                </span>
              </h4>
              <div className="ml-7 space-y-1">
                {TIPS.map((tip, index) => (
                  <p key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </p>
                ))}
              </div>
            </section>

            {/* Download Template Button */}
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Baixar Template de Exemplo
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
