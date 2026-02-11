import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface DueDiligence {
  id: string;
  vendor_id: string;
  organization_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  approved_by: string | null;
  inherent_risk_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DueDiligenceItem {
  id: string;
  due_diligence_id: string;
  category: string;
  item_name: string;
  description: string | null;
  status: string;
  observations: string | null;
  verified_by: string | null;
  verified_at: string | null;
  order_index: number;
  created_at: string;
}

export const DD_CATEGORIES = [
  { value: 'documentacao', label: 'Documentação', icon: 'file-text' },
  { value: 'financeiro', label: 'Financeiro', icon: 'banknote' },
  { value: 'seguranca', label: 'Segurança', icon: 'shield' },
  { value: 'legal', label: 'Legal / Privacidade', icon: 'scale' },
  { value: 'operacional', label: 'Operacional', icon: 'settings' },
];

export const DD_ITEM_STATUS = [
  { value: 'pendente', label: 'Pendente', color: 'bg-gray-400' },
  { value: 'ok', label: 'OK', color: 'bg-green-500' },
  { value: 'alerta', label: 'Alerta', color: 'bg-amber-500' },
  { value: 'reprovado', label: 'Reprovado', color: 'bg-red-500' },
  { value: 'nao_aplicavel', label: 'N/A', color: 'bg-gray-300' },
];

export const DEFAULT_DD_ITEMS: Array<{ category: string; item_name: string; description: string }> = [
  // Documentação
  { category: 'documentacao', item_name: 'CNPJ Ativo', description: 'Verificar situação cadastral ativa na Receita Federal' },
  { category: 'documentacao', item_name: 'Contrato Social', description: 'Cópia atualizada do contrato social ou estatuto' },
  { category: 'documentacao', item_name: 'Certidões Negativas', description: 'Certidões negativas de débitos federais, estaduais e municipais' },
  { category: 'documentacao', item_name: 'Alvará de Funcionamento', description: 'Alvará municipal de funcionamento vigente' },
  // Financeiro
  { category: 'financeiro', item_name: 'Demonstrativos Financeiros', description: 'Balanço patrimonial e DRE dos últimos 2 anos' },
  { category: 'financeiro', item_name: 'Referências Comerciais', description: 'No mínimo 3 referências de clientes atuais' },
  { category: 'financeiro', item_name: 'Seguros', description: 'Apólices de seguro de responsabilidade civil e cyber' },
  // Segurança
  { category: 'seguranca', item_name: 'Política de Segurança', description: 'Política de segurança da informação documentada' },
  { category: 'seguranca', item_name: 'Certificações (ISO/SOC)', description: 'ISO 27001, SOC 2 ou certificações equivalentes' },
  { category: 'seguranca', item_name: 'Plano de Resposta a Incidentes', description: 'Plano documentado de resposta a incidentes de segurança' },
  { category: 'seguranca', item_name: 'Controle de Acesso', description: 'Práticas de gestão de identidades e acessos' },
  // Legal / Privacidade
  { category: 'legal', item_name: 'Cláusulas LGPD', description: 'Conformidade com a Lei Geral de Proteção de Dados' },
  { category: 'legal', item_name: 'DPA (Data Processing Agreement)', description: 'Acordo de processamento de dados assinado' },
  { category: 'legal', item_name: 'Acordo de Confidencialidade (NDA)', description: 'NDA assinado entre as partes' },
  // Operacional
  { category: 'operacional', item_name: 'Plano de Continuidade (BCP)', description: 'Plano de continuidade de negócios documentado' },
  { category: 'operacional', item_name: 'SLAs Propostos', description: 'Níveis de serviço propostos e métricas de desempenho' },
  { category: 'operacional', item_name: 'Capacidade Técnica', description: 'Evidência de capacidade técnica e equipe qualificada' },
];

export function useDueDiligence(vendorId: string | null) {
  return useQuery({
    queryKey: ['due-diligence', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('vendor_due_diligence')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DueDiligence[];
    },
    enabled: !!vendorId,
  });
}

export function useDueDiligenceItems(dueDiligenceId: string | null) {
  return useQuery({
    queryKey: ['due-diligence-items', dueDiligenceId],
    queryFn: async () => {
      if (!dueDiligenceId) return [];
      const { data, error } = await supabase
        .from('vendor_due_diligence_items')
        .select('*')
        .eq('due_diligence_id', dueDiligenceId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as DueDiligenceItem[];
    },
    enabled: !!dueDiligenceId,
  });
}

export function useCreateDueDiligence() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      if (!organization?.id) throw new Error('No organization');

      // Create the due diligence record
      const { data: dd, error: ddError } = await supabase
        .from('vendor_due_diligence')
        .insert({
          vendor_id: vendorId,
          organization_id: organization.id,
          status: 'em_andamento',
        })
        .select()
        .single();

      if (ddError) throw ddError;

      // Insert default checklist items
      const items = DEFAULT_DD_ITEMS.map((item, index) => ({
        due_diligence_id: dd.id,
        category: item.category,
        item_name: item.item_name,
        description: item.description,
        status: 'pendente',
        order_index: index,
      }));

      const { error: itemsError } = await supabase
        .from('vendor_due_diligence_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // Update vendor lifecycle stage
      await supabase
        .from('vendors')
        .update({ lifecycle_stage: 'due_diligence' })
        .eq('id', vendorId);

      return dd;
    },
    onSuccess: (_, vendorId) => {
      queryClient.invalidateQueries({ queryKey: ['due-diligence', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useUpdateDueDiligenceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DueDiligenceItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendor_due_diligence_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['due-diligence-items', data.due_diligence_id] });
    },
  });
}

export function useUpdateDueDiligence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DueDiligence> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendor_due_diligence')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['due-diligence', data.vendor_id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}
