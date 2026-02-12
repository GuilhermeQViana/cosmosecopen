

## Sumario de Preenchimento no Template de Importacao de Fornecedores

### Objetivo
Adicionar uma secao de referencia visual na etapa de Upload do wizard de importacao, logo abaixo do botao "Baixar Template", mostrando um guia completo com todas as opcoes validas para cada campo do CSV. Isso ajuda o usuario a preencher corretamente sem precisar adivinhar.

---

### O que vai mudar

Na etapa "Upload" do `ImportVendorsDialog`, abaixo do card de template, sera adicionado um card expansivel (Collapsible) com o titulo **"Guia de preenchimento dos campos"**. Ao expandir, o usuario vera uma tabela/lista com:

| Campo | Obrigatorio | Formato / Valores aceitos |
|-------|-------------|--------------------------|
| codigo | Nao (auto-gerado) | Texto livre. Ex: VND-001, VND-002. Se vazio, sera gerado automaticamente |
| nome | Sim | Texto livre. Nome do fornecedor. Ex: Amazon AWS |
| descricao | Nao | Texto livre. Descricao do servico prestado |
| categoria | Nao | Tecnologia, Cloud, Servicos, Consultoria, Infraestrutura, Seguranca, Telecom, Outros |
| criticidade | Nao (padrao: media) | critica, alta, media, baixa |
| status | Nao (padrao: ativo) | ativo, inativo, em_avaliacao, bloqueado |
| contato_nome | Nao | Texto livre. Nome da pessoa de contato |
| contato_email | Nao | Email valido. Ex: joao@empresa.com |
| contato_telefone | Nao | Texto livre. Ex: 11999990000 |
| inicio_contrato | Nao | Data no formato AAAA-MM-DD. Ex: 2024-01-15 |
| fim_contrato | Nao | Data no formato AAAA-MM-DD. Ex: 2026-12-31 |
| tipo_servico | Nao | Texto livre. Ex: cloud, consultoria, SaaS |
| classificacao_dados | Nao (padrao: nenhum) | publica, interna, confidencial, restrita |

---

### Detalhes Tecnicos

**Arquivo modificado:**
- `src/components/fornecedores/ImportVendorsDialog.tsx`

**Mudancas:**
- Importar `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` de `@/components/ui/collapsible`
- Importar `ChevronDown` de lucide-react
- Adicionar um componente `Collapsible` abaixo do card de template na etapa "upload"
- Dentro, renderizar uma tabela com 3 colunas: Campo, Obrigatorio (sim/nao), Valores Aceitos
- Dados da tabela extraidos das constantes ja existentes: `VENDOR_CATEGORIES`, `VENDOR_CRITICALITY`, `VENDOR_STATUS`, `VENDOR_DATA_CLASSIFICATION` e `VENDOR_SYSTEM_FIELDS`
- O card inicia fechado para nao poluir a tela, com um botao "Ver guia de preenchimento" que expande

**Nenhum novo arquivo sera criado** -- e uma alteracao pontual no dialog existente.

