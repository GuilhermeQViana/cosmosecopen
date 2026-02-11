

# Plano: VRM Completo - Due Diligence, Contratacao e Ciclo de Vida

## Visao Geral

Transformar o modulo VRM de um sistema de *avaliacao periodica* para um **ciclo de vida completo** do fornecedor: desde a prospecao e due diligence pre-contratacao ate o offboarding e monitoramento continuo.

---

## Diagnostico Atual

O modulo VRM ja cobre bem a fase de **avaliacao e monitoramento periodico**. Os gaps estao nas pontas do ciclo:

```text
[FALTA]          [EXISTE]              [EXISTE]           [FALTA]
Prospecao  -->  Avaliacao  -->  Monitoramento  -->  Offboarding
Due Diligence   45 requisitos   Agenda reavaliacao   Desligamento
Classificacao   Aprovacao       Alertas              Revogacao acessos
Contrato        Evidencias      Dashboard            Historico
```

---

## Fase 1: Ciclo de Vida do Fornecedor (Prioridade Alta)

### 1A. Novos Status e Pipeline Visual

**Objetivo:** Representar todas as fases do relacionamento com o fornecedor.

**Mudancas no banco (tabela `vendors`):**
- Adicionar coluna `lifecycle_stage` (TEXT): `prospecto`, `due_diligence`, `em_contratacao`, `ativo`, `em_reavaliacao`, `em_offboarding`, `inativo`, `bloqueado`
- Adicionar coluna `data_classification` (TEXT): `publica`, `interna`, `confidencial`, `restrita`
- Adicionar coluna `service_type` (TEXT): descricao do tipo de servico prestado
- Adicionar coluna `contract_value` (NUMERIC): valor do contrato
- Adicionar coluna `contract_currency` (TEXT, default 'BRL')

**Frontend:**
- Componente `VendorPipeline` - visao Kanban horizontal do pipeline de fornecedores por estagio do ciclo de vida
- Atualizar `VendorForm` com os novos campos (classificacao de dados, tipo de servico, valor de contrato)
- Atualizar `VENDOR_STATUS` para usar os novos estagios

**Arquivos afetados:**
- `src/hooks/useVendors.ts` - novos campos na interface e constantes
- `src/components/fornecedores/VendorForm.tsx` - novos campos
- `src/components/fornecedores/VendorCard.tsx` - indicadores visuais
- Novo: `src/components/fornecedores/VendorPipeline.tsx`
- `src/pages/Fornecedores.tsx` - toggle entre grid e pipeline

### 1B. Due Diligence Pre-Contratacao

**Objetivo:** Checklist estruturado antes de contratar um fornecedor.

**Novo banco:**
- Tabela `vendor_due_diligence` com colunas:
  - `id`, `vendor_id`, `organization_id`
  - `status` (pendente, em_andamento, aprovado, rejeitado)
  - `started_at`, `completed_at`, `approved_by`
  - `inherent_risk_score` (calculado automaticamente)
  - `notes`
  - RLS: `user_belongs_to_org(auth.uid(), organization_id)`

- Tabela `vendor_due_diligence_items` com colunas:
  - `id`, `due_diligence_id`
  - `category` (documentacao, financeiro, seguranca, legal, operacional)
  - `item_name`, `description`
  - `status` (pendente, ok, alerta, reprovado, nao_aplicavel)
  - `observations`, `verified_by`, `verified_at`
  - RLS: via join com `vendor_due_diligence`

**Frontend:**
- Novo: `src/components/fornecedores/DueDiligenceChecklist.tsx` - checklist interativo com categorias
- Novo: `src/components/fornecedores/DueDiligenceDialog.tsx` - dialog para iniciar/gerenciar due diligence
- Novo: `src/components/fornecedores/InherentRiskCalculator.tsx` - formulario com perguntas que calculam automaticamente o risco inerente (tipo de dados, volume, substituibilidade, localizacao)
- Novo: `src/hooks/useDueDiligence.ts` - CRUD hooks

