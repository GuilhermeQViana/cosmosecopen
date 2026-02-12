

## Plano de Implementacao: 6 Funcionalidades de IA no Modulo VRM

### Visao Geral

Implementar inteligencia artificial em 6 pontos estrategicos do modulo de Gestao de Fornecedores (VRM), utilizando Lovable AI (gateway ja configurado com `LOVABLE_API_KEY`). Todas as funcionalidades usarao o modelo `google/gemini-3-flash-preview` via Edge Functions dedicadas.

---

### Fase 1: Geracao Automatica de Planos de Acao para Fornecedores

**Objetivo:** Ao concluir uma avaliacao de fornecedor, gerar automaticamente planos de acao para requisitos com compliance_level abaixo de 3.

**Arquivos:**
- Nova Edge Function: `supabase/functions/generate-vendor-action-plans/index.ts`
- Modificar: `src/components/fornecedores/VendorAssessmentForm.tsx` (adicionar botao "Gerar Planos com IA" apos salvar avaliacao)
- Modificar: `src/components/fornecedores/VendorActionPlanManager.tsx` (adicionar botao "Gerar com IA" no header)

**Logica:**
- Reutilizar o padrao ja existente em `generate-bulk-action-plans` (batches, retries, rate limit handling)
- A Edge Function recebe `assessmentId`, busca respostas com compliance < 3, envia para IA com contexto do requisito e fornecedor
- IA retorna titulo, descricao, prioridade e subtarefas para cada plano
- Frontend salva os planos via `useCreateVendorActionPlan` e exibe um dialog de progresso (igual ao `GenerateAIPlansDialog` do diagnostico)

**Prompt da IA:** Incluira nome do fornecedor, criticidade, dominio do requisito, nivel de compliance atual e descricao do requisito.

---

### Fase 2: Resumo Executivo Inteligente no Relatorio

**Objetivo:** Adicionar uma secao de analise gerada por IA no relatorio PDF do fornecedor.

**Arquivos:**
- Modificar: `supabase/functions/generate-vendor-report/index.ts`

**Logica:**
- Apos coletar todos os dados (scores, respostas, domainScores), enviar um resumo estruturado para a IA
- IA retorna: pontos fortes (top 3), areas criticas (top 3), recomendacoes priorizadas e nivel de confianca geral
- Inserir a analise como uma nova secao HTML "Analise Executiva (IA)" entre o score geral e a tabela de dominios
- Usar `tool_choice` para extrair JSON estruturado (pontos fortes, fraquezas, recomendacoes)
- Incluir disclaimer: "Analise gerada por inteligencia artificial"

**Impacto:** Zero mudancas no frontend -- o relatorio ja e HTML gerado pela Edge Function.

---

### Fase 3: Analise de Causa Raiz de Incidentes

**Objetivo:** Botao "Sugerir Causa Raiz" em cada incidente aberto que usa IA para propor causa raiz e acoes corretivas.

**Arquivos:**
- Nova Edge Function: `supabase/functions/analyze-vendor-incident/index.ts`
- Modificar: `src/components/fornecedores/VendorIncidentLog.tsx`

**Logica:**
- Adicionar botao com icone `Sparkles` ao lado de "Resolver" em incidentes abertos
- Ao clicar, envia titulo, descricao, impacto, severidade e categoria para a Edge Function
- IA retorna: causa raiz provavel, acoes corretivas sugeridas (3-5 itens) e classificacao ITIL
- Exibe resultado em um card expansivel abaixo do incidente
- Botao "Aplicar" preenche os campos `root_cause` e `corrective_actions` do incidente via `useUpdateVendorIncident`

**Prompt:** Contexto ITIL/ISO 27001, setor do fornecedor, historico de incidentes similares (se existirem).

---

### Fase 4: Classificacao Automatica de Criticidade

**Objetivo:** Ao cadastrar ou editar um fornecedor, sugerir automaticamente a criticidade com base na descricao, categoria e tipo de servico.

**Arquivos:**
- Nova Edge Function: `supabase/functions/classify-vendor-criticality/index.ts`
- Modificar: `src/components/fornecedores/VendorForm.tsx`

**Logica:**
- Adicionar botao "Sugerir com IA" ao lado do campo de Criticidade no formulario
- Ao clicar, envia nome, descricao, categoria, tipo de servico e classificacao de dados para a Edge Function
- IA classifica em baixa/media/alta/critica com justificativa
- Exibe a sugestao como um tooltip/badge ao lado do select, permitindo ao usuario aceitar com um clique ou ignorar
- Usar tool calling para extrair `{ criticality: string, justification: string }`

**Implementacao no form:**
- Novo estado `aiSuggestion: { criticality: string, justification: string } | null`
- Badge animado aparece ao lado do select quando sugestao disponivel
- Botao "Aceitar" aplica `form.setValue('criticality', suggestion.criticality)`

