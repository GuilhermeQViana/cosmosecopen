
# Plano: Melhorias no Sistema de Autenticacao

## Analise do Sistema Atual

### O que ja esta implementado
- Login/Cadastro com email e senha (validacao via Zod)
- AuthContext com gerenciamento de sessao via Supabase
- Tabela `profiles` com dados do usuario
- Tabela `user_roles` para controle de permissoes
- Alteracao de senha para usuarios logados (`ChangePasswordDialog`)
- Logs de acesso (login/logout) via `useAccessLog`
- Protecao de rotas no `AppLayout` e `VendorLayout`
- Links para Termos de Uso e Politica de Privacidade

### Lacunas Identificadas

| Funcionalidade | Status |
|----------------|--------|
| Recuperacao de senha (Esqueci minha senha) | Nao implementado |
| Login com Google OAuth | Nao implementado |
| Mostrar/ocultar senha nos formularios | Nao implementado |
| Validacao robusta de senha no cadastro | Parcial (apenas 6 chars) |
| Indicador de forca da senha | Nao implementado |
| Limite de tentativas de login | Nao implementado |
| Verificacao de email | Depende config Supabase |

---

## Melhorias Propostas

### 1. Recuperacao de Senha (Esqueci minha senha)

**Descricao:** Adicionar link "Esqueci minha senha" na tela de login que envia email de recuperacao.

**Alteracoes:**

1. **Criar pagina de recuperacao:** `src/pages/ForgotPassword.tsx`
   - Formulario com campo de email
   - Integracao com `supabase.auth.resetPasswordForEmail()`
   - URL de redirecionamento para pagina de redefinicao

2. **Criar pagina de redefinicao:** `src/pages/ResetPassword.tsx`
   - Formulario para nova senha
   - Validacao robusta (8+ chars, maiuscula, numero)
   - Integracao com `supabase.auth.updateUser()`

3. **Atualizar Auth.tsx:**
   - Adicionar link "Esqueci minha senha" abaixo do campo de senha

4. **Adicionar rotas no App.tsx:**
   - `/esqueci-senha` -> ForgotPassword
   - `/redefinir-senha` -> ResetPassword

---

### 2. Login com Google OAuth

**Descricao:** Adicionar botao "Entrar com Google" para autenticacao social.

**Alteracoes:**

1. **Atualizar AuthContext.tsx:**
   - Adicionar funcao `signInWithGoogle()` usando `supabase.auth.signInWithOAuth()`

2. **Atualizar Auth.tsx:**
   - Adicionar botao estilizado "Entrar com Google" com icone
   - Separador visual "ou" entre OAuth e formulario

3. **Configuracao do Google OAuth:**
   - Usar credenciais gerenciadas do Lovable Cloud (automatico)
   - Ou configurar BYOK via Cloud Dashboard

---

### 3. Mostrar/Ocultar Senha

**Descricao:** Adicionar botao de visibilidade nos campos de senha.

**Alteracoes:**

1. **Atualizar Auth.tsx:**
   - Adicionar estados `showLoginPassword`, `showSignupPassword`, `showConfirmPassword`
   - Renderizar botao com icone Eye/EyeOff ao lado de cada campo
   - Alternar `type` entre "password" e "text"

2. **Componente reutilizavel (opcional):**
   - Criar `PasswordInput.tsx` para uso em todo o app

---

### 4. Validacao Robusta de Senha + Indicador de Forca

**Descricao:** Melhorar regras de senha e mostrar feedback visual de forca.

**Alteracoes:**

1. **Atualizar schema Zod no cadastro:**
   ```text
   - Minimo 8 caracteres (atualmente 6)
   - Pelo menos 1 letra maiuscula
   - Pelo menos 1 numero
   - Pelo menos 1 caractere especial (opcional)
   ```

2. **Criar componente `PasswordStrengthIndicator.tsx`:**
   - Barra de progresso colorida (vermelho -> amarelo -> verde)
   - Checklist visual dos requisitos
   - Exibir abaixo do campo de senha no cadastro

---

### 5. Limite de Tentativas de Login

**Descricao:** Implementar bloqueio temporario apos falhas consecutivas.

**Alteracoes:**

1. **Implementar no frontend:**
   - Contador de tentativas falhas no `useState`
   - Apos 5 falhas: desabilitar botao por 30 segundos
   - Exibir mensagem de cooldown com countdown

2. **Consideracao futura:**
   - Rate limiting via Supabase Edge Function (mais seguro)

---

## Resumo das Alteracoes

| Arquivo | Tipo | Alteracao |
|---------|------|-----------|
| `src/pages/ForgotPassword.tsx` | Novo | Pagina de recuperacao de senha |
| `src/pages/ResetPassword.tsx` | Novo | Pagina de redefinicao de senha |
| `src/pages/Auth.tsx` | Editar | Links, OAuth, mostrar senha, validacao |
| `src/contexts/AuthContext.tsx` | Editar | Adicionar signInWithGoogle, resetPassword |
| `src/App.tsx` | Editar | Adicionar rotas /esqueci-senha, /redefinir-senha |
| `src/components/ui/PasswordStrengthIndicator.tsx` | Novo | Indicador de forca de senha |
| `src/components/ui/PasswordInput.tsx` | Novo | Input de senha com toggle visibilidade |

---

## Fluxo de Recuperacao de Senha

```text
┌──────────────┐    ┌────────────────────┐    ┌──────────────────┐
│  Login Page  │───►│ Forgot Password    │───►│ Email enviado    │
│              │    │ (digita email)     │    │ com link         │
└──────────────┘    └────────────────────┘    └────────┬─────────┘
                                                       │
                                                       ▼
                    ┌────────────────────┐    ┌──────────────────┐
                    │ Redireciona para   │◄───│ Usuario clica    │
                    │ /redefinir-senha   │    │ no link do email │
                    └────────────────────┘    └──────────────────┘
                              │
                              ▼
                    ┌────────────────────┐    ┌──────────────────┐
                    │ Nova senha         │───►│ Sucesso!         │
                    │ (com validacao)    │    │ Redireciona login│
                    └────────────────────┘    └──────────────────┘
```

---

## Ordem de Implementacao Recomendada

1. **Mostrar/Ocultar Senha** - rapido, melhora UX imediata
2. **Validacao Robusta + Indicador de Forca** - seguranca basica
3. **Recuperacao de Senha** - funcionalidade critica
4. **Login com Google** - conveniencia para usuarios
5. **Limite de Tentativas** - seguranca adicional

---

## Detalhes Tecnicos

### Recuperacao de Senha (Supabase)

A funcao `resetPasswordForEmail` envia um email com link de recuperacao:

```text
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://cosmosec.com.br/redefinir-senha'
})
```

O token e passado automaticamente na URL e o Supabase gerencia a sessao de recuperacao.

### Google OAuth

O Lovable Cloud gerencia automaticamente as credenciais OAuth. A implementacao usa:

```text
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin + '/selecionar-modulo'
  }
})
```

### Indicador de Forca de Senha

Pontuacao baseada em:
- Comprimento (8+, 12+, 16+ chars)
- Letras maiusculas
- Numeros
- Caracteres especiais
- Nao usar sequencias comuns (123, abc, qwerty)
