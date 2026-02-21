

# Atualizar Documentacao com Todos os Recursos da Plataforma

## Resumo

A pagina de documentacao atual cobre apenas uma fracao dos recursos da plataforma. Apos analise de mais de 40 arquivos (paginas, hooks, componentes, sidebars), foram identificados **3 modulos inteiros** e **dezenas de funcionalidades** que nao estao documentadas. A atualizacao ira expandir a documentacao de ~480 linhas para cobrir tudo o que existe na plataforma.

---

## O que falta na documentacao atual

### Modulos inteiros ausentes

1. **Modulo de Politicas** -- 5 paginas completas (Dashboard, Central, Editor, Fluxos de Aprovacao, Campanhas de Aceite, Biblioteca de Modelos) nao tem nenhuma mencao na documentacao
2. **VRM: Qualificacao de Fornecedores** -- Templates de qualificacao, campanhas com portal externo para o fornecedor responder, calculo automatico de score
3. **VRM: Cofre de Evidencias** -- Pagina dedicada para armazenar documentos de fornecedores com classificacao e categorias
4. **VRM: Contratos, SLAs, Incidentes e Due Diligence** -- Funcionalidades completas que aparecem no VendorDetailSheet mas nao na docs

### Funcionalidades ausentes em secoes existentes

- **RBAC (Permissoes por Funcao)**: O sistema agora tem 3 funcoes com permissoes distintas (admin, auditor, analyst) -- implementado recentemente
- **Notificacoes em Tempo Real**: Centro de notificacoes com atualizacao instantanea
- **Geracao com IA em lote**: Dialog que gera planos de acao automaticamente para todos os gaps
- **Historico de Relatorios**: Tabela no banco que persiste relatorios gerados -- implementado recentemente
- **Snapshots de Diagnostico**: Salvar versoes do diagnostico para comparacao temporal
- **Importacao/Exportacao**: Importar controles via CSV, importar dados JSON, exportar backups
- **Feedbacks**: Sistema de avaliacoes por modulo com estrelas
- **Onboarding Checklist**: Widget guia de primeiros passos

---

## Plano de Implementacao

### 1. Atualizar a Sidebar (DocumentationSidebar.tsx)

Adicionar 3 novas secoes na sidebar:

- **Modulo de Politicas** (com subsecoes: Dashboard, Central de Politicas, Editor de Politicas, Fluxos de Aprovacao, Campanhas de Aceite, Biblioteca de Modelos)
- **Qualificacao de Fornecedores** (com subsecoes: Templates, Campanhas, Portal do Fornecedor) -- dentro do VRM existente
- **Inteligencia Artificial** (com subsecoes: Geracao de Planos de Acao, Analise de Risco de Fornecedores, Escritor de Politicas com IA)

E expandir as subsecoes existentes:
- VRM: adicionar Cofre de Evidencias VRM, Contratos e SLAs, Incidentes, Due Diligence, Analise de Risco IA
- Equipe: adicionar Permissoes por Funcao (RBAC), Convites por Email
- Configuracoes: adicionar Importacao/Exportacao de Dados
- Primeiros Passos: adicionar Onboarding Checklist

### 2. Atualizar o conteudo principal (Documentacao.tsx)

#### Secao nova: Modulo de Politicas
- Dashboard de Politicas: metricas de total, publicadas, em revisao, expiradas, proximas revisoes
- Central de Politicas: listagem com filtros por status e categoria, criacao de novas politicas
- Editor de Politicas: editor rico TipTap com toolbar completa, tabelas, links, imagens; painel lateral de metadados, versionamento automatico, comentarios e vinculacoes com controles/riscos
- Fluxos de Aprovacao: criacao de workflows multi-nivel, SLA de aprovacao, aprovacoes pendentes e historico
- Campanhas de Aceite: criar campanhas para funcionarios confirmarem leitura, progresso por campanha
- Biblioteca de Modelos: modelos por categoria e framework, preview, importar/exportar DOCX, usar como base

#### Expandir secao VRM
- Qualificacao de Fornecedores: templates de perguntas com peso e KO, campanhas enviadas por link, portal externo, calculo automatico de score e classificacao de risco
- Cofre de Evidencias VRM: upload categorizado (contrato, certificacao, DDQ, politica, etc.), classificacao por confidencialidade, validade/expiracao
- Contratos e SLAs: gestao de contratos com valores, moedas, datas; acompanhamento de SLAs por metrica
- Incidentes de Fornecedores: registro com severidade, categoria, causa raiz, acoes corretivas
- Due Diligence: checklist estruturado por categoria, status por item, aprovacao final
- Analise de Risco com IA: geracao automatica de analise de risco, top concerns, recomendacoes

#### Expandir secao GRC
- Relatorios: mencionar historico de relatorios gerados (persistencia no banco)
- Diagnostico: snapshots/versoes, geracao de planos em lote com IA, modo auditoria, filtros avancados
- Plano de Acao: mencionar restricao de "Excluir Todos" apenas para admins

#### Expandir secao Equipe
- Permissoes RBAC: tabela detalhada mostrando o que cada funcao pode e nao pode fazer (canEdit, canBulkDelete, canManageTeam, canManageOrg, canExportImport)
- Convites por Email: fluxo de envio de convite, aceitacao por token, validacao de email/expiracao

#### Nova secao: Inteligencia Artificial
- Visao geral dos recursos de IA disponiveis na plataforma
- Geracao de Planos de Acao: individual ou em lote para gaps identificados
- Assistente de Implementacao: guia contextual para implementar controles
- Escritor de Politicas com IA: geracao de rascunho baseado em framework
- Analise de Risco de Fornecedores: avaliacao automatica com score e recomendacoes
- Classificacao de Criticidade: sugestao automatica de nivel de criticidade

### 3. Arquivos a serem modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/documentacao/DocumentationSidebar.tsx` | Adicionar novas secoes e subsecoes ao array `documentationSections` |
| `src/pages/Documentacao.tsx` | Adicionar todo o conteudo das novas secoes e expandir as existentes |

### Detalhes tecnicos

- Reutilizar os componentes existentes: `DocFeature`, `DocStep`, `DocTip`, `DocBadgeList`, `DocTable`, `DocKeyboardShortcut`
- Manter o padrao visual e estrutura identica as secoes ja existentes
- Todos os novos IDs de secao serao unicos e compativeis com navegacao por hash (#)
- Nenhuma dependencia nova necessaria
- A sidebar expandira de 8 para 11 secoes principais

