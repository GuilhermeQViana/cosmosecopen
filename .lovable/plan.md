

# Adicionar botao de Login na Navbar da Landing Page

## O que sera feito

Adicionar um botao "Entrar" na barra de navegacao (Navbar) da landing page que direciona o usuario para a rota de login (`/entrar`).

## Alteracoes

### `src/components/landing/Navbar.tsx`

1. Importar `AUTH_ROUTE` de `@/lib/constants` (ja importado o arquivo, basta adicionar a constante)
2. Adicionar um botao "Entrar" ao lado dos botoes existentes (GitHub e "Comecar Agora"), tanto na versao desktop quanto mobile
3. O botao usara o componente `Link` do React Router para navegar ate `/entrar`

**Desktop** (entre o botao GitHub e o "Comecar Agora"):
```
<Button variant="ghost" size="sm" asChild>
  <Link to={AUTH_ROUTE}>Entrar</Link>
</Button>
```

**Mobile** (antes dos outros botoes no menu mobile):
```
<Button variant="ghost" asChild className="w-full">
  <Link to={AUTH_ROUTE}>Entrar</Link>
</Button>
```

## Detalhes tecnicos

- A constante `AUTH_ROUTE` ja existe em `src/lib/constants.ts` com valor `/entrar`
- O componente `Link` do React Router ja esta importado no arquivo
- O botao tera variante `ghost` para diferenciar visualmente do CTA principal "Comecar Agora"
- Nenhuma dependencia nova sera necessaria

