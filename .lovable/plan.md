
## Ofuscar a Rota de Autenticacao

### O que sera feito

Renomear a rota `/auth` para um caminho complexo e dificil de adivinhar, como `/gateway/c7x9k2m4`. Assim, um usuario comum nao conseguira descobrir a URL de login por tentativa.

### Arquivos que serao alterados

Todos os 9 arquivos que referenciam `/auth` serao atualizados para usar o novo caminho:

1. **`src/App.tsx`** - Alterar a definicao da rota
2. **`src/components/layout/AppLayout.tsx`** - Redirect quando nao autenticado
3. **`src/components/layout/VendorLayout.tsx`** - Redirect quando nao autenticado
4. **`src/components/layout/PolicyLayout.tsx`** - Redirect quando nao autenticado
5. **`src/pages/SelecionarModulo.tsx`** - Redirect quando nao autenticado
6. **`src/pages/ResetPassword.tsx`** - Navigate apos redefinir senha
7. **`src/pages/ForgotPassword.tsx`** - Link "Voltar ao login"
8. **`src/pages/Documentacao.tsx`** - Botao "Entrar"
9. **`src/components/landing/PricingSection.tsx`** - Link do CTA de trial

### Abordagem tecnica

Criar uma constante centralizada (ex: `AUTH_ROUTE` em `src/lib/constants.ts`) com o valor `/gateway/c7x9k2m4` para facilitar manutencao futura. Todos os arquivos importarao essa constante em vez de usar a string diretamente, assim se precisar mudar no futuro basta alterar em um unico lugar.

```text
src/lib/constants.ts (novo):
  export const AUTH_ROUTE = '/gateway/c7x9k2m4';

Todos os 9 arquivos:
  - Importam AUTH_ROUTE de @/lib/constants
  - Substituem "/auth" por AUTH_ROUTE
```
