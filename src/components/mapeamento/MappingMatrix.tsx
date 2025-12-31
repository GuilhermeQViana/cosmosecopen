import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MappingWithControls } from '@/hooks/useFrameworkMappings';

interface MappingMatrixProps {
  mappings: MappingWithControls[];
}

const frameworkOrder = ['nist_csf', 'iso_27001', 'bcb_cmn'];
const frameworkNames: Record<string, string> = {
  nist_csf: 'NIST CSF 2.0',
  iso_27001: 'ISO 27001:2022',
  bcb_cmn: 'BCB/CMN 4.893',
};

const frameworkColors: Record<string, string> = {
  nist_csf: 'bg-[hsl(var(--chart-1))]',
  iso_27001: 'bg-[hsl(var(--chart-2))]',
  bcb_cmn: 'bg-[hsl(var(--chart-3))]',
};

export function MappingMatrix({ mappings }: MappingMatrixProps) {
  const matrix = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};

    frameworkOrder.forEach(source => {
      result[source] = {};
      frameworkOrder.forEach(target => {
        result[source][target] = 0;
      });
    });

    mappings.forEach(mapping => {
      const sourceCode = mapping.source_control.framework.code;
      const targetCode = mapping.target_control.framework.code;
      if (result[sourceCode] && result[sourceCode][targetCode] !== undefined) {
        result[sourceCode][targetCode]++;
      }
    });

    return result;
  }, [mappings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Matriz de Mapeamentos</CardTitle>
        <CardDescription>Quantidade de mapeamentos entre frameworks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                  De / Para
                </th>
                {frameworkOrder.map(fw => (
                  <th key={fw} className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${frameworkColors[fw]}`} />
                      <span className="text-sm font-medium">{frameworkNames[fw]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {frameworkOrder.map(source => (
                <tr key={source} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${frameworkColors[source]}`} />
                      <span className="text-sm font-medium">{frameworkNames[source]}</span>
                    </div>
                  </td>
                  {frameworkOrder.map(target => (
                    <td key={target} className="p-3 text-center">
                      {source === target ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <Badge
                          variant={matrix[source][target] > 0 ? 'default' : 'secondary'}
                          className={matrix[source][target] > 0 ? 'bg-primary' : ''}
                        >
                          {matrix[source][target]}
                        </Badge>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
