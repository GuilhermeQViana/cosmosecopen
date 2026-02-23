
# Plano: Complementar o passo 2 com instrucoes sobre o que fazer com as informacoes copiadas

## Problema

O passo 2 diz para copiar a URL, Anon Key e Project ID, mas nao explica onde cola-las. O usuario fica sem saber o proximo passo.

## Alteracao

### `src/components/landing/AudienceSection.tsx` (linhas 40-45)

Atualizar a descricao do passo 2 para explicar que as informacoes copiadas serao usadas no passo 4 (arquivo `.env`), e adicionar um sub-texto orientativo:

**Antes:**
```
description: 'Acesse supabase.com e crie um projeto gratuito. Copie a URL, a Anon Key e o Project ID (Settings → API).'
```

**Depois:**
```
description: 'Acesse supabase.com e crie um projeto gratuito. Em Settings → API, copie a URL, a Anon Key e o Project ID. Voce usara esses valores no passo 4 para preencher o arquivo .env.'
```

Essa pequena mudanca conecta o passo 2 ao passo 4, deixando claro que as credenciais copiadas vao para as variaveis de ambiente.
