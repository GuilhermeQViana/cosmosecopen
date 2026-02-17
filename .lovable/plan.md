
## Adicionar Upload de PDF/DOCX aos Contratos de Fornecedor

### O que sera feito
Adicionar um botao de upload de arquivo (PDF ou DOCX) no formulario de criacao de contrato, armazenando o arquivo no storage e salvando a referencia no campo `file_path` ja existente na tabela.

### Alteracoes

**1. Criar bucket de storage `vendor-contracts` (migracao SQL)**

- Criar bucket privado `vendor-contracts`
- Adicionar politicas RLS para upload, leitura e exclusao baseadas na organizacao do usuario

**2. Atualizar `VendorContractManager.tsx`**

- Adicionar estado `contractFile` (File | null) e `uploading` (boolean)
- Adicionar um campo de upload entre "Observacoes" e os botoes de acao:
  - Input file aceita `.pdf,.docx`
  - Exibe nome do arquivo selecionado com opcao de remover
  - Icone Upload
- No `handleSubmit`:
  - Se ha arquivo, fazer upload para `vendor-contracts/{org_id}/{vendor_id}/{uuid}.ext`
  - Obter URL publica/path e salvar no `file_path` do contrato
- Resetar `contractFile` no `resetForm`

**3. Exibir arquivo anexo nos contratos listados**

- Na listagem de contratos, se `contract.file_path` existir, mostrar um badge/botao "Ver Contrato" que abre o arquivo em nova aba via URL assinada do storage

### Detalhes tecnicos

| Arquivo | Alteracao |
|---|---|
| Nova migracao SQL | Criar bucket `vendor-contracts` + RLS policies |
| `src/components/fornecedores/VendorContractManager.tsx` | Adicionar input file, logica de upload ao storage, exibir link do arquivo |
| `src/hooks/useVendorContracts.ts` | Nenhuma alteracao necessaria (file_path ja existe no tipo) |
