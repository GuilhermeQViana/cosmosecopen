
# Gerenciador de Campanhas de Qualificacao de Fornecedores

## Visao Geral

Transformar o atual "Portal do Fornecedor" (que usa perguntas fixas hardcoded) em um **Gerenciador de Campanhas de Qualificacao** completo com 3 pilares: **Construtor de Formularios**, **Experiencia do Fornecedor** e **Dashboard de Gestao**.

---

## Fase 1 — Modelo de Dados (Migracao SQL)

### Novas tabelas

1. **`qualification_templates`** — Templates de questionario criados pelo admin
   - `id`, `organization_id`, `name`, `description`, `version` (int, default 1), `status` (rascunho/publicado/arquivado), `created_by`, `created_at`, `updated_at`

2. **`qualification_questions`** — Perguntas de cada template
   - `id`, `template_id` (FK), `order_index`, `label` (texto da pergunta), `type` (text/multiple_choice/upload/date/currency/number), `options` (JSONB - para multipla escolha), `weight` (int, pontos da pergunta), `is_required`, `is_ko` (criterio eliminatorio), `ko_value` (valor que reprova), `conditional_on` (id da pergunta pai, nullable), `conditional_value` (valor que ativa esta pergunta), `created_at`

3. **`qualification_campaigns`** — Campanhas disparadas (vincula template + fornecedor)
   - `id`, `organization_id`, `template_id` (FK), `template_version` (int, snapshot da versao usada), `vendor_id` (FK vendors), `token` (uuid, link publico), `status` (pendente/em_preenchimento/respondido/em_analise/devolvido/aprovado/reprovado), `expires_at`, `score` (numeric, calculado), `risk_classification` (baixo/medio/alto), `ko_triggered` (boolean), `reviewer_notes`, `approved_by`, `approved_at`, `created_by`, `created_at`, `updated_at`

4. **`qualification_responses`** — Respostas do fornecedor
   - `id`, `campaign_id` (FK), `question_id` (FK), `answer_text`, `answer_option` (JSONB), `answer_file_url`, `score_awarded` (numeric, calculado), `created_at`, `updated_at`

### Alteracoes em tabelas existentes
- A tabela `vendor_portal_tokens` permanece para compatibilidade, mas as novas campanhas usam `qualification_campaigns` com seu proprio campo `token`.

---

## Fase 2 — Pilar 1: Construtor de Formularios (Admin)

### Componentes

1. **`QualificationTemplatesList`** — Lista de templates com acoes (criar, duplicar, editar, arquivar)
2. **`QualificationTemplateBuilder`** — Editor do formulario:
   - Lista de perguntas com drag-and-drop (usando o `DraggableControlList` como referencia do pattern existente)
   - Cada pergunta: tipo de campo, texto, opcoes, peso, obrigatoriedade
   - Toggle "Criterio KO" com campo para definir valor que reprova
   - Logica condicional: selecionar pergunta pai e valor de ativacao
   - Preview lateral do formulario
3. **`QualificationScoreConfig`** — Configuracao de faixas de classificacao (0-50 Alto Risco, 51-80 Medio, 81-100 Baixo)
4. **Versionamento**: Ao editar um template que ja possui campanhas respondidas, o sistema incrementa a `version` e mantem as respostas vinculadas a versao anterior

### Hooks
- `useQualificationTemplates` — CRUD de templates
- `useQualificationQuestions` — CRUD de perguntas de um template

---

## Fase 3 — Pilar 2: Experiencia do Fornecedor e Distribuicao

### Disparo de Campanhas

1. **`StartQualificationCampaignDialog`** — Substituir o `VendorPortalManager` atual:
   - Selecionar template publicado
   - Definir validade (dias)
   - Enviar para 1 ou N fornecedores simultaneamente
   - Gera token unico por fornecedor/campanha

### Portal do Fornecedor (pagina publica)

2. **`VendorQualificationPortal`** — Substituir o `VendorPortal.tsx`:
   - Renderiza o formulario dinamicamente a partir das perguntas do template
   - Suporte a tipos: texto, multipla escolha, upload de arquivo, data, moeda
   - Logica condicional: mostra/esconde perguntas com base nas respostas
   - Barra de progresso de preenchimento
   - Status visivel: "Pendente", "Devolvido para Correcao" (com comentarios do revisor)
   - Botao "Salvar Rascunho" + "Enviar Respostas"

