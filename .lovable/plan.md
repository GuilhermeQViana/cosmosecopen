

## Modulo Completo: Gestao de Politicas (Policy Center)

Este e o maior modulo ja construido na CosmoSec. Sera implementado como um terceiro modulo independente (ao lado de GRC e VRM) com sidebar propria, editor WYSIWYG completo (TipTap) e todas as 6 funcionalidades solicitadas.

---

### Arquitetura do Modulo

O modulo seguira exatamente o mesmo padrao do VRM:
- Layout independente (`PolicyLayout`) com sidebar propria (`PolicySidebar`)
- Rotas sob `/policies/*`
- Card na tela de selecao de modulo (`SelecionarModulo`)
- Cor tematica: **verde-esmeralda** (diferenciando do azul GRC e roxo VRM)

---

### Estrutura de Navegacao

```text
/policies                -> Dashboard de Politicas
/policies/central        -> Central de Politicas (repositorio)
/policies/central/:id    -> Editor de politica individual
/policies/workflows      -> Fluxos de aprovacao
/policies/aceite         -> Campanhas de aceite
/policies/templates      -> Biblioteca de modelos
/policies/configuracoes  -> Configuracoes do modulo
```

---

### 1. Banco de Dados (Migration)

**Tabela `policies`** - Repositorio central
- `id`, `organization_id`, `framework_id` (nullable, vinculo com framework)
- `title`, `description`, `content` (rich text HTML do TipTap)
- `category` (ex: Seguranca, Privacidade, Continuidade, Acesso, BYOD, Backup, etc.)
- `status` (rascunho, em_revisao, aprovada, publicada, expirada, arquivada)
- `version` (integer, incrementa automaticamente)
- `owner_id` (uuid, responsavel pela politica)
- `approver_id` (uuid, quem deve aprovar)
- `approved_at`, `published_at`, `expires_at`, `next_review_at`
- `tags` (text array)
- `created_by`, `created_at`, `updated_at`
- RLS: `user_belongs_to_org(auth.uid(), organization_id)`

**Tabela `policy_versions`** - Historico de versoes (snapshot imutavel)
- `id`, `policy_id`, `version_number`, `title`, `content`
- `changed_by`, `change_summary`, `created_at`
- RLS via join com `policies`

**Tabela `policy_comments`** - Comentarios colaborativos
- `id`, `policy_id`, `user_id`, `parent_id` (aninhados)
- `content`, `is_resolved`, `created_at`, `updated_at`
- RLS via join com `policies`

**Tabela `policy_controls`** - Vinculo politica <-> controles
- `id`, `policy_id`, `control_id`, `created_at`
- RLS via join com `policies`

**Tabela `policy_risks`** - Vinculo politica <-> riscos
- `id`, `policy_id`, `risk_id`, `created_at`
- RLS via join com `policies`

**Tabela `policy_workflows`** - Configuracao de fluxo de aprovacao
- `id`, `organization_id`, `name`
- `approval_levels` (integer: 1 ou 2)
- `level1_role` (ex: admin), `level2_role` (ex: admin)
- `level1_approver_id`, `level2_approver_id` (opcionals, pessoa especifica)
- `created_at`, `updated_at`
- RLS: `user_belongs_to_org`

**Tabela `policy_approvals`** - Registro de aprovacoes
- `id`, `policy_id`, `version_number`, `approval_level`
- `approver_id`, `status` (pendente, aprovada, rejeitada)
- `comments`, `approved_at`, `created_at`
- RLS via join com `policies`

**Tabela `policy_acceptance_campaigns`** - Campanhas de aceite
- `id`, `policy_id`, `organization_id`
- `title`, `description`, `target_audience` (todos, grupo)
- `target_roles` (text array, nullable)
- `deadline`, `status` (ativa, encerrada)
- `created_by`, `created_at`
- RLS: `user_belongs_to_org`

**Tabela `policy_acceptances`** - Registros individuais de aceite
- `id`, `campaign_id`, `user_id`
- `accepted_at`, `ip_address`
- RLS: usuario pode ver/inserir os proprios

**Tabela `policy_templates`** - Biblioteca de modelos
- `id`, `organization_id` (nullable para templates globais)
- `title`, `description`, `content`, `category`
- `framework_code` (nullable, ex: iso_27001)
- `is_system` (boolean, templates pre-carregados)
- `created_by`, `created_at`
- RLS: templates do sistema vissiveis para todos, custom por org

