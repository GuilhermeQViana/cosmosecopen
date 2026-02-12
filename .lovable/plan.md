
## Importacao em Massa de Fornecedores via Planilha

### Objetivo
Permitir que o usuario importe todos os seus fornecedores de uma vez a partir de um arquivo CSV/planilha, com template completo para download, mapeamento inteligente de campos e preview antes da importacao.

---

### Como vai funcionar

1. Na pagina de Gestao de Fornecedores, um novo botao **"Importar"** aparecera ao lado do botao "Exportar"
2. Ao clicar, abre um Dialog com wizard de 3 etapas:
   - **Upload**: Arrastar/soltar ou selecionar arquivo CSV. Botao para baixar template preenchido com exemplos
   - **Mapeamento**: Deteccao automatica de colunas e mapeamento inteligente dos campos do CSV para os campos do sistema (codigo, nome, categoria, criticidade, etc.)
   - **Preview**: Tabela mostrando todos os fornecedores a importar, com indicacao de validos/invalidos e erros por linha
3. Ao confirmar, todos os fornecedores validos sao inseridos de uma vez no banco de dados
4. Codigos duplicados (ja existentes) sao sinalizados como erro no preview

### Template CSV

O template incluira todas as colunas do fornecedor com 2 linhas de exemplo:

```text
codigo;nome;descricao;categoria;criticidade;status;contato_nome;contato_email;contato_telefone;inicio_contrato;fim_contrato;tipo_servico;classificacao_dados
VND-001;Amazon AWS;Servicos de cloud computing;Cloud;critica;ativo;Joao Silva;joao@aws.com;11999990000;2024-01-01;2026-12-31;cloud;confidencial
VND-002;Consultoria XYZ;Consultoria em seguranca;Consultoria;media;ativo;Maria Santos;maria@xyz.com;11988880000;2024-06-01;2025-05-31;consultoria;interna
```

---

### Detalhes Tecnicos

**Novos arquivos:**
- `src/hooks/useImportVendors.ts` - Hook de parsing CSV adaptado do `useImportControls.ts`, com campos mapeados para a tabela `vendors` (code, name, description, category, criticality, status, contact_name, contact_email, contact_phone, contract_start, contract_end, service_type, data_classification). Inclui validacao de campos obrigatorios (code, name), deteccao de duplicatas por codigo e geracao/download do template
- `src/components/fornecedores/ImportVendorsDialog.tsx` - Dialog com wizard de 3 etapas (upload, mapeamento, preview) reutilizando o componente `CSVFieldMapper` existente para mapeamento de colunas. Inclui dropzone para upload, preview em tabela com badges de valido/invalido, contadores de resumo e botao de importacao

**Arquivos modificados:**
- `src/pages/Fornecedores.tsx` - Adicionar botao "Importar" (icone Upload) ao lado do "Exportar" no header, e renderizar o `ImportVendorsDialog`
- `src/hooks/useVendors.ts` - Adicionar hook `useBulkCreateVendors` que recebe array de fornecedores e insere todos via `supabase.from('vendors').insert(vendorArray)`, invalidando o cache apos sucesso

**Logica de importacao:**
- Deteccao automatica de delimitador (virgula, ponto-e-virgula, TAB, pipe)
- Mapeamento inteligente com sinonimos (ex: "nome" mapeia para "name", "criticidade" para "criticality")
- Validacao: codigo e nome obrigatorios, criticidade deve ser um dos valores validos, email validado com regex
- Verificacao de duplicatas contra fornecedores ja existentes na organizacao
- Auto-geracao de codigos sequenciais (VND-XXX) caso nao fornecidos
- Bulk insert unico ao confirmar (nao linha a linha)
