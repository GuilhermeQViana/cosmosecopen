
# Plano: Mapeamento de Campos CSV e Tutorial de Importacao

## Problema Atual

O sistema de importacao de controles via CSV espera colunas com nomes exatos em ingles (`code`, `name`, `category`, etc.). Se o usuario tiver um arquivo com nomes diferentes (ex: `codigo`, `nome`, `categoria`), a importacao falha sem opcao de corrigir sem editar o arquivo original.

Alem disso, nao ha instrucoes claras sobre:
- Quais campos sao obrigatorios vs opcionais
- Formato esperado para cada campo
- Valores validos para campos como peso e criticidade

---

## Solucao Proposta

### 1. Novo Fluxo de Importacao em Etapas

Implementar um wizard de 3 etapas:

```text
[1. Upload] -> [2. Mapeamento] -> [3. Preview/Importar]
```

### 2. Etapa de Mapeamento de Campos

Apos o upload, mostrar interface para mapear colunas do CSV aos campos do sistema:

```text
+--------------------------------------------------+
| Mapeamento de Campos                              |
|--------------------------------------------------|
| Coluna do Arquivo     | Campo do Sistema         |
|--------------------------------------------------|
| "codigo"             -> [code (Obrigatorio)]   v |
| "nome_controle"      -> [name (Obrigatorio)]   v |
| "grupo"              -> [category]              v |
| "desc"               -> [description]           v |
| "peso_risco"         -> [weight]                v |
+--------------------------------------------------+
| [x] Salvar mapeamento para proximas importacoes |
+--------------------------------------------------+
```

**Funcionalidades:**
- **Mapeamento automatico inteligente**: detecta colunas similares (codigo -> code, nome -> name)
- **Mapeamento manual**: dropdown para cada coluna com campos disponiveis
- **Validacao em tempo real**: mostra se campos obrigatorios estao mapeados
- **Persistencia opcional**: salvar mapeamento no localStorage para reutilizar

### 3. Tutorial Integrado (Passo a Passo)

Adicionar um componente colapsavel no inicio do fluxo:

```text
+--------------------------------------------------+
| Como Preparar seu Arquivo CSV                 [-]|
|--------------------------------------------------|
|                                                  |
| Passo 1: Estrutura do Arquivo                    |
| O arquivo CSV deve ter uma linha de cabecalho    |
| com os nomes das colunas na primeira linha.      |
|                                                  |
| Passo 2: Campos Obrigatorios                     |
| - code: Codigo unico do controle (ex: CTRL-001)  |
| - name: Nome descritivo do controle              |
|                                                  |
| Passo 3: Campos Opcionais                        |
| +----------------------------------------------+ |
| | Campo         | Descricao         | Exemplo | |
| |---------------|-------------------|---------|  |
| | category      | Agrupamento       | Govern. |  |
| | description   | Texto explicativo | ...     |  |
| | weight        | Peso 1-5          | 3       |  |
| | criticality   | baixa/media/alta  | alta    |  |
| +----------------------------------------------+ |
|                                                  |
| Passo 4: Dicas                                   |
| - Use aspas para textos com virgulas            |
| - Codigos duplicados serao rejeitados           |
| - Linhas vazias serao ignoradas                 |
|                                                  |
| [Baixar Template de Exemplo]                     |
+--------------------------------------------------+
```

---

## Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `src/components/configuracoes/CSVFieldMapper.tsx` | **Criar** - Componente de mapeamento de campos |
| `src/components/configuracoes/CSVImportTutorial.tsx` | **Criar** - Tutorial passo a passo |
| `src/components/configuracoes/ImportControlsCSV.tsx` | **Modificar** - Adicionar etapas e integrar novos componentes |
| `src/hooks/useImportControls.ts` | **Modificar** - Suportar mapeamento customizado |

---

## Detalhes de Implementacao

### 1. CSVImportTutorial.tsx (Novo Componente)

Componente colapsavel com instrucoes detalhadas:

```tsx
// Estrutura principal
interface CSVImportTutorialProps {
  onDownloadTemplate: () => void;
}

// Secoes do tutorial
const tutorialSteps = [
  {
    title: 'Estrutura do Arquivo',
    content: 'Seu arquivo CSV deve ter uma linha de cabecalho...'
  },
  {
    title: 'Campos Obrigatorios',
    items: [
      { field: 'code', description: 'Codigo unico...', example: 'CTRL-001' },
      { field: 'name', description: 'Nome descritivo...', example: 'Politica de Seguranca' }
    ]
  },
  // ...
];
```

### 2. CSVFieldMapper.tsx (Novo Componente)

Interface de mapeamento visual:

