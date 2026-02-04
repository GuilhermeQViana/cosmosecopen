# Plano: Atualização da Landing Page - Nova Estratégia de Vendas

## Status: ✅ CONCLUÍDO

## Resumo das Alterações

A landing page foi atualizada para refletir a nova estratégia de vendas consultiva:

### ✅ Removido
- Trial de 7 dias e referências a preços (R$ 449,90/mês)
- Botão "Testar Grátis" / "Começar Agora"
- PricingSection removida da landing

### ✅ Adicionado
- **ContactSection**: Formulário de contato com campos para nome, email, empresa, cargo, tamanho e mensagem
- **ProductTourSection**: Prévia das funcionalidades com tabs (GRC, VRM, Avançado)
- **TourProduto page** (`/tour`): Página completa com detalhamento visual de todos os módulos
- Tabela `contact_requests` no banco de dados para armazenar leads

### ✅ Atualizado
- **HeroSection**: CTAs alterados para "Falar com Especialista" e "Conhecer a Plataforma"
- **Navbar**: Link "Preços" substituído por "Tour", botão CTA agora leva ao formulário de contato
- **FAQSection**: Perguntas sobre trial removidas, adicionadas perguntas sobre contratação e onboarding
- **Footer**: Link de preços substituído por "Tour do Produto"

## Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/components/landing/ContactSection.tsx` | Criado - Formulário de contato |
| `src/components/landing/ProductTourSection.tsx` | Criado - Preview das funcionalidades |
| `src/pages/TourProduto.tsx` | Criado - Página de tour completo |
| `src/components/landing/HeroSection.tsx` | Atualizado - Novos CTAs |
| `src/components/landing/Navbar.tsx` | Atualizado - Links e botões |
| `src/components/landing/FAQSection.tsx` | Atualizado - Novas perguntas |
| `src/components/landing/Footer.tsx` | Atualizado - Links |
| `src/pages/Landing.tsx` | Atualizado - Novos componentes |
| `src/App.tsx` | Atualizado - Rota /tour |

## Banco de Dados

Nova tabela `contact_requests` com:
- Campos: name, email, company, role, company_size, how_found, message
- Status para gestão de leads (pending, contacted, converted, closed)
- RLS: INSERT público para formulário, SELECT/UPDATE apenas para super_admins

## Próximos Passos Sugeridos

1. Adicionar screenshots reais das telas na página de Tour
2. Configurar edge function para notificações de novos contatos
3. Atualizar número de WhatsApp e email de contato reais
4. Criar dashboard admin para gestão de leads
