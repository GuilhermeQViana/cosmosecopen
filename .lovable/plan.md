

# Corrigir redirecionamento de reset de senha e restringir acesso local

## Problema
Dois problemas relacionados:
1. O Vite esta configurado com `host: "::"` que expoe a aplicacao em todas as interfaces de rede (IPs como 192.168.x.x, 172.x.x.x), permitindo acesso externo
2. O link de reset de senha usa `window.location.origin`, que captura o IP da rede pelo qual o usuario acessou. Quando o email chega e o usuario clica, ele e redirecionado para esse IP de rede em vez de `localhost`

## Solucao

### 1. `vite.config.ts`
- Alterar `server.host` de `"::"` para `"localhost"`
- Isso faz o Vite escutar apenas em `localhost:8080`, eliminando o acesso via IPs de rede
- O usuario so conseguira acessar via `http://localhost:8080`

### 2. `src/pages/ForgotPassword.tsx`
- Alterar o `redirectTo` para usar `http://localhost:8080` fixo em desenvolvimento, garantindo que o email sempre redirecione para localhost
- Manter `window.location.origin` como fallback para producao

Mudanca simples: usar uma constante que detecta o ambiente e usa localhost em dev.

Nenhum outro arquivo precisa ser alterado.