**Triggers:**
- `log_table_changes` em `policies` para trilha de auditoria
- Trigger para criar `policy_versions` automaticamente ao atualizar `content`
- Trigger para notificar admins quando politica expira (similar ao `check_deadline_notifications`)

---

### 2. Infraestrutura Frontend

**Novos arquivos de layout:**
- `src/components/layout/PolicyLayout.tsx` - Seguindo o padrao do `VendorLayout`
- `src/components/layout/PolicySidebar.tsx` - Seguindo o padrao do `VendorSidebar`

**Cor tematica:** verde-esmeralda (`emerald-500`)

**Registrar no App.tsx:**
- Novo grupo de rotas `<Route element={<PolicyLayout />}>` com todas as rotas `/policies/*`

**Registrar no SelecionarModulo:**
- Novo card "Gestao de Politicas" com icone `FileText` e cor esmeralda

**Links cruzados nas sidebars:**
- AppSidebar e VendorSidebar ganham link para "Politicas" na secao Modulos

---

### 3. Central de Politicas (Repositorio)

**Pagina `src/pages/Politicas.tsx`:**
- Lista de todas as politicas com filtros por status, categoria, framework
- Cards com titulo, status badge, owner, data de revisao, versao
- Botao "Nova Politica"

**Pagina `src/pages/PoliticaEditor.tsx`:**
- Editor TipTap WYSIWYG com toolbar completa (negrito, italico, listas, tabelas, headings, links)
- Painel lateral com metadados: titulo, categoria, framework vinculado, owner, aprovador, data de revisao, tags
- Secao de comentarios aninhados com mencoes (@)
- Historico de versoes com diff visual
- Botoes de acao: Salvar Rascunho, Enviar para Revisao, Aprovar, Publicar

**Hooks:**
- `src/hooks/usePolicies.ts` - CRUD completo + filtros
- `src/hooks/usePolicyVersions.ts` - Historico de versoes
- `src/hooks/usePolicyComments.ts` - Comentarios

**Componentes:**
- `src/components/politicas/PolicyCard.tsx`
- `src/components/politicas/PolicyStats.tsx` - Metricas do repositorio
- `src/components/politicas/PolicyEditor.tsx` - Wrapper do TipTap
- `src/components/politicas/PolicyMetadataPanel.tsx`
- `src/components/politicas/PolicyVersionHistory.tsx`
- `src/components/politicas/PolicyComments.tsx`
- `src/components/politicas/PolicyControlsLink.tsx` - Vincular controles/riscos

---

### 4. Workflow de Aprovacao

**Pagina `src/pages/PolicyWorkflows.tsx`:**
- Lista de workflows configurados
- Criar/editar workflows com 1 ou 2 niveis de aprovacao

**Componentes:**
- `src/components/politicas/WorkflowConfigForm.tsx` - Formulario de configuracao
- `src/components/politicas/ApprovalTimeline.tsx` - Linha do tempo visual do fluxo
- `src/components/politicas/ApprovalActionButtons.tsx` - Botoes Aprovar/Rejeitar com comentario

**Logica:**
- Ao enviar para revisao, cria `policy_approvals` com status pendente
- Notificacao automatica para o aprovador via `create_notification`
- Se 2 niveis, nivel 2 so e criado apos nivel 1 aprovar
- Ao aprovar ultimo nivel, politica muda para "aprovada"
- Publicacao e acao explicita do owner apos aprovacao

---

### 5. Campanhas de Aceite

**Pagina `src/pages/PolicyAceite.tsx`:**
- Dashboard com graficos de aderencia (% de aceite por campanha)
- Lista de campanhas ativas e encerradas
- Criar nova campanha vinculada a uma politica publicada

**Componentes:**
- `src/components/politicas/CampaignForm.tsx` - Formulario de campanha
- `src/components/politicas/CampaignDashboard.tsx` - Graficos de aderencia (Recharts)
- `src/components/politicas/AcceptanceCard.tsx` - Card do usuario para aceitar
- `src/components/politicas/CampaignProgressBar.tsx`

**Logica:**
- Ao criar campanha, gera notificacoes para todos os usuarios da org (ou por role)
- Usuarios veem banner/notificacao para aceitar
- Registro imutavel com timestamp e IP
- Dashboard mostra progresso em tempo real

---

### 6. Biblioteca de Templates e IA

**Pagina `src/pages/PolicyTemplates.tsx`:**
- Grid de templates pre-carregados (ISO 27001, BCB 4.893) + templates custom
- Preview do template antes de usar
- Botao "Usar Template" que cria nova politica pre-preenchida

