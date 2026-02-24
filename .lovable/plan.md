

# Implementar 2FA Opcional com Google/Microsoft Authenticator

## Resumo
Adicionar autenticacao de dois fatores (TOTP) opcional ao sistema. O usuario pode ativar ou desativar o 2FA nas configuracoes de seguranca. Quem nao ativar continua logando normalmente so com email e senha.

## Fluxo do usuario

```text
SEM 2FA (padrao):
  Login com email/senha -> Acesso direto ao sistema (sem mudanca)

ATIVAR 2FA:
  Configuracoes > Seguranca > "Configurar 2FA"
  -> Exibe QR Code (compativel com Google/Microsoft Authenticator)
  -> Usuario escaneia e digita codigo de 6 digitos para confirmar
  -> 2FA ativado

LOGIN COM 2FA ATIVO:
  Login com email/senha
  -> Sistema detecta que usuario tem fator TOTP
  -> Exibe tela para digitar codigo do app
  -> Codigo validado -> Acesso ao sistema

DESATIVAR 2FA:
  Configuracoes > Seguranca > "Desativar 2FA"
  -> Digita codigo atual para confirmar
  -> 2FA removido, volta ao login simples
```

## Arquivos novos

### 1. `src/components/auth/MFAVerification.tsx`
Tela de verificacao exibida apos login quando o usuario tem 2FA ativo:
- Campo de 6 digitos usando o componente `InputOTP` ja existente
- Chama `supabase.auth.mfa.challenge()` e `supabase.auth.mfa.verify()`
- Botao "Verificar" e tratamento de erros
- Callback `onVerified` para prosseguir com a navegacao
- Visual consistente com o tema cosmico do Gateway

### 2. `src/components/configuracoes/TwoFactorSetupDialog.tsx`
Dialog para ativar o 2FA:
- Passo 1: Gera QR Code via `supabase.auth.mfa.enroll({ factorType: 'totp' })` e exibe junto com o segredo em texto para copia manual
- Passo 2: Campo para digitar codigo de verificacao usando `InputOTP`
- Passo 3: Chama `challenge()` + `verify()` para confirmar e ativar
- Mensagem de sucesso ao concluir

### 3. `src/components/configuracoes/TwoFactorDisableDialog.tsx`
Dialog para desativar o 2FA:
- Solicita codigo atual do app autenticador
- Verifica o codigo e chama `supabase.auth.mfa.unenroll({ factorId })`
- Confirmacao de desativacao

## Arquivos modificados

### 4. `src/pages/Gateway.tsx`
- Apos login bem-sucedido (linha 160-163), verificar `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`
- Se `currentLevel === 'aal1'` e `nextLevel === 'aal2'`: mostrar `MFAVerification` em vez de navegar
- Adicionar estado `showMFA` para controlar a exibicao do componente de verificacao
- Apos verificacao MFA, navegar para `redirectTo` normalmente
- Se o usuario **nao** tem 2FA (nextLevel === 'aal1'), navegar direto como hoje

### 5. `src/pages/Configuracoes.tsx` (linhas 566-587)
- Substituir o botao "Configurar" desabilitado pelo botao funcional
- Ao carregar, consultar `supabase.auth.mfa.listFactors()` para saber se ja tem fator TOTP
- Se **nao tem**: mostrar botao "Configurar" que abre `TwoFactorSetupDialog`
- Se **ja tem**: mostrar badge "Ativado" + botao "Desativar" que abre `TwoFactorDisableDialog`

## Detalhes tecnicos

- **API**: `supabase.auth.mfa` (enroll, challenge, verify, unenroll, listFactors, getAuthenticatorAssuranceLevel)
- **Backend**: Nenhuma alteracao necessaria - o MFA TOTP ja e suportado nativamente pelo Lovable Cloud
- **Banco de dados**: Nenhuma migracao necessaria - fatores MFA sao gerenciados internamente
- **Dependencias**: Nenhuma nova - `InputOTP` e `input-otp` ja estao instalados
- **Compatibilidade**: Funciona com Google Authenticator, Microsoft Authenticator, Authy e qualquer app TOTP

