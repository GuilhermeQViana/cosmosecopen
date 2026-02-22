
# Plano: Remover Todo o Sistema de Pagamentos (Stripe)

A ferramenta sera 100% gratuita. Este plano remove toda a infraestrutura de pagamentos, assinaturas, trials e verificacoes de acesso pago.

---

## Resumo das Remocoes

### Edge Functions a Deletar (4 funcoes)
| Funcao | Motivo |
|--------|--------|
| `supabase/functions/create-checkout/` | Cria sessao de checkout Stripe |
| `supabase/functions/customer-portal/` | Portal de gerenciamento Stripe |
| `supabase/functions/stripe-webhook/` | Webhook de eventos Stripe |
| `supabase/functions/list-invoices/` | Lista faturas do Stripe |

### Edge Function a Modificar (1)
| Funcao | Mudanca |
|--------|---------|
| `supabase/functions/check-subscription/` | Simplificar para sempre retornar `has_access: true` (outras partes do sistema dependem dela) |

### Edge Function a Deletar (1)
| Funcao | Motivo |
|--------|--------|
| `supabase/functions/send-trial-reminder/` | Lembrete de trial -- nao faz sentido sem pagamento |

### Componentes a Deletar (3 arquivos)
| Arquivo | Motivo |
|--------|--------|
| `src/components/subscription/SubscriptionRequired.tsx` | Tela de bloqueio por assinatura expirada |
| `src/components/subscription/PaymentFailedBanner.tsx` | Banner de falha de pagamento |
| `src/components/subscription/TrialBanner.tsx` | Banner de trial/renovacao |

### Paginas/Tabs a Deletar (3 arquivos)
| Arquivo | Motivo |
|--------|--------|
| `src/pages/CheckoutSuccess.tsx` | Pagina pos-checkout |
| `src/components/configuracoes/SubscriptionTab.tsx` | Tab de assinatura nas configuracoes |
| `src/components/configuracoes/ProBenefitsTab.tsx` | Tab de beneficios Pro |

### Landing Page (1 arquivo)
| Arquivo | Motivo |
|--------|--------|
| `src/components/landing/PricingSection.tsx` | Secao de precos (nao esta sendo usada na Landing atual, mas o arquivo existe) |

### Hook a Simplificar (1 arquivo)
| Arquivo | Mudanca |
|--------|---------|
| `src/hooks/useSubscription.ts` | Simplificar para sempre retornar `hasAccess: true`, remover toda logica de Stripe/checkout |

### Layouts a Limpar (3 arquivos)
| Arquivo | Mudanca |
|--------|---------|
| `src/components/layout/AppLayout.tsx` | Remover imports e uso de `TrialBanner`, `PaymentFailedBanner`, `SubscriptionRequired`, e verificacao `hasAccess` |
| `src/components/layout/VendorLayout.tsx` | Mesmo acima |
| `src/components/layout/PolicyLayout.tsx` | Mesmo acima |

### Sidebars a Limpar (3 arquivos)
| Arquivo | Mudanca |
|--------|---------|
| `src/components/layout/AppSidebar.tsx` | Remover import `useSubscription`, remover badge "Pro" |
| `src/components/layout/VendorSidebar.tsx` | Mesmo acima |
| `src/components/layout/PolicySidebar.tsx` | Mesmo acima |

### Configuracoes a Limpar (1 arquivo)
| Arquivo | Mudanca |
|--------|---------|
| `src/pages/Configuracoes.tsx` | Remover tabs "Pro" e "Assinatura", remover imports de `SubscriptionTab`, `ProBenefitsTab`, `CreditCard` |

### Rotas a Limpar (1 arquivo)
| Arquivo | Mudanca |
|--------|---------|
| `src/App.tsx` | Remover rota `/checkout-success` e import de `CheckoutSuccess` |

### Landing Page Config (1 arquivo)
| Arquivo | Mudanca |
|--------|---------|
| `src/components/landing/OptionalConfigSection.tsx` | Remover card de "Pagamentos (Stripe)" |

### Configs (1 arquivo)
| Arquivo | Mudanca |
|--------|---------|
| `.env.example` | Remover variaveis STRIPE_* |

---

## Ordem de Execucao

1. Deletar edge functions: `create-checkout`, `customer-portal`, `stripe-webhook`, `list-invoices`, `send-trial-reminder`
2. Simplificar `check-subscription` (retornar sempre `has_access: true`)
3. Deletar componentes: `SubscriptionRequired`, `PaymentFailedBanner`, `TrialBanner`, `PricingSection`
4. Deletar paginas/tabs: `CheckoutSuccess`, `SubscriptionTab`, `ProBenefitsTab`
5. Simplificar `useSubscription.ts`
6. Limpar layouts (AppLayout, VendorLayout, PolicyLayout)
7. Limpar sidebars (AppSidebar, VendorSidebar, PolicySidebar)
8. Limpar `Configuracoes.tsx` (remover tabs Pro e Assinatura)
9. Limpar `App.tsx` (remover rota checkout-success)
10. Limpar `OptionalConfigSection.tsx` (remover card Stripe)
11. Limpar `.env.example` (remover variaveis Stripe)

---

## Impacto Total

| Acao | Quantidade |
|------|-----------|
| Edge functions deletadas | 5 |
| Edge functions simplificadas | 1 |
| Componentes/paginas deletados | 7 |
| Arquivos modificados | 12 |
| **Total de arquivos impactados** | **25** |
