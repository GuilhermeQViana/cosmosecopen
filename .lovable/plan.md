

## Exportar Templates como DOCX e Importar Modelos via DOCX

### Resumo

Adicionar duas funcionalidades na Biblioteca de Modelos:
1. **Baixar como DOCX** - Botao em cada card de template para exportar o conteudo HTML como arquivo .docx
2. **Importar DOCX** - Botao para o usuario fazer upload de um arquivo .docx, que sera convertido em HTML e salvo como template personalizado da organizacao

### Novas Dependencias

- `html-to-docx` - Converte HTML para DOCX no browser (gera Blob para download)
- `mammoth` - Converte DOCX para HTML no browser (para importacao)

### Mudancas

**1. Funcao utilitaria de download DOCX (`src/lib/docx-utils.ts`)**

Criar arquivo com:
- `downloadTemplateAsDocx(title, htmlContent)` - Converte HTML para DOCX usando `html-to-docx` e dispara o download
- `convertDocxToHtml(file)` - Recebe um File (docx) e retorna HTML string via `mammoth`

**2. Hook `usePolicyTemplates.ts` - Adicionar mutacao de criacao**

Adicionar `createTemplate` mutation para inserir um novo template com `is_system: false` e `organization_id` do usuario na tabela `policy_templates`.

**3. Componente de Import (`src/components/politicas/ImportTemplateDocxDialog.tsx`)**

Dialog com:
- Dropzone para upload de arquivo .docx (reutilizar react-dropzone ja instalado)
- Campos para titulo, descricao e categoria do template
- Preview do conteudo convertido
- Botao de salvar que chama `createTemplate`

**4. Pagina `PolicyTemplates.tsx` - Atualizacoes**

- Adicionar botao "Importar DOCX" no header ao lado do titulo
- Adicionar botao "Baixar" (icone Download) em cada card de template, ao lado de "Preview" e "Usar"
- Adicionar botao "Baixar DOCX" tambem no dialog de preview

### Secao Tecnica

```text
src/lib/docx-utils.ts (novo):
  - downloadTemplateAsDocx(title, html): usa html-to-docx para gerar Blob, cria <a> temporario e dispara download
  - convertDocxToHtml(file): usa mammoth.convertToHtml({ arrayBuffer }) e retorna result.value

src/hooks/usePolicyTemplates.ts:
  - Adicionar useMutation createTemplate que insere em policy_templates com is_system=false

src/components/politicas/ImportTemplateDocxDialog.tsx (novo):
  - Props: open, onOpenChange
  - Estado: file, title, description, category, previewHtml
  - Ao dropar .docx: converte com convertDocxToHtml e mostra preview
  - Ao salvar: chama createTemplate com o HTML convertido

src/pages/PolicyTemplates.tsx:
  - Import do ImportTemplateDocxDialog e downloadTemplateAsDocx
  - Botao "Importar DOCX" no header
  - Botao Download em cada card (3 botoes: Preview, Baixar, Usar)
  - Botao "Baixar DOCX" no dialog de preview
```