---

### Fase 5: Assistente de Due Diligence

**Objetivo:** Para cada item do checklist de Due Diligence, oferecer perguntas investigativas e alertas de red flags gerados por IA.

**Arquivos:**
- Nova Edge Function: `supabase/functions/assist-due-diligence/index.ts`
- Modificar: `src/components/fornecedores/DueDiligenceDialog.tsx`

**Logica:**
- Adicionar icone `Sparkles` ao lado de cada item do checklist
- Ao clicar, envia nome do item, categoria, descricao, nome do fornecedor e sua categoria para a Edge Function
- IA retorna: 3 perguntas investigativas especificas, possiveis red flags a observar e criterios de aprovacao sugeridos
- Exibe resultado inline abaixo do item em um card com fundo diferenciado
- Cache local (useState) para nao re-gerar ao reabrir o mesmo item na mesma sessao

**Prompt:** Adaptado ao tipo de fornecedor (TI, financeiro, logistica, etc.) e a categoria do item (documental, financeiro, seguranca, legal, operacional).

---

### Fase 6: Widget de Risco Consolidado com IA

**Objetivo:** No painel lateral do fornecedor (VendorDetailSheet), exibir um widget que sintetiza dados de multiplas fontes em uma analise holistica de risco.

**Arquivos:**
- Nova Edge Function: `supabase/functions/vendor-risk-analysis/index.ts`
- Novo componente: `src/components/fornecedores/VendorAIRiskWidget.tsx`
- Modificar: `src/components/fornecedores/VendorDetailSheet.tsx` (inserir widget)

**Logica:**
- Widget aparece como um card colapsavel no topo do detalhe do fornecedor
- Ao expandir (ou botao "Analisar com IA"), coleta dados de:
  - Ultima avaliacao (score, domainScores)
  - Incidentes (quantidade abertos, severidades)
  - SLAs (taxa de conformidade)
  - Contratos (vencimentos proximos)
  - Due Diligence (status, risk score)
- Envia tudo consolidado para a Edge Function
- IA retorna: risk score holistic (0-100), tendencia (melhorando/estavel/piorando), top 3 preocupacoes, recomendacao principal
- Exibe com icones coloridos, barra de risco e texto da recomendacao
- Botao "Atualizar analise" para re-gerar

---

### Configuracao Tecnica Comum

**Todas as Edge Functions seguirao o mesmo padrao:**
- Importar middleware de `_shared/auth.ts`
- Usar `LOVABLE_API_KEY` (ja configurada) 
- Modelo: `google/gemini-3-flash-preview`
- Tratar erros 429 (rate limit) e 402 (creditos) com mensagens claras
- Adicionar ao `supabase/config.toml` com `verify_jwt = false`

**Frontend:**
- Todas as chamadas via `supabase.functions.invoke()`
- Loading states com icone `Sparkles` animado + texto "Analisando com IA..."
- Toast de sucesso/erro com mensagens em portugues
- Erros 429/402 traduzidos para usuario final

---

### Sequencia de Implementacao

| Ordem | Funcionalidade | Complexidade | Impacto |
|-------|---------------|-------------|---------|
| 1 | Planos de Acao (Fase 1) | Media | Alto |
| 2 | Resumo Executivo (Fase 2) | Baixa | Alto |
| 3 | Causa Raiz Incidentes (Fase 3) | Media | Alto |
| 4 | Criticidade Automatica (Fase 4) | Baixa | Medio |
| 5 | Assistente Due Diligence (Fase 5) | Media | Medio |
| 6 | Widget Risco Consolidado (Fase 6) | Alta | Alto |

### Resumo de Arquivos

**Novos (5 Edge Functions + 1 componente):**
- `supabase/functions/generate-vendor-action-plans/index.ts`
- `supabase/functions/analyze-vendor-incident/index.ts`
- `supabase/functions/classify-vendor-criticality/index.ts`
- `supabase/functions/assist-due-diligence/index.ts`
- `supabase/functions/vendor-risk-analysis/index.ts`
- `src/components/fornecedores/VendorAIRiskWidget.tsx`

**Modificados (6 arquivos):**
- `supabase/functions/generate-vendor-report/index.ts`
- `supabase/config.toml`
- `src/components/fornecedores/VendorAssessmentForm.tsx`
- `src/components/fornecedores/VendorActionPlanManager.tsx`
- `src/components/fornecedores/VendorIncidentLog.tsx`
- `src/components/fornecedores/VendorForm.tsx`
- `src/components/fornecedores/DueDiligenceDialog.tsx`
- `src/components/fornecedores/VendorDetailSheet.tsx`