**Templates pre-carregados (seed data):**
- Politica de Seguranca da Informacao (ISO 27001 / A.5.1)
- Politica de Controle de Acesso (ISO 27001 / A.9.1)
- Politica de Uso Aceitavel (ISO 27001 / A.8.1.3)
- Politica de Backup e Recuperacao (BCB 4.893 / Art. 3)
- Politica de Resposta a Incidentes (NIST CSF / RS)
- Politica de Privacidade e LGPD
- Politica de BYOD
- Politica de Senhas
- Politica de Gestao de Mudancas
- Politica de Continuidade de Negocios

**Edge Function `generate-policy`:**
- Usa IA (Lovable AI / Gemini) para redigir ou adaptar politicas
- Input: template base + setor da empresa + nivel de rigor
- Output: texto da politica em HTML formatado
- Exemplo: "Reescreva esta politica de BYOD para ser mais rigorosa para o setor financeiro"

**Componentes:**
- `src/components/politicas/TemplateCard.tsx`
- `src/components/politicas/TemplatePreviewDialog.tsx`
- `src/components/politicas/AIWriterDialog.tsx` - Dialog para IA gerar/adaptar
- `src/components/politicas/UploadTemplateDialog.tsx` - Upload de templates custom (consultores)

---

### 7. Monitoramento e Vinculo com Riscos

**Integracoes automaticas:**
- Tabela `policy_controls` vincula politicas a controles do diagnostico
- Tabela `policy_risks` vincula politicas a riscos da matriz
- Quando uma politica expira (`expires_at < now()`), trigger notifica admins
- Widget no Dashboard de Politicas mostra politicas expirando nos proximos 30 dias
- Alertas similares ao sistema de evidencias existente

**Componentes:**
- `src/components/politicas/PolicyRiskLink.tsx` - Vincular/desvincular riscos
- `src/components/politicas/ExpiringPoliciesAlert.tsx` - Alertas de validade
- `src/components/politicas/PolicyComplianceWidget.tsx` - Widget de cobertura

---

### 8. Exportacao em PDF

**Edge Function `export-policy-pdf`:**
- Recebe policy_id, gera PDF com o conteudo da politica
- Inclui cabecalho com logo da organizacao (do bucket `logos`)
- Rodape com data de publicacao, versao, assinatura digital (hash)
- Retorna URL do PDF para download

**Componente:**
- `src/components/politicas/ExportPolicyPDF.tsx` - Botao de exportacao no editor

---

### 9. Dashboard de Politicas

**Pagina `src/pages/PolicyDashboard.tsx`:**
- Total de politicas por status (rascunho, publicada, expirada)
- Grafico de cobertura por framework
- Politicas com revisao proxima (proximos 30 dias)
- Campanhas de aceite ativas com % de aderencia
- Atividade recente (ultimas alteracoes, aprovacoes, aceites)

---

### Dependencia: TipTap Editor

Sera necessario instalar a biblioteca **TipTap** para o editor WYSIWYG:
- `@tiptap/react` - Core React
- `@tiptap/starter-kit` - Extensoes basicas (bold, italic, lists, headings)
- `@tiptap/extension-table` - Tabelas
- `@tiptap/extension-link` - Links
- `@tiptap/extension-image` - Imagens
- `@tiptap/extension-placeholder` - Placeholder text
- `@tiptap/extension-mention` - Mencoes (@)

---

### Sequencia de Implementacao

Dado o tamanho, a implementacao sera feita em etapas ordenadas:

1. **Migration do banco** - Todas as tabelas, RLS, triggers e seed dos templates
2. **Layout e navegacao** - PolicyLayout, PolicySidebar, rotas no App.tsx, card no SelecionarModulo
3. **Central de Politicas** - CRUD de politicas + editor TipTap + metadados
4. **Versionamento** - Historico de versoes + snapshot automatico
5. **Comentarios** - Sistema de comentarios aninhados com mencoes
6. **Workflow de aprovacao** - Fluxo completo + notificacoes
7. **Campanhas de aceite** - Criacao, notificacao, aceite, dashboard de aderencia
8. **Templates e IA** - Biblioteca + edge function de geracao com IA
9. **Vinculo com riscos/controles** - Integracao bidirecional
10. **Dashboard** - Metricas e widgets
11. **Exportacao PDF** - Edge function + botao

