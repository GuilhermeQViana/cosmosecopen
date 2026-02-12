

## Corrigir Validacao de Criticidade na Importacao

### Problema

A tabela `controls` possui uma constraint (`controls_criticality_check`) que aceita apenas os valores: **baixo**, **medio**, **alto**, **critico**.

Porem, o sistema tem dois problemas:
1. O template CSV de exemplo usa valores errados (`alta`, `media` em vez de `alto`, `medio`)
2. A importacao nao valida nem normaliza o campo `criticality` antes de inserir no banco

### Solucao

**Arquivo: `src/hooks/useImportControls.ts`**

1. Criar mapa de normalizacao que converte variacoes comuns para os valores aceitos:
   - `alta` / `alto` -> `alto`
   - `media` / `medio` / `média` -> `medio`
   - `baixa` / `baixo` -> `baixo`
   - `critica` / `critico` / `crítico` / `crítica` -> `critico`

2. Na funcao `parseCSV`, antes de montar o objeto do controle, normalizar o valor de `criticality` usando esse mapa. Se o valor nao corresponder a nenhum aceito, definir como `undefined` (campo opcional) para evitar o erro de constraint.

3. Corrigir os exemplos no template CSV (`generateCSVTemplate`) para usar `alto` e `medio` em vez de `alta` e `media`.

### Mudancas

```text
parseCSV():
  - Adicionar normalizacao: criticality = normalizeCriticality(row.criticality)
  - Se valor invalido, setar undefined

generateCSVTemplate():
  - Trocar 'alta' por 'alto'
  - Trocar 'media' por 'medio'
```

