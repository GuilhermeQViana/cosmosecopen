

## Suporte a Excel e Google Sheets na Importacao de Controles

### O que muda

Atualmente o sistema aceita apenas arquivos `.csv`. Vamos expandir para aceitar tambem:

1. **Arquivos Excel** (`.xlsx`, `.xls`) - lidos diretamente no navegador
2. **Google Sheets** - via URL publica (o usuario cola o link da planilha compartilhada)

### Nova Dependencia

- **`xlsx`** (SheetJS) - Biblioteca para ler arquivos Excel no browser. Converte planilhas Excel em arrays de dados que o sistema ja sabe processar.

### Mudancas nos Arquivos

**1. `src/hooks/useImportControls.ts`**
- Adicionar funcao `parseExcelToCSV(file: File): Promise<string>` que:
  - Le o arquivo como ArrayBuffer
  - Usa `xlsx.read()` para parsear
  - Pega a primeira sheet
  - Converte para CSV com `xlsx.utils.sheet_to_csv()` usando separador `;`
  - Retorna o conteudo CSV para o pipeline existente processar
- Adicionar funcao `fetchGoogleSheetAsCSV(url: string): Promise<string>` que:
  - Extrai o ID da planilha da URL do Google Sheets
  - Monta a URL de exportacao publica: `https://docs.google.com/spreadsheets/d/{ID}/export?format=csv`
  - Faz fetch e retorna o conteudo CSV
- Atualizar `parseFile` para detectar extensao e chamar o conversor apropriado

**2. `src/components/configuracoes/ImportControlsCSV.tsx`**
- Renomear titulo de "Importar Controles via CSV" para "Importar Controles"
- Atualizar o dropzone para aceitar `.csv`, `.xlsx`, `.xls`
- Atualizar texto: "Arraste um arquivo CSV ou Excel, ou cole um link do Google Sheets"
- Adicionar campo de input para URL do Google Sheets com botao "Carregar"
- Atualizar validacao do `onDrop` para aceitar as novas extensoes
- Quando for arquivo Excel, chamar `parseExcelToCSV` antes de entrar no pipeline de mapeamento
- Quando for URL do Google Sheets, chamar `fetchGoogleSheetAsCSV`
- Mostrar badge do tipo de arquivo detectado (CSV, Excel, Google Sheets)

### Fluxo do Usuario

```text
+---------------------------------------------------+
| Importar Controles                  [Baixar Template] |
+---------------------------------------------------+
|                                                     |
|  [Arraste CSV ou Excel, ou clique para selecionar]  |
|                                                     |
|  ---- ou ----                                       |
|                                                     |
|  Link do Google Sheets:                             |
|  [https://docs.google.com/spreadshee... ] [Carregar]|
|                                                     |
+---------------------------------------------------+
```

### Detalhes Tecnicos

- A lib `xlsx` sera instalada como dependencia do projeto (~500KB gzipped, mas faz tree-shaking)
- A conversao Excel -> CSV acontece inteiramente no browser (sem backend)
- Para Google Sheets, a planilha DEVE estar compartilhada como "Qualquer pessoa com o link pode ver"
- Se a planilha tiver multiplas abas, sera usada a primeira aba automaticamente
- O resto do pipeline (deteccao de delimitador, mapeamento, preview) continua igual - so muda a origem dos dados
- Tratamento de erros especifico: planilha privada, URL invalida, arquivo corrompido

