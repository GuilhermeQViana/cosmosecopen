

# Redirecionar "/" para a tela de login

## Resumo
Remover o acesso direto a landing page. Quando o usuario acessar "/", sera redirecionado automaticamente para a tela de login (`/entrar`).

## Mudancas

### 1. `src/App.tsx`
- Substituir a rota `<Route path="/" element={<Landing />} />` por um redirect: `<Route path="/" element={<Navigate to="/entrar" replace />} />`
- Importar `Navigate` de `react-router-dom` (ja importado no projeto)
- Remover o import lazy de `Landing` (nao sera mais utilizado)

### 2. Arquivos opcionais de limpeza
- O arquivo `src/pages/Landing.tsx` e os componentes em `src/components/landing/` podem ser mantidos caso queira reativa-los no futuro, ou removidos para limpar o projeto. O plano mantera os arquivos por seguranca.

Nenhuma outra mudanca e necessaria. Todas as referencias a landing page na navbar ou em outros componentes nao serao afetadas, pois o usuario ja sera direcionado ao login.

