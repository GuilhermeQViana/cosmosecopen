
# Plano: Implementar Envio de Email para Formulário de Contato

## Situação Atual

O formulário de contato salva os dados corretamente no banco de dados, mas **não envia nenhum email** para `contato@cosmosec.com.br`. A equipe comercial não recebe notificação quando alguém solicita uma demonstração.

## Solução Proposta

Criar uma Edge Function que será acionada automaticamente quando um novo registro for inserido na tabela `contact_requests`, enviando um email formatado para a equipe comercial.

## Arquitetura

```text
Usuário preenche formulário
         ↓
Dados salvos em contact_requests
         ↓
Trigger do banco chama Edge Function
         ↓
Edge Function envia email via Resend
         ↓
Email chega em contato@cosmosec.com.br
```

## Implementação

### 1. Criar Edge Function `send-contact-notification`

Nova função para enviar email quando houver nova solicitação:

| Campo | Descrição |
|-------|-----------|
| **De** | noreply@cosmosec.com.br |
| **Para** | contato@cosmosec.com.br |
| **Assunto** | Nova Solicitação de Demo: [Nome da Empresa] |

O email incluirá todos os dados do formulário formatados:
- Nome completo e cargo
- Email corporativo
- Empresa e tamanho
- Como conheceu a CosmoSec
- Mensagem/dúvidas

### 2. Criar Database Trigger

Trigger que dispara automaticamente ao inserir novo registro:

```text
Tabela: contact_requests
Evento: AFTER INSERT
Ação: Chamar send-contact-notification
```

### 3. Atualizar Formulário (Alternativa)

Opcionalmente, o formulário pode chamar a Edge Function diretamente após salvar com sucesso, garantindo feedback imediato.

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/send-contact-notification/index.ts` | Criar |
| `supabase/config.toml` | Adicionar configuração da função |
| Migração SQL (Trigger) | Criar trigger no banco |

## Template do Email

O email para a equipe comercial terá:
- Cabeçalho com logo CosmoSec
- Dados do lead organizados em tabela
- Botão de resposta rápida
- Data/hora do envio

## Resultado Esperado

Após implementação:
- Cada submissão do formulário gerará um email instantâneo
- A equipe comercial receberá notificação em `contato@cosmosec.com.br`
- Tempo de resposta ao lead será reduzido significativamente
