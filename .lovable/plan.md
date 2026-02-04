
# Plano: Atualizacao da Landing Page - Nova Estrategia de Vendas

## Visao Geral das Mudancas

A nova estrategia de vendas remove o modelo self-service (trial gratuito) e adota um modelo de contato comercial consultivo. Isso requer:

1. **Remover todas as referencias ao trial de 7 dias**
2. **Substituir CTAs por formulario/botao de contato**
3. **Criar nova pagina de Tour do Produto** com screenshots reais e detalhamento das funcionalidades
4. **Atualizar FAQ** para refletir novo modelo comercial

---

## Arquivos a Modificar

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `src/components/landing/HeroSection.tsx` | Modificar | Remover trial, atualizar CTAs para contato |
| `src/components/landing/PricingSection.tsx` | Modificar | Transformar em secao de Contato/Demo |
| `src/components/landing/Navbar.tsx` | Modificar | Atualizar botoes de navegacao |
| `src/components/landing/FAQSection.tsx` | Modificar | Atualizar perguntas sobre trial/precos |
| `src/components/landing/Footer.tsx` | Modificar | Adicionar link para Tour do Produto |
| `src/pages/Landing.tsx` | Modificar | Incluir nova secao de Tour |
| `src/pages/TourProduto.tsx` | Criar | Nova pagina com detalhamento visual |
| `src/components/landing/ContactSection.tsx` | Criar | Nova secao de contato comercial |
| `src/components/landing/ProductTourSection.tsx` | Criar | Secao com preview das telas reais |
| `src/App.tsx` | Modificar | Adicionar rota /tour |

---

## 1. Atualizacao do HeroSection

### Mudancas:
- Remover botao "Testar 7 Dias Gratis"
- Substituir por "Falar com Especialista" e "Conhecer a Plataforma"
- Remover texto "Apos 7 dias, R$ 449,90/mes. Cancele quando quiser."
- Adicionar CTA secundario para Tour do Produto

```text
ANTES:
[Testar 7 Dias Gratis] [Ver Modulos]
"Apos 7 dias, R$ 449,90/mes. Cancele quando quiser."

DEPOIS:
[Falar com Especialista] [Conhecer a Plataforma]
"Solicite uma demonstracao personalizada para sua empresa"
```

---

## 2. Nova Secao de Contato (ContactSection.tsx)

Substituir a PricingSection atual por uma secao de contato comercial:

```text
+----------------------------------------------------------+
| Pronto para Transformar sua Governanca?                   |
|----------------------------------------------------------|
|                                                          |
|   [Icone Email]           [Icone Calendario]             |
|   Fale Conosco            Agende uma Demo                |
|   contato@cosmosec.com    Reuniao de 30 minutos          |
|                                                          |
|   +------------------------------------------------+     |
|   | Nome: [________________________]               |     |
|   | Email: [_______________________]               |     |
|   | Empresa: [_____________________]               |     |
|   | Mensagem: [____________________]               |     |
|   |                                                |     |
|   |        [Solicitar Demonstracao]               |     |
|   +------------------------------------------------+     |
|                                                          |
|   Ou entre em contato direto:                            |
|   WhatsApp: (XX) XXXXX-XXXX                              |
|   Email: comercial@cosmosec.com                          |
|                                                          |
+----------------------------------------------------------+
```

### Campos do Formulario:
- Nome completo (obrigatorio)
- Email corporativo (obrigatorio)
- Nome da empresa (obrigatorio)
- Cargo (opcional)
- Quantidade de funcionarios (select)
- Como conheceu a CosmoSec (select)
- Mensagem/Necessidade (textarea)

### Integracao:
- Envio de dados para tabela `contact_requests` no Supabase
- Notificacao por email para equipe comercial (edge function)
- Toast de confirmacao para o usuario

---

## 3. Nova Pagina de Tour do Produto (/tour)

Pagina dedicada com detalhamento visual completo da plataforma.

### Estrutura da Pagina:

```text
+----------------------------------------------------------+
| NAVBAR                                                    |
|----------------------------------------------------------|
|                                                          |
| HERO: "Conheca a CosmoSec por Dentro"                    |
| Subtitulo explicativo + CTA para contato                 |
|                                                          |
|----------------------------------------------------------|
|                                                          |
| SECAO 1: Modulo GRC Frameworks                           |
| - Screenshot do Dashboard Executivo                      |
| - Screenshot do Diagnostico de Controles                 |
| - Screenshot da Matriz de Riscos                         |
| - Screenshot do Cofre de Evidencias                      |
| - Screenshot dos Planos de Acao                          |
|                                                          |
|----------------------------------------------------------|
|                                                          |
| SECAO 2: Modulo VRM (Fornecedores)                       |
| - Screenshot do Dashboard VRM                            |
| - Screenshot da Avaliacao de Fornecedor                  |
| - Screenshot do Radar de Conformidade                    |
| - Screenshot do Heat Map de Riscos                       |
|                                                          |
|----------------------------------------------------------|
|                                                          |
| SECAO 3: Recursos Avancados                              |
| - IA Generativa para Planos de Acao                      |
| - Mapeamento entre Frameworks                            |
| - Trilha de Auditoria                                    |
| - Relatorios PDF                                         |
|                                                          |
|----------------------------------------------------------|
|                                                          |
| CTA FINAL: "Quer ver ao vivo?"                           |
| [Solicitar Demonstracao]                                 |
|                                                          |
+----------------------------------------------------------+
```

