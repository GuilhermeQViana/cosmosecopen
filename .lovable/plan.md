

# Renomear página Auth para Gateway

## O que sera feito

Renomear o arquivo da pagina de login de `Auth.tsx` para `Gateway.tsx` e atualizar a referencia no `App.tsx`.

**Importante:** As referencias ao `AuthContext`, `AuthProvider`, `useAuth` e ao arquivo utilitario `_shared/auth.ts` das edge functions **nao serao alteradas**, pois sao componentes internos de autenticacao e nao tem relacao com o nome da pagina.

## Detalhes tecnicos

### 1. Criar `src/pages/Gateway.tsx`
- Copiar todo o conteudo de `src/pages/Auth.tsx` para o novo arquivo `src/pages/Gateway.tsx`

### 2. Atualizar `src/App.tsx`
- Alterar o lazy import de:
  ```
  const Auth = lazy(() => import("@/pages/Auth"));
  ```
  para:
  ```
  const Gateway = lazy(() => import("@/pages/Gateway"));
  ```
- Atualizar a rota de:
  ```
  <Route path={AUTH_ROUTE} element={<Auth />} />
  ```
  para:
  ```
  <Route path={AUTH_ROUTE} element={<Gateway />} />
  ```

### 3. Remover `src/pages/Auth.tsx`
- Arquivo antigo sera removido apos a criacao do novo

### O que NAO muda
- `AUTH_ROUTE` em `src/lib/constants.ts` (ja aponta para `/gateway/c7x9k2m4`)
- `AuthContext`, `AuthProvider`, `useAuth` (sao do sistema de autenticacao, nao da pagina)
- `_shared/auth.ts` nas edge functions (utilitario de backend)
- Todas as referencias a `AUTH_ROUTE` nos demais componentes (ja usam a constante correta)

