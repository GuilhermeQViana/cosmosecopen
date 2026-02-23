

# Plano: Atualizar usuario Docker Hub para `guilherme0045`

## Resumo

Substituir todas as referencias ao usuario Docker Hub antigo (`guilhermeqviana`) pelo usuario correto (`guilherme0045`) em todos os arquivos do projeto.

## Alteracoes

### 1. `docker-compose.prebuilt.yml`
- Trocar `guilhermeqviana/cosmosecopen` por `guilherme0045/cosmosecopen`

### 2. `README.md`
- Atualizar todos os comandos `docker pull` e `docker run` para usar `guilherme0045/cosmosecopen`
- Atualizar o link do `curl` para o docker-compose.prebuilt.yml (nota: o repositorio GitHub continua com `GuilhermeQViana` -- isso nao muda, pois e o usuario do GitHub, nao do Docker)

### 3. `src/components/landing/AudienceSection.tsx`
- Trocar o link do Docker Hub para `https://hub.docker.com/r/guilherme0045/cosmosecopen`
- Atualizar os comandos no `CodeBlock` para usar `guilherme0045/cosmosecopen`

### Arquivos NAO alterados
- `CONTRIBUTING.md` e `src/lib/constants.ts` -- esses referenciam o **GitHub**, nao o Docker Hub, entao permanecem com `GuilhermeQViana`

## Resumo de impacto

| Arquivo | O que muda |
|---------|------------|
| `docker-compose.prebuilt.yml` | Nome da imagem Docker |
| `README.md` | Comandos docker pull/run (3 ocorrencias) |
| `src/components/landing/AudienceSection.tsx` | Link Docker Hub + comandos no CodeBlock |

