
## Padronizar Links Externos com o Dominio Oficial cosmosec.com.br

### Problema
Atualmente, links compartilhados externamente (portal do fornecedor, convites, reset de senha) usam `window.location.origin`, que pode retornar a URL de preview/staging em vez do dominio oficial. Alem disso, o slide generator referencia `cosmosec.lovable.app`.

### Alteracoes

**1. Criar constante do dominio oficial**

No arquivo `src/lib/constants.ts`, adicionar:
```
export const OFFICIAL_DOMAIN = 'https://cosmosec.com.br';
```

**2. VendorPortalManager.tsx — Links do portal do fornecedor**

Substituir `window.location.origin` por `OFFICIAL_DOMAIN` nas duas funcoes que geram links do portal:
- `handleCreateToken`: linha 76
- `handleCopyLink`: linha 85

Resultado: links copiados serao sempre `https://cosmosec.com.br/vendor-portal/{token}`

**3. Equipe.tsx — Link de convite**

Substituir `window.location.origin` (linha 138) por `OFFICIAL_DOMAIN` no `appUrl` enviado para a edge function de convite.

**4. slide-generator.ts — Rodape dos slides**

Substituir `cosmosec.lovable.app` (linha 386) por `cosmosec.com.br` no texto de rodape dos slides de apresentacao.

**5. Manter `window.location.origin` nos fluxos de auth**

Os seguintes arquivos NAO serao alterados pois precisam do origin real do navegador para o redirect funcionar corretamente (OAuth, signup, reset password):
- `Auth.tsx` (Google OAuth redirect)
- `AuthContext.tsx` (signup redirect)
- `ForgotPassword.tsx` (reset password redirect)

### Resumo de Arquivos

| Arquivo | Alteracao |
|---|---|
| `src/lib/constants.ts` | Adicionar `OFFICIAL_DOMAIN` |
| `src/components/fornecedores/VendorPortalManager.tsx` | Usar `OFFICIAL_DOMAIN` nos 2 links do portal |
| `src/pages/Equipe.tsx` | Usar `OFFICIAL_DOMAIN` no appUrl de convite |
| `src/lib/slide-generator.ts` | Trocar `cosmosec.lovable.app` por `cosmosec.com.br` |