**Items padrao do checklist:**
- Documentacao: CNPJ ativo, Contrato Social, Certidoes Negativas, Alvara
- Financeiro: Demonstrativos financeiros, Referencias comerciais, Seguros
- Seguranca: Politica de Seguranca, Certificacoes (ISO 27001, SOC2), Plano de resposta a incidentes
- Legal/Privacidade: Clausulas LGPD, DPA (Data Processing Agreement), Acordo de Confidencialidade
- Operacional: Plano de continuidade (BCP), SLAs propostos, Capacidade tecnica

### 1C. Classificacao de Risco Inerente Automatizada

**Objetivo:** Substituir a classificacao manual por um score baseado em fatores objetivos.

**Componente `InherentRiskCalculator`:** Formulario com 6 perguntas ponderadas:

1. **Tipo de dados acessados** (peso 3): Publicos (1) / Internos (2) / Pessoais (3) / Sensíveis (4) / Financeiros regulados (5)
2. **Volume de dados** (peso 2): Nenhum (1) / Baixo (2) / Medio (3) / Alto (4) / Massivo (5)
3. **Criticidade do servico** (peso 3): Suporte (1) / Complementar (2) / Importante (3) / Critico (4) / Essencial (5)
4. **Substituibilidade** (peso 2): Facil (1) / Moderada (3) / Dificil (5)
5. **Localizacao** (peso 1): Nacional (1) / LATAM (2) / Internacional com adequacao (3) / Internacional sem adequacao (5)
6. **Historico** (peso 1): Sem incidentes (1) / Incidentes menores (3) / Incidentes graves (5)

Formula: `Score = Soma(resposta x peso) / Soma(peso x 5) x 100`

O score resultante define a criticidade automaticamente e a frequencia de reavaliacao sugerida.

---

## Fase 2: Gestao de Contratos e Incidentes (Prioridade Media)

### 2A. Gestao de Contratos Expandida

**Novo banco:**
- Tabela `vendor_contracts`:
  - `id`, `vendor_id`, `organization_id`
  - `contract_number`, `contract_type` (servico, licenca, consultoria, outsourcing)
  - `start_date`, `end_date`, `renewal_date`
  - `value`, `currency`, `billing_frequency`
  - `auto_renewal` (boolean)
  - `security_clauses` (boolean - contem clausulas de seguranca?)
  - `lgpd_clauses` (boolean)
  - `sla_defined` (boolean)
  - `file_path` (para upload do contrato)
  - `status` (rascunho, ativo, vencido, cancelado, renovado)
  - `notes`

**Frontend:**
- Novo: `src/components/fornecedores/VendorContractManager.tsx` - lista e gerenciamento de contratos
- Novo: `src/components/fornecedores/VendorContractForm.tsx` - formulario de cadastro
- Integrar na `VendorDetailSheet` como nova aba

### 2B. Registro de Incidentes

**Novo banco:**
- Tabela `vendor_incidents`:
  - `id`, `vendor_id`, `organization_id`
  - `incident_date`, `reported_date`, `resolved_date`
  - `severity` (baixa, media, alta, critica)
  - `category` (vazamento_dados, indisponibilidade, violacao_sla, acesso_nao_autorizado, outro)
  - `title`, `description`, `root_cause`, `corrective_actions`
  - `impact_description`
  - `reported_by`, `resolved_by`
  - `status` (aberto, em_investigacao, resolvido, encerrado)

**Frontend:**
- Novo: `src/components/fornecedores/VendorIncidentLog.tsx` - timeline de incidentes
- Novo: `src/components/fornecedores/VendorIncidentForm.tsx` - registro de incidente
- Impacto automatico no risk score do fornecedor: incidentes abertos aumentam o risco
- Nova pagina ou aba no dashboard VRM com visao consolidada de incidentes

### 2C. SLA Tracking

**Novo banco:**
- Tabela `vendor_slas`:
  - `id`, `vendor_id`, `organization_id`, `contract_id`
  - `metric_name` (disponibilidade, tempo_resposta, tempo_resolucao, etc)
  - `target_value`, `unit` (percentual, horas, minutos)
  - `current_value` (preenchido manualmente ou via integracao)
  - `compliance_status` (conforme, atencao, violado)
  - `period` (mensal, trimestral)
  - `measured_at`

**Frontend:**
- Novo: `src/components/fornecedores/VendorSLATracker.tsx` - cards com metricas de SLA
- Integracao visual na `VendorDetailSheet`

---

