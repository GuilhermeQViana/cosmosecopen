

# Plano: Incorporar Formulário de Contato na Seção "Agende uma Demo"

## Situação Atual

A seção `EnhancedCTASection` na página `/tour` exibe apenas um card com o botão "Agendar Agora" que redireciona o usuário para a landing page principal (`/#contact`). Isso causa fricção na jornada do lead que precisa sair da página atual.

## Objetivo

Incorporar o formulário de contato diretamente na seção "Agende uma Demo" da página `/tour`, mantendo a mesma funcionalidade do formulário da landing principal:
- Salvar dados no banco de dados
- Enviar notificação por email para a equipe comercial
- Feedback visual ao usuário

## Mudanças Propostas

### Layout do Formulário

| Seção | Conteúdo |
|-------|----------|
| Cabeçalho | Ícone calendário + "Agende uma Demo" + subtítulo |
| Formulário | Campos em grid responsivo |
| Contatos Alternativos | Email e LinkedIn (abaixo do formulário) |
| Rodapé | Link "Voltar para Home" |

### Campos do Formulário

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome completo | Input texto | Sim |
| Email corporativo | Input email | Sim |
| Empresa | Input texto com ícone | Sim |
| Cargo | Input texto | Não |
| Tamanho da empresa | Select dropdown | Não |
| Como nos conheceu | Select dropdown | Não |
| Mensagem | Textarea | Não |

### Funcionalidades

1. Validação de campos obrigatórios (nome, email, empresa)
2. Salvamento na tabela `contact_requests`
3. Disparo de email via Edge Function `send-contact-notification`
4. Toast de sucesso/erro
5. Reset do formulário após envio

## Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/conheca/EnhancedCTASection.tsx` | Substituir card com botão por formulário completo |

## Design Visual

O formulário seguirá o design system CosmoSec:
- Card com glassmorphism (`bg-card/80 backdrop-blur-sm`)
- Bordas com gradiente (`border-primary/20`)
- Botão cosmic gradient
- Efeitos nebula de fundo (já existentes)
- Responsivo: grid de 2 colunas em desktop, 1 coluna em mobile

## Resultado Esperado

- Lead permanece na página `/tour` durante todo o processo
- Formulário funcional com mesmos campos da landing principal
- Notificação por email para `contato@cosmosec.com.br`
- Experiência fluida sem redirecionamentos

