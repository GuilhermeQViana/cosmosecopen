

# Plano: Atualizar link do GitHub para o novo repositório

## Resumo

Atualizar todas as referências ao repositório GitHub de `https://github.com/cosmosec-labs/cosmosec` para `https://github.com/GuilhermeQViana/cosmosecopen`.

## Locais encontrados

| Arquivo | Linha | URL atual |
|---------|-------|-----------|
| `src/lib/constants.ts` | 11 | `https://github.com/cosmosec-labs/cosmosec` |
| `README.md` | 60 | `https://github.com/cosmosec-labs/cosmosec.git` |
| `README.md` | 112 | `https://github.com/cosmosec-labs/cosmosec.git` |
| `CONTRIBUTING.md` | 28 | `https://github.com/seu-usuario/cosmosec.git` |

A constante `GITHUB_URL` em `constants.ts` é usada por `AudienceSection.tsx` (guia de instalação na landing page) para gerar os comandos `git clone` e os links do Docker. Portanto, corrigir esse arquivo central já atualiza automaticamente toda a landing page.

## Alterações

### 1. `src/lib/constants.ts`
- Alterar `GITHUB_URL` para `'https://github.com/GuilhermeQViana/cosmosecopen'`

### 2. `README.md`
- Linha 60: `git clone https://github.com/GuilhermeQViana/cosmosecopen.git`
- Linha 112: `git clone https://github.com/GuilhermeQViana/cosmosecopen.git`

### 3. `CONTRIBUTING.md`
- Linha 28: `git clone https://github.com/GuilhermeQViana/cosmosecopen.git`