```tsx
interface CSVFieldMapperProps {
  csvHeaders: string[];
  onMappingChange: (mapping: FieldMapping) => void;
  onConfirm: () => void;
  onBack: () => void;
}

interface FieldMapping {
  [csvColumn: string]: string | null; // campo do sistema ou null
}

// Campos do sistema
const SYSTEM_FIELDS = [
  { key: 'code', label: 'Codigo', required: true },
  { key: 'name', label: 'Nome', required: true },
  { key: 'category', label: 'Categoria', required: false },
  { key: 'description', label: 'Descricao', required: false },
  { key: 'weight', label: 'Peso (1-5)', required: false },
  { key: 'criticality', label: 'Criticidade', required: false },
  { key: 'weight_reason', label: 'Justificativa do Peso', required: false },
  { key: 'implementation_example', label: 'Exemplo de Implementacao', required: false },
  { key: 'evidence_example', label: 'Exemplo de Evidencia', required: false },
  { key: 'order_index', label: 'Ordem', required: false },
];

// Funcao de auto-mapeamento
function autoMapFields(csvHeaders: string[]): FieldMapping {
  const mapping: FieldMapping = {};
  const synonyms: Record<string, string[]> = {
    code: ['code', 'codigo', 'cod', 'id', 'identificador'],
    name: ['name', 'nome', 'titulo', 'title', 'controle'],
    category: ['category', 'categoria', 'grupo', 'group', 'dominio'],
    description: ['description', 'descricao', 'desc', 'objetivo'],
    weight: ['weight', 'peso', 'importancia'],
    criticality: ['criticality', 'criticidade', 'severidade', 'prioridade'],
    // ...
  };
  
  csvHeaders.forEach(header => {
    const normalized = header.toLowerCase().trim();
    for (const [field, aliases] of Object.entries(synonyms)) {
      if (aliases.includes(normalized)) {
        mapping[header] = field;
        break;
      }
    }
    if (!mapping[header]) mapping[header] = null;
  });
  
  return mapping;
}
```

### 3. Modificar useImportControls.ts

Adicionar suporte a mapeamento customizado:

```tsx
// Novo tipo para mapeamento
export type FieldMapping = Record<string, string | null>;

// Funcao parseCSV recebe mapeamento opcional
const parseCSV = useCallback((content: string, customMapping?: FieldMapping): ImportResult => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const header = parseCSVLine(lines[0]).map((h) => h.trim());
  
  // Se nao houver mapeamento, usar cabecalho direto (comportamento atual)
  // Se houver, aplicar traducao
  const effectiveMapping = customMapping || 
    Object.fromEntries(header.map(h => [h, h.toLowerCase()]));
  
  // Validar campos obrigatorios mapeados
  const mappedFields = new Set(Object.values(effectiveMapping).filter(Boolean));
  if (!mappedFields.has('code') || !mappedFields.has('name')) {
    throw new Error('Os campos "code" e "name" devem ser mapeados');
  }
  
  // Resto da logica usando effectiveMapping para traduzir colunas
  // ...
}, []);

// Nova funcao para extrair headers do CSV
const extractHeaders = useCallback((content: string): string[] => {
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  return parseCSVLine(lines[0]).map(h => h.trim());
}, []);
```

### 4. Modificar ImportControlsCSV.tsx

Adicionar wizard de etapas:

```tsx
type ImportStep = 'tutorial' | 'upload' | 'mapping' | 'preview';

export function ImportControlsCSV({ frameworkId, onSuccess, onCancel }: ImportControlsCSVProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [showTutorial, setShowTutorial] = useState(true);
  
  // Ao fazer upload, extrair headers e ir para mapeamento
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    const content = await file.text();
    setCsvContent(content);
    
    const headers = extractHeaders(content);
    setCsvHeaders(headers);
    
    // Auto-mapear e ir para etapa de mapeamento
    const autoMapping = autoMapFields(headers);
    setFieldMapping(autoMapping);
    setStep('mapping');
  }, []);
  
  // Renderizar etapa atual
  switch (step) {
    case 'upload':
      return (
        <>
          {showTutorial && (
            <CSVImportTutorial 
              onDownloadTemplate={downloadTemplate}
              onClose={() => setShowTutorial(false)}
            />
          )}
          {/* Area de upload atual */}
        </>
      );
      
    case 'mapping':
      return (
        <CSVFieldMapper
          csvHeaders={csvHeaders}
          initialMapping={fieldMapping}
          onMappingChange={setFieldMapping}
          onConfirm={() => {
            parseFile(csvContent!, fieldMapping);
            setStep('preview');
          }}
          onBack={() => setStep('upload')}
        />
      );
      
    case 'preview':
      return (/* Tabela de preview atual */);
  }
}
```

---

## Interface do Mapeador de Campos

