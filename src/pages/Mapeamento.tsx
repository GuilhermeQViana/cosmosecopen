import { useState, useMemo } from 'react';
import { useFrameworkMappings } from '@/hooks/useFrameworkMappings';
import { useFrameworks } from '@/hooks/useFrameworks';
import { MappingCard } from '@/components/mapeamento/MappingCard';
import { MappingStats } from '@/components/mapeamento/MappingStats';
import { MappingMatrix } from '@/components/mapeamento/MappingMatrix';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Link2, 
  Grid3X3, 
  List, 
  Filter,
  Loader2,
  AlertCircle,
  ArrowRightLeft,
} from 'lucide-react';

const frameworkColors: Record<string, string> = {
  nist_csf: 'bg-[hsl(var(--chart-1))]',
  iso_27001: 'bg-[hsl(var(--chart-2))]',
  bcb_cmn: 'bg-[hsl(var(--chart-3))]',
};

const frameworkNames: Record<string, string> = {
  nist_csf: 'NIST CSF 2.0',
  iso_27001: 'ISO 27001:2022',
  bcb_cmn: 'BCB/CMN 4.893',
};

export default function Mapeamento() {
  const { data: mappings, isLoading } = useFrameworkMappings();
  const { data: frameworks } = useFrameworks();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const stats = useMemo(() => {
    if (!mappings) return { total: 0, equivalent: 0, partial: 0, related: 0 };
    
    return {
      total: mappings.length,
      equivalent: mappings.filter(m => m.mapping_type === 'equivalent').length,
      partial: mappings.filter(m => m.mapping_type === 'partial').length,
      related: mappings.filter(m => m.mapping_type === 'related').length,
    };
  }, [mappings]);

  const filteredMappings = useMemo(() => {
    if (!mappings) return [];
    
    return mappings.filter(mapping => {
      const matchesSearch = searchTerm === '' ||
        mapping.source_control.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.source_control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.target_control.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.target_control.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSource = sourceFilter === 'all' ||
        mapping.source_control.framework.code === sourceFilter;

      const matchesTarget = targetFilter === 'all' ||
        mapping.target_control.framework.code === targetFilter;

      const matchesType = typeFilter === 'all' ||
        mapping.mapping_type === typeFilter;

      return matchesSearch && matchesSource && matchesTarget && matchesType;
    });
  }, [mappings, searchTerm, sourceFilter, targetFilter, typeFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mapeamento de Frameworks</h1>
        <p className="text-muted-foreground">
          Visualize as equivalências entre controles dos diferentes frameworks
        </p>
      </div>

      {/* Stats */}
      <MappingStats
        totalMappings={stats.total}
        equivalentCount={stats.equivalent}
        partialCount={stats.partial}
        relatedCount={stats.related}
      />

      {/* Framework Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-sm font-medium text-muted-foreground">Frameworks:</span>
            {Object.entries(frameworkNames).map(([code, name]) => (
              <div key={code} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${frameworkColors[code]}`} />
                <span className="text-sm">{name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Matriz
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar controles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas origens</SelectItem>
                <SelectItem value="nist_csf">NIST CSF</SelectItem>
                <SelectItem value="iso_27001">ISO 27001</SelectItem>
                <SelectItem value="bcb_cmn">BCB/CMN</SelectItem>
              </SelectContent>
            </Select>

            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />

            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos destinos</SelectItem>
                <SelectItem value="nist_csf">NIST CSF</SelectItem>
                <SelectItem value="iso_27001">ISO 27001</SelectItem>
                <SelectItem value="bcb_cmn">BCB/CMN</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tipos</SelectItem>
                <SelectItem value="equivalent">Equivalente</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="related">Relacionado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          {filteredMappings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhum mapeamento encontrado</p>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar os filtros de busca
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredMappings.length} mapeamento{filteredMappings.length !== 1 ? 's' : ''} encontrado{filteredMappings.length !== 1 ? 's' : ''}
                </p>
              </div>
              {filteredMappings.map((mapping) => (
                <MappingCard key={mapping.id} mapping={mapping} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matrix">
          <MappingMatrix mappings={mappings || []} />
          
          {/* Detailed breakdown by framework pair */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]" />
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
                </div>
                <CardTitle className="text-sm">NIST ↔ ISO 27001</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {mappings?.filter(m => 
                    (m.source_control.framework.code === 'nist_csf' && m.target_control.framework.code === 'iso_27001') ||
                    (m.source_control.framework.code === 'iso_27001' && m.target_control.framework.code === 'nist_csf')
                  ).length || 0}
                </p>
                <p className="text-xs text-muted-foreground">mapeamentos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]" />
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]" />
                </div>
                <CardTitle className="text-sm">NIST ↔ BCB/CMN</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {mappings?.filter(m => 
                    (m.source_control.framework.code === 'nist_csf' && m.target_control.framework.code === 'bcb_cmn') ||
                    (m.source_control.framework.code === 'bcb_cmn' && m.target_control.framework.code === 'nist_csf')
                  ).length || 0}
                </p>
                <p className="text-xs text-muted-foreground">mapeamentos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]" />
                </div>
                <CardTitle className="text-sm">ISO 27001 ↔ BCB/CMN</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {mappings?.filter(m => 
                    (m.source_control.framework.code === 'iso_27001' && m.target_control.framework.code === 'bcb_cmn') ||
                    (m.source_control.framework.code === 'bcb_cmn' && m.target_control.framework.code === 'iso_27001')
                  ).length || 0}
                </p>
                <p className="text-xs text-muted-foreground">mapeamentos</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