## Fase 3: Offboarding e Portal (Prioridade Futura)

### 3A. Fluxo de Offboarding

**Novo banco:**
- Tabela `vendor_offboarding`:
  - `id`, `vendor_id`, `organization_id`
  - `reason` (fim_contrato, desempenho, risco, custo, outro)
  - `initiated_at`, `completed_at`, `initiated_by`
  - `status` (iniciado, em_andamento, concluido)
  - `notes`

- Tabela `vendor_offboarding_tasks`:
  - `id`, `offboarding_id`
  - `task_name`, `category` (acessos, dados, legal, financeiro)
  - `status` (pendente, concluido)
  - `completed_by`, `completed_at`, `observations`

**Items padrao do offboarding:**
- Acessos: Revogar credenciais VPN, Revogar acessos a sistemas, Desativar contas
- Dados: Solicitar devolucao de dados, Confirmar destruicao de copias, Obter certificado de destruicao
- Legal: Encerrar contrato, Verificar clausulas pos-contratuais, Periodo de confidencialidade
- Financeiro: Verificar pagamentos pendentes, Encerrar faturamento

**Frontend:**
- Novo: `src/components/fornecedores/VendorOffboardingWizard.tsx` - wizard passo a passo
- Botao "Iniciar Offboarding" no menu do fornecedor
- Novo estagio `em_offboarding` no pipeline

### 3B. Portal do Fornecedor (Self-Assessment) - Diferencial Competitivo

**Conceito:** Link unico e temporario enviado ao fornecedor para que ele mesmo preencha o questionario de avaliacao, faca upload de evidencias e responda as perguntas de due diligence.

**Implementacao:**
- Nova tabela `vendor_portal_tokens` com token unico, validade, vendor_id, escopo (due_diligence, assessment)
- Nova Edge Function para validar token e expor API limitada
- Nova rota publica `/vendor-portal/:token` com formulario externo
- O fornecedor preenche, a equipe interna revisa e aprova

> Esta fase e um diferencial significativo no mercado brasileiro de VRM e pode ser implementada apos as fases 1 e 2 estarem consolidadas.

---

## Fase 4: Dashboard VRM Expandido

### Novos Widgets para o Dashboard

Com os dados das fases anteriores, o dashboard ganha:

- **Pipeline de Fornecedores** - funnel visual (Prospecto -> Due Diligence -> Contratacao -> Ativo -> Offboarding)
- **Incidentes Abertos** - card com contagem por severidade
- **SLA Compliance Rate** - percentual medio de conformidade com SLAs
- **Contratos Vencendo** - ja existe parcialmente, expandir com valor financeiro
- **Due Diligence Pendentes** - quantidade de processos de due diligence em aberto
- **Risk Score Medio** - ja existe, mas agora alimentado pelo risco inerente automatizado

---

## Resumo de Impacto

| Fase | Tabelas Novas | Componentes Novos | Prioridade |
|------|--------------|-------------------|------------|
| 1A - Pipeline | 0 (colunas em vendors) | 1 | Alta |
| 1B - Due Diligence | 2 | 4 | Alta |
| 1C - Risco Inerente | 0 (usa due_diligence) | 1 | Alta |
| 2A - Contratos | 1 | 2 | Media |
| 2B - Incidentes | 1 | 2 | Media |
| 2C - SLA Tracking | 1 | 1 | Media |
| 3A - Offboarding | 2 | 1 | Futura |
| 3B - Portal Fornecedor | 1 + Edge Function | 1 rota publica | Futura |
| 4 - Dashboard | 0 | Widgets | Continua |

---

## Recomendacao de Implementacao

Comecar pela **Fase 1** completa (Pipeline + Due Diligence + Risco Inerente) pois:
1. Resolve o gap mais critico: nao existe processo pre-contratacao
2. Adiciona valor imediato para o publico de consultoria/auditoria
3. Os dados alimentam automaticamente o dashboard ja existente
4. E um diferencial competitivo forte no mercado brasileiro

A **Fase 2** (Contratos + Incidentes + SLA) pode vir em seguida e complementa o ciclo de monitoramento continuo que ja existe parcialmente.

A **Fase 3** (Offboarding + Portal) e transformacional mas depende das fases anteriores estarem maduras.

