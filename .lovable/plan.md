

# Melhorias no Módulo de Gestão de Fornecedores (VRM)

Após análise completa do módulo, identifiquei as seguintes áreas de melhoria organizadas por prioridade:

---

## 1. Questionário de Qualificação do Fornecedor (Portal Externo)

**Problemas atuais:**
- O portal externo (`VendorQualificationPortal`) não suporta upload de arquivos — o campo `answer_file_url` existe mas não há UI de upload
- Não há validação de campos obrigatórios antes do envio final
- Falta indicação visual de perguntas KO (eliminatórias) para o fornecedor
- Não há confirmação antes do envio definitivo (só draft vs submit)

**Melhorias propostas:**
- Adicionar upload de arquivos no portal (usando storage público ou URL assinada temporária)
- Validar campos `is_required` antes de permitir envio final
- Exibir aviso visual em perguntas KO
- Adicionar dialog de confirmação antes do envio definitivo

---

## 2. Avaliação Interna de Fornecedor

**Problemas atuais:**
- O formulário de avaliação (`VendorAssessmentForm`) não exibe peso/weight dos requisitos
- Não há indicação de criticidade do requisito durante a avaliação
- Falta resumo por domínio com score parcial visível no header

**Melhorias propostas:**
- Mostrar badge de peso em cada requisito
- Exibir score parcial por domínio nas tabs

---

## 3. VendorCard e Listagem

**Problemas atuais:**
- Não mostra data da última avaliação no card
- Não mostra status da última campanha de qualificação
- Falta indicador visual de contratos vencidos vs vencendo

**Melhorias propostas:**
- Adicionar data da última avaliação e score no card
- Badge de status da qualificação mais recente
- Destaque vermelho para contratos já vencidos

---

## 4. Dashboard VRM

**Problemas atuais:**
- Não mostra métricas de qualificação (campanhas pendentes, taxa de resposta)
- Falta widget de fornecedores com qualificação vencida/expirada

**Melhorias propostas:**
- Adicionar cards de métricas de qualificação
- Widget de campanhas pendentes de resposta

---

## 5. Workflow de Aprovação

**Problemas atuais:**
- A aprovação/reprovação na campanha de qualificação e na avaliação interna são workflows separados sem conexão
- Não há notificação automática ao fornecedor quando a campanha é devolvida

**Melhorias propostas:**
- Unificar timeline de eventos (avaliação + qualificação) no detalhe do fornecedor
- Gerar notificação interna quando campanha muda de status

---

## Plano de Implementação Sugerido

Recomendo atacar em fases:

| Fase | Escopo | Complexidade |
|------|--------|-------------|
| **Fase 1** | Validação de obrigatórios + confirmação no portal externo | Baixa |
| **Fase 2** | Upload de arquivos no portal + indicação de perguntas KO | Média |
| **Fase 3** | Melhorias no VendorCard (datas, badges, contratos) | Baixa |
| **Fase 4** | Métricas de qualificação no Dashboard VRM | Média |
| **Fase 5** | Score por domínio visível + peso nos requisitos | Baixa |

### Arquivos impactados

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/VendorQualificationPortal.tsx` | Validação, upload, KO badges, confirmação |
| `src/components/fornecedores/VendorAssessmentForm.tsx` | Peso visível, score por domínio |
| `src/components/fornecedores/VendorCard.tsx` | Data avaliação, badge qualificação, contratos |
| `src/pages/FornecedoresDashboard.tsx` | Métricas de qualificação |
| `supabase/functions/vendor-qualification-portal/index.ts` | Suporte a upload (se necessário) |

Nenhuma migração SQL necessária — todas as estruturas de dados já existem.

