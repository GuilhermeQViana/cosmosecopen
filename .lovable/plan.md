

## Expandir Biblioteca de Modelos com Politicas Completas

### Problema Atual

Os 10 templates existentes contem apenas 1 paragrafo cada (60-100 caracteres). Exemplo: a "Politica de Seguranca da Informacao" tem apenas `<h1>...</h1><p>Diretrizes para protecao dos ativos de informacao.</p>`. Isso torna o Preview vazio e o botao "Usar" pouco util.

### O que sera feito

**1. Reescrever os 10 templates existentes com conteudo completo**

Cada template tera entre 800-2000 palavras em HTML estruturado com:
- Objetivo
- Escopo
- Definicoes
- Diretrizes e Requisitos (3-6 subsecoes)
- Responsabilidades
- Penalidades
- Disposicoes Finais

Templates existentes a expandir:
1. Politica de Seguranca da Informacao (ISO 27001)
2. Politica de Controle de Acesso (ISO 27001)
3. Politica de Senhas (ISO 27001)
4. Politica de Uso Aceitavel (ISO 27001)
5. Politica de Backup e Recuperacao (BCB/CMN)
6. Politica de Continuidade de Negocios (BCB/CMN)
7. Politica de BYOD (Seguranca)
8. Politica de Gestao de Mudancas (Seguranca)
9. Politica de Privacidade e LGPD (Privacidade)
10. Politica de Resposta a Incidentes (NIST CSF)

**2. Adicionar 10 novos templates completos**

11. Politica de Classificacao da Informacao (Seguranca, ISO 27001)
12. Politica de Seguranca em Nuvem (Seguranca, ISO 27001)
13. Politica de Desenvolvimento Seguro (Seguranca, NIST CSF)
14. Politica de Gestao de Vulnerabilidades (Seguranca, NIST CSF)
15. Politica de Trabalho Remoto (Acesso, ISO 27001)
16. Politica de Retencao de Dados (Privacidade, LGPD)
17. Politica de Gestao de Terceiros (Seguranca, ISO 27001)
18. Politica de Comunicacao e Midia Social (Seguranca)
19. Politica de Seguranca Fisica (Seguranca, ISO 27001)
20. Politica de Treinamento e Conscientizacao (Seguranca, NIST CSF)

### Implementacao Tecnica

Uma unica migracao SQL com:
- `UPDATE` nos 10 registros existentes substituindo o `content` e `description` por versoes completas
- `INSERT` de 10 novos registros com `is_system = true` e `organization_id = NULL`

Nenhum arquivo frontend precisa ser alterado - a pagina `PolicyTemplates.tsx` ja renderiza o HTML via `dangerouslySetInnerHTML` no Preview e passa o conteudo ao editor via query params.

### Categorias utilizadas

- Seguranca (12 templates)
- Acesso (3 templates)  
- Privacidade (3 templates)
- Continuidade (2 templates)

### Resultado

A biblioteca passara de 10 templates vazios para 20 templates completos e profissionais, prontos para uso imediato ou personalizacao via editor/IA.

