

# Import de Perguntas via Excel no Template Builder

## Objetivo
Adicionar ao builder de templates de qualificacao a possibilidade de importar perguntas em massa via arquivo Excel/CSV, com um template para download como modelo.

## Como vai funcionar

1. Um novo botao "Importar Perguntas" aparece ao lado de "Adicionar Pergunta" no builder
2. Ao clicar, abre um dialog com:
   - Botao para baixar o template Excel modelo
   - Area de upload (drag-and-drop) para CSV/XLSX
3. O sistema le o arquivo, valida as perguntas e mostra um preview
4. O usuario confirma e as perguntas sao inseridas no template

## Template de Modelo

O arquivo Excel tera as seguintes colunas:

| Coluna | Obrigatoria | Descricao |
|--------|-------------|-----------|
| pergunta | Sim | Texto da pergunta |
| tipo | Nao | text, multiple_choice, number, date, currency, upload (padrao: text) |
| peso | Nao | Peso em pontos, 1-100 (padrao: 10) |
| obrigatoria | Nao | sim/nao (padrao: sim) |
| ko | Nao | sim/nao - pergunta eliminatoria (padrao: nao) |
| valor_ko | Nao | Valor que elimina (para KO) |
| opcoes | Nao | Para multipla escolha: "Sim(10);Nao(0);Parcial(5)" - label(score) separados por ; |

O template vira com 2-3 linhas de exemplo preenchidas.

## Detalhes Tecnicos

### Novo arquivo: `src/hooks/useImportQualificationQuestions.ts`

- Funcao `generateQuestionsTemplate()` - gera o CSV modelo
- Funcao `downloadQuestionsTemplate()` - dispara o download
- Funcao `parseQuestionsFile(content, delimiter)` - parseia o conteudo e retorna as perguntas validadas
  - Valida campo obrigatorio `pergunta`
  - Normaliza tipo (text, multiple_choice, etc)
  - Parseia opcoes no formato "Label(score);Label(score)"
  - Retorna lista com erros por linha

Reutiliza utilitarios existentes do `useImportControls` (detectDelimiter, parseCSVLine, removeBOM, splitCSVLines, parseExcelToCSV).

### Novo componente: `src/components/configuracoes/ImportQuestionsDialog.tsx`

- Dialog com 2 etapas: Upload e Preview
- Etapa Upload: botao download template + dropzone para arquivo
- Etapa Preview: tabela com perguntas parseadas, indicando validas/invalidas
- Botao "Importar X perguntas" que chama `useUpsertQualificationQuestion` para cada pergunta valida
- Usa o mesmo visual pattern do `ImportControlsCSV` existente (dropzone, tabela de preview, badges de erro)

### Arquivo modificado: `src/pages/QualificationTemplateBuilder.tsx`

- Importar o novo `ImportQuestionsDialog`
- Adicionar estado `showImportDialog`
- Adicionar botao "Importar" (icone Upload) no header, ao lado de "Preview" e "Salvar"
- Tambem adicionar como opcao na area vazia ("Nenhuma pergunta adicionada ainda") ao lado de "Adicionar Pergunta"

### Fluxo de dados

1. Usuario faz upload do arquivo
2. Sistema detecta formato (CSV/XLSX) e converte para CSV se necessario
3. Parser extrai perguntas e valida cada linha
4. Preview mostra resultado com contagem de validos/invalidos
5. Ao confirmar, insere cada pergunta via `useUpsertQualificationQuestion` com `order_index` sequencial (continuando apos as existentes)
6. Dialog fecha, lista de perguntas atualiza automaticamente via invalidacao do React Query

