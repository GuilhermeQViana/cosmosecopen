import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft,
  FileText,
  Shield,
  Lock,
  AlertTriangle,
  RefreshCw,
  Save,
  Loader2
} from 'lucide-react';
import { useVendorDomains, useVendorRequirements } from '@/hooks/useVendorRequirements';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RequirementFormData {
  code: string;
  name: string;
  description: string;
  domain_id: string;
  weight: number;
  evidence_example: string;
  is_active: boolean;
}

const defaultFormData: RequirementFormData = {
  code: '',
  name: '',
  description: '',
  domain_id: '',
  weight: 1,
  evidence_example: '',
  is_active: true,
};

export default function VendorRequisitos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { data: domains = [] } = useVendorDomains();
  const { data: requirements = [], isLoading } = useVendorRequirements();
  
  const [activeTab, setActiveTab] = useState<string>(domains[0]?.id || '');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<any>(null);
  const [formData, setFormData] = useState<RequirementFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);

  // Set initial tab when domains load
  if (domains.length > 0 && !activeTab) {
    setActiveTab(domains[0].id);
  }

  const getDomainIcon = (code: string) => {
    switch (code) {
      case 'SI':
        return Shield;
      case 'CYBER':
        return Lock;
      case 'PRIV':
        return AlertTriangle;
      case 'BCN':
        return RefreshCw;
      default:
        return FileText;
    }
  };

  const getRequirementsForDomain = (domainId: string) => {
    return requirements.filter(r => r.domain_id === domainId);
  };

  const openCreateForm = (domainId: string) => {
    const domainRequirements = getRequirementsForDomain(domainId);
    const nextIndex = domainRequirements.length + 1;
    const domain = domains.find(d => d.id === domainId);
    
    setFormData({
      ...defaultFormData,
      domain_id: domainId,
      code: `${domain?.code || 'REQ'}-${String(nextIndex).padStart(2, '0')}`,
    });
    setEditingRequirement(null);
    setFormOpen(true);
  };

  const openEditForm = (requirement: any) => {
    setFormData({
      code: requirement.code,
      name: requirement.name,
      description: requirement.description || '',
      domain_id: requirement.domain_id,
      weight: requirement.weight || 1,
      evidence_example: requirement.evidence_example || '',
      is_active: requirement.is_active ?? true,
    });
    setEditingRequirement(requirement);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!organization?.id) return;
    if (!formData.name.trim() || !formData.code.trim() || !formData.domain_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      if (editingRequirement) {
        // Only allow editing custom requirements (with organization_id)
        if (!editingRequirement.organization_id) {
          toast.error('Requisitos padrão não podem ser editados');
          return;
        }

        const { error } = await supabase
          .from('vendor_requirements')
          .update({
            code: formData.code,
            name: formData.name,
            description: formData.description || null,
            domain_id: formData.domain_id,
            weight: formData.weight,
            evidence_example: formData.evidence_example || null,
            is_active: formData.is_active,
          })
          .eq('id', editingRequirement.id);

        if (error) throw error;
        toast.success('Requisito atualizado com sucesso');
      } else {
        // Create new custom requirement
        const domainRequirements = getRequirementsForDomain(formData.domain_id);
        const maxOrder = Math.max(0, ...domainRequirements.map(r => r.order_index || 0));

        const { error } = await supabase
          .from('vendor_requirements')
          .insert({
            code: formData.code,
            name: formData.name,
            description: formData.description || null,
            domain_id: formData.domain_id,
            organization_id: organization.id,
            weight: formData.weight,
            evidence_example: formData.evidence_example || null,
            is_active: formData.is_active,
            order_index: maxOrder + 1,
          });

        if (error) throw error;
        toast.success('Requisito criado com sucesso');
      }

      queryClient.invalidateQueries({ queryKey: ['vendor-requirements'] });
      setFormOpen(false);
      setFormData(defaultFormData);
      setEditingRequirement(null);
    } catch (error: any) {
      console.error('Error saving requirement:', error);
      toast.error('Erro ao salvar requisito: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingRequirement) return;

    if (!editingRequirement.organization_id) {
      toast.error('Requisitos padrão não podem ser excluídos');
      setDeleteOpen(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('vendor_requirements')
        .delete()
        .eq('id', editingRequirement.id);

      if (error) throw error;
      
      toast.success('Requisito excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['vendor-requirements'] });
      setDeleteOpen(false);
      setEditingRequirement(null);
    } catch (error: any) {
      console.error('Error deleting requirement:', error);
      toast.error('Erro ao excluir requisito: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vrm')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-space">
              Requisitos de Avaliação
            </h1>
            <p className="text-muted-foreground">
              Gerencie os requisitos utilizados nas avaliações de fornecedores
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {requirements.length} requisitos ativos
          </Badge>
        </div>
      </div>

      {/* Domains Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          {domains.map((domain) => {
            const Icon = getDomainIcon(domain.code);
            const count = getRequirementsForDomain(domain.id).length;
            return (
              <TabsTrigger key={domain.id} value={domain.id} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{domain.name.split(' ')[0]}</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {domains.map((domain) => {
          const domainRequirements = getRequirementsForDomain(domain.id);
          const Icon = getDomainIcon(domain.code);

          return (
            <TabsContent key={domain.id} value={domain.id}>
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{domain.name}</CardTitle>
                        <CardDescription>{domain.description}</CardDescription>
                      </div>
                    </div>
                    <Button onClick={() => openCreateForm(domain.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Requisito
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : domainRequirements.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Nenhum requisito neste domínio</p>
                      <p className="text-sm">Clique em "Adicionar Requisito" para começar</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {domainRequirements.map((requirement) => (
                          <div
                            key={requirement.id}
                            className={cn(
                              'p-4 rounded-lg border transition-colors',
                              requirement.organization_id 
                                ? 'bg-primary/5 border-primary/20' 
                                : 'bg-muted/30 border-border/50',
                              !requirement.is_active && 'opacity-50'
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {requirement.code}
                                  </Badge>
                                  {requirement.organization_id && (
                                    <Badge className="bg-primary/20 text-primary text-xs">
                                      Customizado
                                    </Badge>
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    Peso: {requirement.weight}
                                  </Badge>
                                  {!requirement.is_active && (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                      Inativo
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-medium">{requirement.name}</p>
                                {requirement.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {requirement.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditForm(requirement)}
                                  disabled={!requirement.organization_id}
                                  title={requirement.organization_id ? 'Editar' : 'Requisitos padrão não podem ser editados'}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingRequirement(requirement);
                                    setDeleteOpen(true);
                                  }}
                                  disabled={!requirement.organization_id}
                                  title={requirement.organization_id ? 'Excluir' : 'Requisitos padrão não podem ser excluídos'}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRequirement ? 'Editar Requisito' : 'Novo Requisito'}
            </DialogTitle>
            <DialogDescription>
              {editingRequirement 
                ? 'Atualize as informações do requisito customizado'
                : 'Adicione um novo requisito de avaliação para este domínio'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="REQ-01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domínio *</Label>
                <Select
                  value={formData.domain_id}
                  onValueChange={(value) => setFormData({ ...formData, domain_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o domínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.id}>
                        {domain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome do Requisito *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome descritivo do requisito"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes sobre o requisito..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence">Exemplo de Evidência</Label>
              <Textarea
                id="evidence"
                value={formData.evidence_example}
                onChange={(e) => setFormData({ ...formData, evidence_example: e.target.value })}
                placeholder="Que tipo de evidência pode ser apresentada..."
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label>Peso do Requisito: {formData.weight}</Label>
              <Slider
                value={[formData.weight]}
                onValueChange={([value]) => setFormData({ ...formData, weight: value })}
                min={1}
                max={3}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Peso maior significa maior impacto no score final
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Requisito Ativo</Label>
                <p className="text-xs text-muted-foreground">
                  Requisitos inativos não aparecem nas avaliações
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingRequirement ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Requisito</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o requisito "{editingRequirement?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