```text
+----------------------------------------------------------+
| Mapeamento de Campos                                      |
|----------------------------------------------------------|
| Seu arquivo tem as seguintes colunas. Associe cada uma   |
| ao campo correspondente do sistema:                       |
|----------------------------------------------------------|
|                                                          |
| Coluna do CSV          Campo do Sistema                  |
| +-----------------+    +-------------------------+       |
| | codigo         | -> | [v] Codigo (code) *     |       |
| +-----------------+    +-------------------------+       |
| | nome_controle  | -> | [v] Nome (name) *       |       |
| +-----------------+    +-------------------------+       |
| | grupo          | -> | [v] Categoria           |       |
| +-----------------+    +-------------------------+       |
| | descricao      | -> | [v] Descricao           |       |
| +-----------------+    +-------------------------+       |
| | nivel_risco    | -> | [ ] Nao mapear          |       |
| +-----------------+    +-------------------------+       |
|                                                          |
| * Campos obrigatorios                                    |
|                                                          |
| +---------------------+                                  |
| | [ ] Lembrar mapeamento para este formato de arquivo   |
| +---------------------+                                  |
|                                                          |
| Status: 2/2 campos obrigatorios mapeados [OK]           |
|                                                          |
|           [Voltar]  [Continuar para Preview]            |
+----------------------------------------------------------+
```

---

## Interface do Tutorial

```text
+----------------------------------------------------------+
| [?] Como Preparar seu Arquivo CSV                    [X] |
|----------------------------------------------------------|
|                                                          |
| 1. ESTRUTURA DO ARQUIVO                                  |
| ---------------------------------------------------------|
| Seu arquivo CSV deve ter:                                |
| - Primeira linha: nomes das colunas (cabecalho)         |
| - Demais linhas: dados dos controles                    |
| - Separador: virgula (,) ou ponto-e-virgula (;)         |
|                                                          |
| 2. CAMPOS OBRIGATORIOS                                   |
| ---------------------------------------------------------|
| +--------+-----------------------------------+----------+ |
| | Campo  | Descricao                        | Exemplo   | |
| |--------|----------------------------------|----------| |
| | code   | Identificador unico do controle | CTRL-001  | |
| | name   | Nome/titulo do controle         | Politica..| |
| +--------+-----------------------------------+----------+ |
|                                                          |
| 3. CAMPOS OPCIONAIS                                      |
| ---------------------------------------------------------|
| +---------------------+---------------------------+-----+|
| | Campo               | Descricao                | Ex. ||
| |---------------------|--------------------------|-----||
| | category            | Agrupamento logico       | Gov ||
| | description         | Texto explicativo        | ... ||
| | weight              | Peso 1-5 (importancia)   | 3   ||
| | criticality         | baixa, media ou alta     | alta||
| | weight_reason       | Justificativa do peso    | ... ||
| | implementation_example| Como implementar       | ... ||
| | evidence_example    | Evidencias esperadas     | ... ||
| | order_index         | Ordem de exibicao        | 1   ||
| +---------------------+---------------------------+-----+|
|                                                          |
| 4. DICAS IMPORTANTES                                     |
| ---------------------------------------------------------|
| - Nomes de colunas podem variar - voce pode mapear      |
|   manualmente na proxima etapa                          |
| - Textos com virgulas devem estar entre aspas           |
| - Codigos duplicados serao rejeitados                   |
| - Linhas vazias serao ignoradas automaticamente         |
| - Peso deve ser numero de 1 a 5                         |
|                                                          |
|                          [Baixar Template de Exemplo]    |
+----------------------------------------------------------+
```

---

## Resultado Esperado

1. Usuario pode importar arquivos CSV com qualquer nome de coluna
2. Mapeamento automatico funciona para nomes comuns em PT/EN
3. Mapeamento manual permite flexibilidade total
4. Tutorial integrado elimina duvidas sobre formato
5. Validacao em tempo real mostra campos faltantes antes da importacao
6. Opcao de salvar mapeamento acelera futuras importacoes

---

## Secao Tecnica

### Persistencia do Mapeamento

O mapeamento sera salvo no localStorage com chave baseada no hash dos headers:

```typescript
// Gerar chave unica para conjunto de headers
function getMappingKey(headers: string[]): string {
  const sorted = [...headers].sort().join('|');
  return `csv-mapping-${btoa(sorted).slice(0, 16)}`;
}

// Salvar/recuperar mapeamento
function saveMappingToStorage(headers: string[], mapping: FieldMapping): void {
  localStorage.setItem(getMappingKey(headers), JSON.stringify(mapping));
}

function loadMappingFromStorage(headers: string[]): FieldMapping | null {
  const saved = localStorage.getItem(getMappingKey(headers));
  return saved ? JSON.parse(saved) : null;
}
```

### Algoritmo de Auto-Mapeamento

Prioridade de matching:
1. Match exato (case-insensitive)
2. Match por sinonimo conhecido
3. Match por similaridade (Levenshtein distance < 3)
4. Nao mapeado

### Validacoes Adicionais no Mapeamento

- Nao permitir mapear a mesma coluna CSV para dois campos do sistema
- Nao permitir mapear duas colunas CSV para o mesmo campo do sistema
- Mostrar warning se campos opcionais importantes nao estao mapeados

