
# Implementar Controles Padrao nos Frameworks

## Resumo

Inserir todos os controles padrao nas tres tabelas de frameworks ja existentes no banco de dados. Atualmente os frameworks existem mas a tabela `controls` esta vazia (0 controles em cada).

## Frameworks e Quantidades

| Framework | Codigo | Controles |
|-----------|--------|-----------|
| ISO/IEC 27001:2022 | iso_27001 | 93 controles (Anexo A) |
| NIST CSF 2.0 | nist_csf | 106 subcategorias |
| BCB/CMN 4.893 | bcb_cmn | ~26 requisitos (artigos) |

Total: aproximadamente **225 controles** a serem inseridos.

## Estrutura dos Dados

Cada controle sera inserido com os seguintes campos:
- **framework_id**: UUID do framework correspondente
- **code**: Codigo padrao do controle (ex: A.5.1, GV.OC-01, Art.3-I)
- **name**: Nome/titulo do controle
- **description**: Descricao detalhada do requisito
- **category**: Agrupamento/dominio (ex: "Controles Organizacionais", "GOVERN")
- **order_index**: Ordem sequencial para exibicao
- **weight**: Peso do controle (1-3 baseado na criticidade)
- **criticality**: Nivel de criticidade (alta, media, baixa)

## Detalhamento por Framework

### 1. ISO/IEC 27001:2022 - Anexo A (93 controles)

4 dominios:
- **A.5 - Controles Organizacionais** (37 controles): A.5.1 a A.5.37
- **A.6 - Controles de Pessoas** (8 controles): A.6.1 a A.6.8
- **A.7 - Controles Fisicos** (14 controles): A.7.1 a A.7.14
- **A.8 - Controles Tecnologicos** (34 controles): A.8.1 a A.8.34

### 2. NIST CSF 2.0 (106 subcategorias)

6 funcoes com 22 categorias:
- **GOVERN (GV)**: GV.OC, GV.RM, GV.RR, GV.PO, GV.SC
- **IDENTIFY (ID)**: ID.AM, ID.RA, ID.IM
- **PROTECT (PR)**: PR.AA, PR.AT, PR.DS, PR.PS, PR.IR
- **DETECT (DE)**: DE.CM, DE.AE
- **RESPOND (RS)**: RS.MA, RS.AN, RS.CO, RS.MI
- **RECOVER (RC)**: RC.RP, RC.CO

### 3. BCB/CMN 4.893/2021 (~26 requisitos)

Organizado por capitulos da resolucao:
- **Politica de Seguranca Cibernetica** (Arts. 2-7)
- **Contratacao de Servicos** (Arts. 11-16)
- **Plano de Acao e Resposta a Incidentes** (Arts. 8-10)
- **Governanca e Comunicacao** (Arts. 17-20)
- **Requisitos Gerais** (Arts. 21-26)

## Implementacao Tecnica

### Passo 1: Migracao SQL

Uma unica migracao SQL contendo todos os INSERTs, organizada em blocos:

```text
1. INSERT INTO controls (...) VALUES (...) -- ISO 27001 (93 registros)
2. INSERT INTO controls (...) VALUES (...) -- NIST CSF 2.0 (106 registros)
3. INSERT INTO controls (...) VALUES (...) -- BCB/CMN 4.893 (26 registros)
```

Cada INSERT usara os UUIDs reais dos frameworks ja existentes no banco:
- bcb_cmn: `dfce6f00-fc2b-4c01-9aa5-7c6fd98c604c`
- iso_27001: `0c917949-b95c-4f92-92d1-83e5c79aa3f3`
- nist_csf: `2fc3c5e0-bd30-4d12-9c0a-c79a53735a92`

### Passo 2: Nenhuma alteracao de codigo

O codigo da aplicacao ja esta preparado para exibir controles. Apos a insercao dos dados:
- A tela de selecao de framework mostrara a contagem correta de controles
- A pagina de diagnostico listara todos os controles agrupados por categoria
- O sistema de avaliacao de maturidade funcionara para cada controle

## Resultado Esperado

Apos a execucao:
1. Os cards dos frameworks mostrarao as contagens corretas (93, 106, 26)
2. Ao selecionar um framework e acessar o Diagnostico, todos os controles serao listados com seus codigos, nomes e descricoes
3. O usuario podera iniciar avaliacoes de maturidade imediatamente
4. Os mapeamentos entre frameworks (framework_mappings) poderao ser criados posteriormente referenciando esses controles