### Download/Upload Offline

3. **Edge Function `export-qualification-template`** — Gera Excel (.xlsx) com:
   - Coluna A: numero da pergunta
   - Coluna B: texto da pergunta
   - Coluna C: tipo de resposta esperada
   - Coluna D: celula para preenchimento (template travado)
4. **Edge Function `import-qualification-responses`** — Recebe upload de Excel preenchido:
   - Le as celulas de resposta
   - Mapeia para as perguntas pelo indice
   - Preenche `qualification_responses` automaticamente
   - Retorna erros de validacao se houver

### Edge Function atualizada
5. **`vendor-qualification-portal`** — Nova edge function (verify_jwt: false) para:
   - GET: carregar dados da campanha + perguntas do template
   - POST: salvar respostas (rascunho ou envio final)
   - PUT: re-enviar apos correcao

---

## Fase 4 — Pilar 3: Dashboard de Gestao e Classificacao

### Componentes

1. **`QualificationCampaignsDashboard`** — Visao geral:
   - Cards: campanhas pendentes, respondidas, aprovadas, reprovadas
   - Filtros por fornecedor, template, status, periodo
   - Tabela com score, classificacao e acoes

2. **`QualificationScoreCard`** — Detalhe da campanha respondida:
   - Score calculado (0-100) com classificacao automatica por cor
   - Flag KO se criterio eliminatorio foi acionado
   - Respostas expandiveis por pergunta
   - Botoes: "Aprovar", "Devolver para Correcao", "Reprovar"

3. **`QualificationComparison`** — Side-by-side:
   - Selecionar 2-3 fornecedores que responderam o mesmo template
   - Tabela comparativa pergunta a pergunta com scores

4. **`QualificationApprovalWorkflow`** — Workflow:
   - Score >= 81: aprovacao automatica (configuravel)
   - Score 51-80: notificacao para gestor aprovar manualmente
   - Score <= 50 ou KO: bloqueio automatico

### Hooks
- `useQualificationCampaigns` — Lista campanhas com filtros
- `useQualificationResponses` — Respostas de uma campanha
- `useQualificationScore` — Calculo do score

### Calculo de Score (logica)
```text
Para cada pergunta respondida:
  - Multipla escolha: (valor_opcao_selecionada / valor_maximo) * peso
  - Texto/Upload: 100% do peso se preenchido (ou avaliacao manual)
  - KO: se resposta == ko_value -> score = 0, ko_triggered = true

Score Final = (soma_scores / soma_pesos_maximos) * 100
```

---

## Fase 5 — Rotas e Navegacao

- **`/vrm/qualificacao`** — Dashboard de campanhas (dentro do VendorLayout)
- **`/vrm/qualificacao/templates`** — Gerenciar templates
- **`/vrm/qualificacao/templates/:id`** — Builder de template
- **`/vrm/qualificacao/:id`** — Detalhe de campanha respondida
- **`/vrm/qualificacao/comparar`** — Comparativo side-by-side
- **`/qualification/:token`** — Portal publico do fornecedor (fora do layout)

### Menu lateral (VendorSidebar)
- Adicionar item "Qualificacao" com sub-itens: Dashboard, Templates

---

## Sequencia de Implementacao

Devido a complexidade, a implementacao sera dividida em etapas:

1. **Etapa 1**: Migracao SQL (todas as tabelas + RLS) + hooks basicos
2. **Etapa 2**: Construtor de templates (CRUD + drag-and-drop de perguntas)
3. **Etapa 3**: Disparo de campanhas + portal publico do fornecedor (formulario dinamico)
4. **Etapa 4**: Calculo de score + dashboard de gestao + workflow de aprovacao
5. **Etapa 5**: Download/upload Excel offline + importacao automatica de respostas
6. **Etapa 6**: Comparativo side-by-side + versionamento de templates

---

## O que NAO muda

- Tabelas existentes (`vendor_portal_tokens`, `vendor_assessments`, etc.) permanecem intactas
- O portal antigo (`/vendor-portal/:token`) continua funcionando para links ja gerados
- Toda a estrutura de hooks e componentes do VRM existente e preservada
