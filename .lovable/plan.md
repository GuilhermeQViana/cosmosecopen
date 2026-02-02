
# Plano: Banco de Evidencias para Gestao de Fornecedores

## Contexto e Objetivo

O modulo de Gestao de Fornecedores (VRM) atualmente possui apenas evidencias vinculadas a avaliacoes especificas (`vendor_evidences`). O objetivo e criar um **Cofre de Evidencias dedicado** para fornecedores, permitindo:

- Armazenar evidencias separadas por fornecedor
- Navegar entre fornecedores em uma arvore lateral
- Gerenciar evidencias independentes de avaliacoes
- Manter consistencia visual com o Cofre de Evidencias do modulo GRC

---

## Arquitetura Atual

### Tabelas Existentes
- `vendor_evidences` - vinculadas a `vendor_assessments` (assessment_id obrigatorio)
- `evidences` - modulo GRC (usa `evidence_folders` para organizacao)

### Limitacao
As evidencias de fornecedores estao sempre atreladas a uma avaliacao, nao existe um repositorio geral por fornecedor.

---

## Solucao Proposta

### 1. Nova Tabela: `vendor_evidence_vault`

Criar tabela para evidencias gerais de fornecedores (contratos, certificacoes, DDQ, etc.):

```text
vendor_evidence_vault
├── id (uuid, PK)
├── vendor_id (uuid, FK -> vendors)
├── organization_id (uuid, FK -> organizations)
├── name (text)
├── description (text, nullable)
├── file_path (text)
├── file_type (text, nullable)
├── file_size (bigint, nullable)
├── classification (text) - publico, interno, confidencial
├── category (text) - contrato, certificacao, ddq, politica, outro
├── expires_at (timestamptz, nullable)
├── tags (text[], nullable)
├── uploaded_by (uuid, nullable)
├── created_at (timestamptz)
├── updated_at (timestamptz)
```

### 2. Nova Pagina: `/vrm/evidencias`

Interface similar a `/evidencias` do modulo GRC:
- Painel esquerdo: arvore de fornecedores
- Painel direito: grid de evidencias do fornecedor selecionado
- Filtros por classificacao e categoria
- Upload, preview, download, exclusao

### 3. Navegacao

Adicionar item "Evidencias" no menu lateral VRM entre "Requisitos" e "Agenda".

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/VendorEvidencias.tsx` | Pagina principal do cofre |
| `src/hooks/useVendorEvidenceVault.ts` | Hook para CRUD de evidencias |
| `src/components/fornecedores/VendorEvidenceVault.tsx` | Componente de listagem |
| `src/components/fornecedores/VendorEvidenceUploadVault.tsx` | Dialog de upload |
| `src/components/fornecedores/VendorEvidenceCard.tsx` | Card de evidencia |
| `src/components/fornecedores/VendorEvidencePreview.tsx` | Preview de arquivo |
| `src/components/fornecedores/VendorEvidenceTree.tsx` | Arvore de fornecedores |
| `src/components/fornecedores/VendorEvidenceStats.tsx` | Estatisticas |

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar rota `/vrm/evidencias` |
| `src/components/layout/VendorSidebar.tsx` | Adicionar item de menu |

---

## Estrutura da Pagina

```text
┌─────────────────────────────────────────────────────────────┐
│  Header: Cofre de Evidencias de Fornecedores                │
│  [+ Nova Evidencia]                                         │
├─────────────────────────────────────────────────────────────┤
│  Stats: Total | Por Classificacao | Proximos a Expirar      │
├───────────────┬─────────────────────────────────────────────┤
│               │  Filtros: Busca | Classificacao | Categoria │
│  Arvore de    ├─────────────────────────────────────────────┤
│  Fornecedores │                                             │
│               │  Grid de Evidencias (Cards)                 │
│  - VND-001    │  ┌────────┐ ┌────────┐ ┌────────┐          │
│  - VND-002    │  │ Evid 1 │ │ Evid 2 │ │ Evid 3 │          │
│  - VND-003    │  └────────┘ └────────┘ └────────┘          │
│    ...        │                                             │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

---

## Categorias de Evidencias

- **Contrato** - Contratos e aditivos
- **Certificacao** - ISO, SOC2, PCI-DSS, etc.
- **DDQ** - Due Diligence Questionnaire
- **Politica** - Politicas de seguranca do fornecedor
- **SLA** - Acordos de nivel de servico
- **Auditoria** - Relatorios de auditoria
- **Outro** - Documentos diversos

---

## Classificacoes (reutilizar do modulo GRC)

- `publico` - Documentos publicos
- `interno` - Uso interno
- `confidencial` - Acesso restrito

---

## Fluxo de Upload

1. Usuario seleciona fornecedor na arvore
2. Clica em "Nova Evidencia"
3. Dialog abre com:
   - Dropzone para arquivo
   - Nome (auto-preenchido)
   - Categoria (select)
   - Classificacao (select)
   - Descricao (opcional)
   - Tags (opcional)
   - Data de expiracao (opcional)
4. Arquivo enviado para bucket `vendor-evidences`
5. Registro criado em `vendor_evidence_vault`

---

## Detalhes Tecnicos

### Migracao SQL

```sql
CREATE TABLE public.vendor_evidence_vault (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  file_path text NOT NULL,
  file_type text,
  file_size bigint,
  classification text NOT NULL DEFAULT 'interno',
  category text NOT NULL DEFAULT 'outro',
  expires_at timestamptz,
  tags text[],
  uploaded_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.vendor_evidence_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidences from their organization"
  ON public.vendor_evidence_vault FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert evidences to their organization"
  ON public.vendor_evidence_vault FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update evidences from their organization"
  ON public.vendor_evidence_vault FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete evidences from their organization"
  ON public.vendor_evidence_vault FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));
```

### Reutilizacao de Componentes

- `ResizablePanelGroup` - Layout split igual ao `/evidencias`
- Padroes visuais do `EvidenceCard` e `EvidencePreviewDialog`
- Hook pattern similar ao `useEvidences`

### Storage

Reutilizar o bucket `vendor-evidences` existente com path:
`{organization_id}/vault/{vendor_id}/{uuid}.{ext}`

---

## Resultado Esperado

1. Nova pagina `/vrm/evidencias` acessivel pelo menu lateral
2. Arvore de fornecedores com contador de evidencias
3. Upload de evidencias vinculadas a fornecedores especificos
4. Filtros por classificacao e categoria
5. Preview inline para PDFs e imagens
6. Indicador de documentos proximos a expirar
7. Consistencia visual com o restante da plataforma
