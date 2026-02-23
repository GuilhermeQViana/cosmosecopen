
# Plano: Criar Imagem Docker Pre-Built para Distribuicao

## O Desafio

O Dockerfile atual compila o frontend com as variaveis de ambiente (URL do Supabase, chave API) **embutidas no bundle JavaScript** durante o `npm run build`. Isso significa que cada usuario precisa clonar o repositorio e buildar do zero.

Para distribuir uma imagem pronta no Docker Hub, precisamos que essas variaveis sejam configuradas **na hora de rodar o container** (runtime), nao na hora de buildar.

## A Solucao

Usar uma tecnica padrao: buildar com **valores placeholder**, e na inicializacao do container, um script substitui esses placeholders pelos valores reais das variaveis de ambiente.

## Arquivos a Criar/Modificar

### 1. Novo arquivo: `docker/docker-entrypoint.sh`

Script que roda quando o container inicia. Ele:
- Procura os placeholders nos arquivos JS gerados pelo build
- Substitui pelos valores reais das variaveis de ambiente
- Inicia o Nginx normalmente

```text
Fluxo:
  Container inicia
    -> docker-entrypoint.sh executa
    -> sed substitui __VITE_SUPABASE_URL__ pelo valor real
    -> sed substitui __VITE_SUPABASE_PUBLISHABLE_KEY__ pelo valor real
    -> sed substitui __VITE_SUPABASE_PROJECT_ID__ pelo valor real
    -> nginx inicia
```

### 2. Modificar: `Dockerfile`

- Na fase de build, usar placeholders fixos como valores das variaveis Vite (ex: `__VITE_SUPABASE_URL__`)
- Na fase final (nginx), copiar o entrypoint script
- Trocar o CMD para executar o entrypoint em vez de iniciar o nginx diretamente

### 3. Novo arquivo: `docker-compose.prebuilt.yml`

Docker Compose simplificado que usa a imagem pronta do Docker Hub em vez de buildar. O usuario so precisa:
1. Criar um `.env` com suas credenciais
2. Rodar `docker compose -f docker-compose.prebuilt.yml up`

### 4. Modificar: `src/components/landing/AudienceSection.tsx`

Adicionar uma terceira opcao no guia de instalacao da landing page, explicando como usar a imagem pre-built.

### 5. Modificar: `README.md`

Adicionar instrucoes de como usar a imagem Docker pre-built.

## Detalhes Tecnicos

### `docker/docker-entrypoint.sh`
```bash
#!/bin/sh
set -e

# Substitui placeholders nos arquivos JS compilados
find /usr/share/nginx/html -type f -name '*.js' -exec sed -i \
  -e "s|__VITE_SUPABASE_URL__|${VITE_SUPABASE_URL:-http://localhost:8000}|g" \
  -e "s|__VITE_SUPABASE_PUBLISHABLE_KEY__|${VITE_SUPABASE_PUBLISHABLE_KEY}|g" \
  -e "s|__VITE_SUPABASE_PROJECT_ID__|${VITE_SUPABASE_PROJECT_ID:-local}|g" \
  {} +

exec nginx -g 'daemon off;'
```

### `Dockerfile` (novo)
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app

# Placeholders fixos - serao substituidos no runtime
ENV VITE_SUPABASE_URL=__VITE_SUPABASE_URL__
ENV VITE_SUPABASE_PUBLISHABLE_KEY=__VITE_SUPABASE_PUBLISHABLE_KEY__
ENV VITE_SUPABASE_PROJECT_ID=__VITE_SUPABASE_PROJECT_ID__

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
```

### `docker-compose.prebuilt.yml`
Referencia a imagem publicada no Docker Hub (ex: `ghcr.io/guilhermeqviana/cosmosecopen:latest` ou `guilhermeqviana/cosmosecopen:latest`) e passa as variaveis de ambiente para configuracao em runtime.

### Uso Final para o Usuario
```bash
# Baixar e rodar - sem precisar clonar nada
docker pull guilhermeqviana/cosmosecopen:latest

# Com docker-compose (infraestrutura completa)
curl -O docker-compose.prebuilt.yml
cp .env.docker .env
docker compose -f docker-compose.prebuilt.yml up
```

## Arquivos Impactados

| Arquivo | Acao |
|---------|------|
| `docker/docker-entrypoint.sh` | Criar - script de substituicao de placeholders |
| `Dockerfile` | Modificar - usar placeholders + entrypoint |
| `docker-compose.prebuilt.yml` | Criar - compose com imagem pronta |
| `docker-compose.yml` | Modificar - adicionar suporte a build args com placeholders |
| `src/components/landing/AudienceSection.tsx` | Modificar - adicionar opcao de imagem pre-built no guia |
| `README.md` | Modificar - documentar uso da imagem Docker |

## Como Publicar a Imagem

Apos implementar, voce publica a imagem com:
```bash
docker build -t guilhermeqviana/cosmosecopen:latest .
docker push guilhermeqviana/cosmosecopen:latest
```

Ou usando GitHub Actions para automatizar o build e push a cada release.
