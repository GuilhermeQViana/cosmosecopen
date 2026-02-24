

# Corrigir QR Code nao aparecendo no Dialog de 2FA

## Problema
O `handleOpen` que faz a chamada `supabase.auth.mfa.enroll()` esta atribuido ao `onOpenChange` do Dialog. Porem, o Radix Dialog so dispara `onOpenChange` quando o usuario interage para fechar (clicar no overlay, botao X, etc.), **nao** quando a prop `open` muda de `false` para `true` pelo componente pai. Resultado: o enroll nunca e chamado, `qrCode` fica vazio, e a imagem nao aparece.

## Solucao
Mover a logica de enrollment para um `useEffect` que observa a prop `open`. Quando `open` muda para `true`, executar o enroll. O `onOpenChange` do Dialog volta a ser simplesmente o `onOpenChange` do pai.

## Mudancas no arquivo `src/components/configuracoes/TwoFactorSetupDialog.tsx`

1. **Adicionar `useEffect`** que dispara o enrollment quando `open === true`:
   - Reseta o step para 'qr' e o codigo
   - Seta `enrolling = true`
   - Chama `supabase.auth.mfa.enroll({ factorType: 'totp' })`
   - Seta qrCode, secret, factorId
   - Em caso de erro, exibe toast e fecha o dialog

2. **Simplificar o `onOpenChange` do Dialog** para chamar diretamente `onOpenChange` do pai, sem logica de enrollment

3. Nenhum outro arquivo precisa ser alterado

## Detalhes tecnicos

O `useEffect` tera `open` como dependencia. Quando `open` se torna `true`, inicia o enrollment. Quando `false`, nao faz nada. Isso garante que o QR Code e gerado toda vez que o dialog abre, independente de como ele foi aberto.