### Componente de Feature Card com Screenshot:

```text
+----------------------------------------------------------+
|                                                          |
|  +---------------------+   +-------------------------+   |
|  |                     |   | Dashboard Executivo     |   |
|  |  [SCREENSHOT]       |   |                         |   |
|  |  Dashboard          |   | Visao consolidada de    |   |
|  |  Executivo          |   | conformidade com:       |   |
|  |                     |   | - Score de seguranca    |   |
|  |                     |   | - Metricas em tempo real|   |
|  |                     |   | - Grafico de tendencias |   |
|  |                     |   | - Alertas prioritarios  |   |
|  +---------------------+   +-------------------------+   |
|                                                          |
+----------------------------------------------------------+
```

### Screenshots Necessarios:

Para criar as imagens, sera necessario capturar prints das seguintes telas:
1. Dashboard GRC - Visao Executiva
2. Diagnostico - Lista de Controles
3. Riscos - Matriz 5x5
4. Evidencias - Cofre com pastas
5. Plano de Acao - Kanban Board
6. Dashboard VRM - Heat Map de Fornecedores
7. Avaliacao de Fornecedor - Formulario
8. Relatorio PDF - Preview

**Nota**: Os screenshots podem ser mockups inicialmente ou prints reais da aplicacao.

---

## 4. Secao de Preview na Landing (ProductTourSection.tsx)

Adicionar uma nova secao na Landing Page com galeria de telas:

```text
+----------------------------------------------------------+
| Veja a Plataforma em Acao                                 |
|----------------------------------------------------------|
|                                                          |
| [Tab: GRC] [Tab: VRM] [Tab: Avancado]                    |
|                                                          |
| +------------------------------------------------------+ |
| |                                                      | |
| |    [Screenshot em destaque com zoom hover]           | |
| |                                                      | |
| +------------------------------------------------------+ |
|                                                          |
| [Thumbnail 1] [Thumbnail 2] [Thumbnail 3] [Thumbnail 4] |
|                                                          |
|                  [Ver Tour Completo ->]                  |
|                                                          |
+----------------------------------------------------------+
```

---

## 5. Atualizacao do FAQ

### Perguntas a Remover/Modificar:
- "Como funciona o periodo de teste gratuito?" -> Remover
- Atualizar respostas sobre precos

### Novas Perguntas a Adicionar:
- "Como posso contratar a CosmoSec?"
- "Qual o processo de onboarding?"
- "Existe suporte para implantacao?"
- "Quais sao os planos disponiveis?"

---

## 6. Atualizacao do Navbar

```text
ANTES:
[Modulos] [Frameworks] [Funcionalidades] [Precos] [Documentacao]
                                           [Entrar] [Comecar Agora]

DEPOIS:
[Modulos] [Frameworks] [Funcionalidades] [Tour] [Documentacao]
                                      [Entrar] [Falar Conosco]
```

---

## 7. Modelo de Dados para Contatos

Nova tabela no Supabase:

```sql
CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT,
  company_size TEXT,
  how_found TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, contacted, converted, closed
  notes TEXT,
  contacted_at TIMESTAMPTZ,
  contacted_by UUID REFERENCES auth.users(id)
);

-- RLS: Apenas admins podem visualizar
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
```

---

## 8. Edge Function para Notificacao de Contato

Nova edge function `notify-contact-request`:

```typescript
// Envia email para equipe comercial quando novo contato e recebido
// Pode integrar com Slack, Discord, etc.
```

---

## Ordem de Implementacao

1. **Fase 1 - Estrutura Base**
   - Criar tabela `contact_requests`
   - Criar `ContactSection.tsx` com formulario
   - Atualizar `PricingSection.tsx` -> renomear/substituir

2. **Fase 2 - Pagina de Tour**
   - Criar `src/pages/TourProduto.tsx`
   - Criar componentes de showcase
   - Adicionar screenshots/placeholders

3. **Fase 3 - Atualizacoes de CTA**
   - Atualizar `HeroSection.tsx`
   - Atualizar `Navbar.tsx`
   - Atualizar `Footer.tsx`

4. **Fase 4 - Conteudo**
   - Atualizar `FAQSection.tsx`
   - Adicionar `ProductTourSection.tsx` na Landing

5. **Fase 5 - Backend**
   - Criar edge function de notificacao
   - Configurar email de notificacao

---

## Consideracoes de UX

1. **Formulario de contato deve ser simples** - Nao exigir muitos campos
2. **CTAs claros e visiveis** - "Falar com Especialista" e visual destacado
3. **Screenshots de alta qualidade** - Essenciais para credibilidade
4. **Responsividade** - Tour deve funcionar bem no mobile
5. **Loading states** - Feedback ao enviar formulario

---

## Screenshots Mockup (Placeholders)

Enquanto screenshots reais nao estao disponiveis, usar:
- Ilustracoes abstratas representando dashboards
- Cards com icones mostrando funcionalidades
- Texto descritivo com bullets de features

---

## Resultado Esperado

1. Landing page focada em conversao de leads qualificados
2. Processo comercial consultivo (demo -> proposta -> fechamento)
3. Pagina de Tour com detalhamento visual completo
4. Formulario de contato integrado ao backend
5. Notificacoes automaticas para equipe comercial
6. FAQ atualizado refletindo novo modelo de vendas

